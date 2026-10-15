"""
Django REST Framework ViewSets and API Views for Farm Produce Market
Includes permission enforcement for Farmer, Buyer, and Administrator roles.
"""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.utils import timezone
import uuid

from .models import (
    User, FarmerProfile, BuyerProfile, Produce, ProduceImage,
    MarketPrice, Negotiation, Order, Transaction, Conversation,
    Message, Dispute, Notification
)
from .serializers import (
    UserSerializer, FarmerProfileSerializer, BuyerProfileSerializer,
    ProduceSerializer, ProduceImageSerializer, MarketPriceSerializer,
    NegotiationSerializer, OrderSerializer, TransactionSerializer,
    ConversationSerializer, MessageSerializer, DisputeSerializer,
    NotificationSerializer
)


class IsAdminUserOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'admin'


class IsFarmerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'farmer'


# 1. AUTHENTICATION VIEWS
class RegisterAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        role = request.data.get('role', 'buyer')
        username = request.data.get('email', '')
        password = request.data.get('password', '')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        phone = request.data.get('phone', '')
        county = request.data.get('county', '')
        location = request.data.get('location', '')

        if not username or not password:
            return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'User with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=username,
            email=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=role,
            phone=phone,
            county=county,
            location=location
        )

        if role == 'farmer':
            FarmerProfile.objects.create(
                user=user,
                farm_name=request.data.get('farm_name', f"{first_name}'s Farm"),
                farm_size=request.data.get('farm_size', '5 Acres'),
                crops_grown=request.data.get('crops_grown', [])
            )
        elif role == 'buyer':
            BuyerProfile.objects.create(
                user=user,
                business_name=request.data.get('business_name', f"{first_name}'s Sourcing"),
                buyer_type=request.data.get('buyer_type', 'Wholesaler')
            )

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class LoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(username=email, password=password)

        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        if user.status == 'suspended':
            return Response({'error': 'Account suspended by administrator.'}, status=status.HTTP_403_FORBIDDEN)

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })


# 2. PRODUCE VIEWSET
class ProduceViewSet(viewsets.ModelViewSet):
    queryset = Produce.objects.all().select_related('farmer')
    serializer_class = ProduceSerializer

    def get_queryset(self):
        queryset = Produce.objects.filter(approval_status='Approved')
        # Admin can view all statuses, Farmers can view their own
        if self.request.user.is_authenticated:
            if self.request.user.role == 'admin':
                queryset = Produce.objects.all()
            elif self.request.user.role == 'farmer':
                queryset = Produce.objects.filter(models.Q(approval_status='Approved') | models.Q(farmer=self.request.user))

        # Search and filters
        category = self.request.query_params.get('category')
        county = self.request.query_params.get('county')
        search = self.request.query_params.get('search')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        availability = self.request.query_params.get('availability')
        ordering = self.request.query_params.get('ordering', '-created_at')

        if category:
            queryset = queryset.filter(category=category)
        if county:
            queryset = queryset.filter(county=county)
        if search:
            queryset = queryset.filter(models.Q(name__icontains=search) | models.Q(description__icontains=search))
        if min_price:
            queryset = queryset.filter(price_per_unit__gte=min_price)
        if max_price:
            queryset = queryset.filter(price_per_unit__lte=max_price)
        if availability:
            queryset = queryset.filter(availability_status=availability)

        return queryset.order_by(ordering)

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        produce = self.get_object()
        produce.approval_status = 'Approved'
        produce.save()
        return Response({'status': 'Produce listing approved'})

    @action(detail=True, methods=['post'])
    def mark_sold(self, request, pk=None):
        produce = self.get_object()
        if produce.farmer != request.user and request.user.role != 'admin':
            return Response({'error': 'Unauthorized'}, status=403)
        produce.availability_status = 'Sold'
        produce.quantity = 0
        produce.save()
        return Response({'status': 'Listing marked as sold'})


# 3. NEGOTIATION VIEWSET
class NegotiationViewSet(viewsets.ModelViewSet):
    serializer_class = NegotiationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'farmer':
            return Negotiation.objects.filter(farmer=user)
        elif user.role == 'buyer':
            return Negotiation.objects.filter(buyer=user)
        return Negotiation.objects.all()

    @action(detail=True, methods=['post'])
    def counter_offer(self, request, pk=None):
        neg = self.get_object()
        counter_price = request.data.get('counter_price')
        counter_qty = request.data.get('counter_quantity', neg.desired_quantity)
        message = request.data.get('message', '')

        neg.counter_price = counter_price
        neg.counter_quantity = counter_qty
        neg.status = 'countered'
        neg.history.append({
            'sender': request.user.get_full_name(),
            'role': request.user.role,
            'type': 'counter',
            'price': counter_price,
            'quantity': counter_qty,
            'message': message,
            'timestamp': timezone.now().isoformat()
        })
        neg.save()
        return Response(NegotiationSerializer(neg).data)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        neg = self.get_object()
        agreed_price = neg.counter_price or neg.proposed_price
        agreed_qty = neg.counter_quantity or neg.desired_quantity
        total = agreed_price * agreed_qty

        neg.status = 'accepted'
        neg.save()

        # Generate Order automatically
        order = Order.objects.create(
            order_number=f"ORD-{uuid.uuid4().hex[:6].upper()}",
            buyer=neg.buyer,
            farmer=neg.farmer,
            produce=neg.produce,
            negotiation=neg,
            quantity=agreed_qty,
            unit=neg.produce.unit,
            agreed_price=agreed_price,
            total_amount=total,
            delivery_location=neg.buyer.location or "Designated Hub",
            county=neg.produce.county,
            status='Accepted',
            payment_status='Escrow Secured'
        )

        return Response({
            'message': 'Offer accepted and order generated successfully',
            'order': OrderSerializer(order).data
        })


# 4. ORDER & TRANSACTION VIEWSETS
class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'farmer':
            return Order.objects.filter(farmer=user)
        elif user.role == 'buyer':
            return Order.objects.filter(buyer=user)
        return Order.objects.all()

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        note = request.data.get('note', f"Status updated to {new_status}")

        order.status = new_status
        order.tracking_notes.append({
            'status': new_status,
            'note': note,
            'timestamp': timezone.now().isoformat()
        })
        order.save()
        return Response(OrderSerializer(order).data)


# 5. MARKET PRICE VIEWSET
class MarketPriceViewSet(viewsets.ModelViewSet):
    queryset = MarketPrice.objects.all()
    serializer_class = MarketPriceSerializer
    permission_classes = [IsAdminUserOrReadOnly]
