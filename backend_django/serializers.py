"""
Django REST Framework Serializers for Farm Produce Market
"""

from rest_framework import serializers
from .models import (
    User, FarmerProfile, BuyerProfile, Produce, ProduceImage,
    MarketPrice, Negotiation, Order, Transaction, Conversation,
    Message, Dispute, Notification, Review
)


class FarmerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FarmerProfile
        fields = '__all__'


class BuyerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuyerProfile
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    farmer_profile = FarmerProfileSerializer(read_only=True)
    buyer_profile = BuyerProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'county', 'location', 'avatar', 'status', 'farmer_profile', 'buyer_profile', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProduceImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProduceImage
        fields = ['id', 'image', 'image_url', 'is_primary', 'uploaded_at']


class ProduceSerializer(serializers.ModelSerializer):
    images = ProduceImageSerializer(many=True, read_only=True)
    farmer_name = serializers.CharField(source='farmer.get_full_name', read_only=True)
    farmer_phone = serializers.CharField(source='farmer.phone', read_only=True)
    farmer_rating = serializers.DecimalField(source='farmer.farmer_profile.rating', max_digits=3, decimal_places=2, read_only=True)
    farmer_verified = serializers.BooleanField(source='farmer.farmer_profile.is_verified', read_only=True)

    class Meta:
        model = Produce
        fields = '__all__'
        read_only_fields = ['id', 'farmer', 'created_at', 'updated_at', 'views_count', 'inquiries_count']


class MarketPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketPrice
        fields = '__all__'


class NegotiationSerializer(serializers.ModelSerializer):
    buyer_name = serializers.CharField(source='buyer.get_full_name', read_only=True)
    farmer_name = serializers.CharField(source='farmer.get_full_name', read_only=True)
    produce_name = serializers.CharField(source='produce.name', read_only=True)

    class Meta:
        model = Negotiation
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class OrderSerializer(serializers.ModelSerializer):
    buyer_name = serializers.CharField(source='buyer.get_full_name', read_only=True)
    farmer_name = serializers.CharField(source='farmer.get_full_name', read_only=True)
    produce_name = serializers.CharField(source='produce.name', read_only=True)

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['id', 'order_number', 'created_at', 'updated_at']


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    receiver_name = serializers.CharField(source='receiver.get_full_name', read_only=True)

    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ['id', 'timestamp']


class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = '__all__'


class DisputeSerializer(serializers.ModelSerializer):
    buyer_name = serializers.CharField(source='buyer.get_full_name', read_only=True)
    farmer_name = serializers.CharField(source='farmer.get_full_name', read_only=True)
    order_number = serializers.CharField(source='order.order_number', read_only=True)

    class Meta:
        model = Dispute
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'


class ReviewSerializer(serializers.ModelSerializer):
    buyer_name = serializers.CharField(source='buyer.get_full_name', read_only=True)

    class Meta:
        model = Review
        fields = '__all__'
