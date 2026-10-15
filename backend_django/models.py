"""
Django Models for Farm Produce Market
Compatible with SQLite (development) and PostgreSQL (production).
"""

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class User(AbstractUser):
    """
    Custom User supporting Farmer, Buyer, and Administrator roles with unified authentication.
    """
    ROLE_CHOICES = (
        ('farmer', 'Farmer'),
        ('buyer', 'Buyer'),
        ('admin', 'Administrator'),
    )
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('suspended', 'Suspended'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='buyer')
    phone = models.CharField(max_length=20, blank=True)
    county = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=255, blank=True)
    avatar = models.URLField(max_length=500, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"


class FarmerProfile(models.Model):
    """
    Profile specific to Farmers with farm verification, scale, and crops cultivated.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='farmer_profile')
    farm_name = models.CharField(max_length=200)
    farm_size = models.CharField(max_length=100, blank=True, help_text="e.g. '15 Acres'")
    crops_grown = models.JSONField(default=list, blank=True)
    is_verified = models.BooleanField(default=False)
    verification_documents = models.FileField(upload_to='farmer_verifications/', blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.00)
    total_sales_count = models.PositiveIntegerField(default=0)
    bio = models.TextField(blank=True)

    def __str__(self):
        return f"{self.farm_name} - {self.user.get_full_name()}"


class BuyerProfile(models.Model):
    """
    Profile specific to agricultural produce Buyers (Wholesalers, Retailers, Processors).
    """
    BUYER_TYPE_CHOICES = (
        ('Retailer', 'Retailer'),
        ('Wholesaler', 'Wholesaler'),
        ('Household', 'Household Consumer'),
        ('Processor', 'Food Processor / Manufacturer'),
        ('Supermarket', 'Supermarket / Chain Grocer'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='buyer_profile')
    business_name = models.CharField(max_length=200, blank=True)
    buyer_type = models.CharField(max_length=50, choices=BUYER_TYPE_CHOICES, default='Wholesaler')
    preferred_delivery_address = models.TextField(blank=True)
    total_purchases_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.business_name or self.user.get_full_name()} ({self.buyer_type})"


class Produce(models.Model):
    """
    Agricultural produce item listed directly by a verified farmer.
    """
    CATEGORY_CHOICES = (
        ('Cereals & Grains', 'Cereals & Grains'),
        ('Vegetables', 'Vegetables'),
        ('Fruits', 'Fruits'),
        ('Legumes & Pulses', 'Legumes & Pulses'),
        ('Tubers & Roots', 'Tubers & Roots'),
        ('Herbs & Spices', 'Herbs & Spices'),
    )
    AVAILABILITY_CHOICES = (
        ('In Stock', 'In Stock'),
        ('Low Stock', 'Low Stock'),
        ('Out of Stock', 'Out of Stock'),
        ('Sold', 'Sold'),
    )
    APPROVAL_CHOICES = (
        ('Approved', 'Approved'),
        ('Pending', 'Pending Review'),
        ('Suspended', 'Suspended'),
    )

    farmer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='produce_listings')
    name = models.CharField(max_length=200, db_index=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, db_index=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    unit = models.CharField(max_length=50, help_text="e.g. 'kg', '90kg bags', 'crates'")
    price_per_unit = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    location = models.CharField(max_length=200)
    county = models.CharField(max_length=100, db_index=True)
    harvest_date = models.DateField()
    availability_status = models.CharField(max_length=30, choices=AVAILABILITY_CHOICES, default='In Stock')
    approval_status = models.CharField(max_length=30, choices=APPROVAL_CHOICES, default='Approved')
    description = models.TextField()
    min_order_quantity = models.PositiveIntegerField(default=1)
    views_count = models.PositiveIntegerField(default=0)
    inquiries_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category', 'county', 'price_per_unit']),
        ]

    def __str__(self):
        return f"{self.name} - {self.quantity} {self.unit} @ KES {self.price_per_unit}"


class ProduceImage(models.Model):
    """
    Multiple image support for produce listings.
    """
    produce = models.ForeignKey(Produce, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='produce_images/')
    image_url = models.URLField(max_length=500, blank=True)
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.produce.name}"


class MarketPrice(models.Model):
    """
    Official agricultural reference market prices across Kenyan wholesale markets and counties.
    """
    TREND_CHOICES = (
        ('up', 'Upward Trend'),
        ('down', 'Downward Trend'),
        ('stable', 'Stable Price'),
    )

    crop = models.CharField(max_length=150, db_index=True)
    category = models.CharField(max_length=50, choices=Produce.CATEGORY_CHOICES)
    unit = models.CharField(max_length=50)
    average_price = models.DecimalField(max_digits=12, decimal_places=2)
    min_price = models.DecimalField(max_digits=12, decimal_places=2)
    max_price = models.DecimalField(max_digits=12, decimal_places=2)
    location = models.CharField(max_length=200)
    county = models.CharField(max_length=100)
    trend = models.CharField(max_length=10, choices=TREND_CHOICES, default='stable')
    change_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='market_updates')
    date_updated = models.DateField(default=timezone.now)

    class Meta:
        ordering = ['crop']

    def __str__(self):
        return f"{self.crop} - Avg KES {self.average_price} ({self.location})"


class Negotiation(models.Model):
    """
    Direct price negotiation and counter-offering thread between buyer and farmer.
    """
    STATUS_CHOICES = (
        ('pending', 'Pending Farmer Review'),
        ('countered', 'Counter-Offer Submitted'),
        ('accepted', 'Offer Agreed'),
        ('rejected', 'Offer Declined'),
    )

    produce = models.ForeignKey(Produce, on_delete=models.CASCADE, related_name='negotiations')
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='buyer_negotiations')
    farmer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='farmer_negotiations')
    original_price = models.DecimalField(max_digits=12, decimal_places=2)
    desired_quantity = models.DecimalField(max_digits=10, decimal_places=2)
    proposed_price = models.DecimalField(max_digits=12, decimal_places=2)
    counter_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    counter_quantity = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    history = models.JSONField(default=list, help_text="Audit log of offers, counters, and comments")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Negotiation #{self.id} on {self.produce.name} by {self.buyer.username}"


class Order(models.Model):
    """
    Order lifecycle from negotiation/direct purchase through collection, transit, and escrow payout.
    """
    STATUS_CHOICES = (
        ('Pending', 'Pending Confirmation'),
        ('Negotiating', 'Under Negotiation'),
        ('Accepted', 'Accepted & Confirmed'),
        ('Preparing', 'Preparing / Harvesting'),
        ('Ready for Collection', 'Ready for Collection'),
        ('In Transit', 'In Transit / On Delivery'),
        ('Completed', 'Completed / Delivered'),
        ('Cancelled', 'Cancelled'),
        ('Disputed', 'Under Dispute'),
    )
    PAYMENT_STATUS_CHOICES = (
        ('Pending', 'Pending Payment'),
        ('Escrow Secured', 'Escrow Funds Secured'),
        ('Paid Out', 'Funds Paid Out to Farmer'),
        ('Refunded', 'Refunded to Buyer'),
    )

    order_number = models.CharField(max_length=50, unique=True, db_index=True)
    buyer = models.ForeignKey(User, on_delete=models.PROTECT, related_name='buyer_orders')
    farmer = models.ForeignKey(User, on_delete=models.PROTECT, related_name='farmer_orders')
    produce = models.ForeignKey(Produce, on_delete=models.PROTECT, related_name='orders')
    negotiation = models.OneToOneField(Negotiation, on_delete=models.SET_NULL, null=True, blank=True, related_name='resulting_order')
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50)
    agreed_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    delivery_location = models.CharField(max_length=255)
    county = models.CharField(max_length=100)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Pending')
    payment_status = models.CharField(max_length=30, choices=PAYMENT_STATUS_CHOICES, default='Escrow Secured')
    tracking_notes = models.JSONField(default=list)
    special_instructions = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.order_number} - {self.produce.name} (KES {self.total_amount})"


class Transaction(models.Model):
    """
    Financial transaction record tracking escrow deposits, farmer payouts, and refunds.
    """
    TYPE_CHOICES = (
        ('sale', 'Produce Sale Payment'),
        ('purchase', 'Produce Purchase Debit'),
        ('payout', 'Farmer Payout'),
        ('refund', 'Buyer Refund'),
    )
    STATUS_CHOICES = (
        ('completed', 'Completed'),
        ('pending', 'Pending Clearing'),
        ('cancelled', 'Cancelled'),
    )
    PAYMENT_METHOD_CHOICES = (
        ('M-Pesa / Mobile Money', 'M-Pesa / Mobile Money'),
        ('Bank Transfer', 'Bank Transfer (EFT/RTGS)'),
        ('Escrow Guarantee', 'Escrow Platform Guarantee'),
    )

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='transactions')
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='buyer_transactions')
    farmer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='farmer_transactions')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES, default='Escrow Guarantee')
    reference_code = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.reference_code} - KES {self.amount} ({self.status})"


class Conversation(models.Model):
    """
    Messaging thread between farmer and buyer, linked optionally to specific produce.
    """
    participants = models.ManyToManyField(User, related_name='conversations')
    produce = models.ForeignKey(Produce, on_delete=models.SET_NULL, null=True, blank=True, related_name='conversations')
    last_message = models.TextField(blank=True)
    last_message_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Conversation #{self.id} on {self.produce or 'General Inquiry'}"


class Message(models.Model):
    """
    Individual chat messages in in-app communication module.
    """
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"Msg from {self.sender.username} to {self.receiver.username}"


class Dispute(models.Model):
    """
    Order dispute filed by buyer or farmer, resolved by Platform Administrator.
    """
    REASON_CHOICES = (
        ('Quality issue', 'Produce Quality Below Stated Grade'),
        ('Wrong quantity', 'Incorrect Weight or Count'),
        ('Delayed shipment', 'Excessive Transit Delay with Spoilage'),
        ('Produce damaged in transit', 'Physical Damage during Transport'),
        ('Non-delivery', 'Consignment Not Received'),
        ('Price discrepancy', 'Discrepancy in Agreed Price'),
        ('Other', 'Other Issue'),
    )
    STATUS_CHOICES = (
        ('Open', 'Dispute Opened'),
        ('Under Investigation', 'Administrator Investigating'),
        ('Resolved - Buyer Refunded', 'Resolved: Buyer Refunded'),
        ('Resolved - Farmer Paid', 'Resolved: Farmer Paid'),
        ('Closed', 'Dispute Closed'),
    )

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='disputes')
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='filed_disputes')
    farmer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_disputes')
    reason = models.CharField(max_length=50, choices=REASON_CHOICES)
    description = models.TextField()
    evidence_urls = models.JSONField(default=list, blank=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Open')
    admin_decision = models.TextField(blank=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_disputes')
    resolution_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Dispute #{self.id} on Order {self.order.order_number}"


class Notification(models.Model):
    """
    In-app alert for orders, messages, counter-offers, market updates, and disputes.
    """
    TYPE_CHOICES = (
        ('message', 'Message'),
        ('order', 'Order'),
        ('offer', 'Price Offer'),
        ('counter', 'Counter Offer'),
        ('market_price', 'Market Benchmark'),
        ('status_change', 'Status Change'),
        ('dispute', 'Dispute'),
        ('verification', 'Account Verification'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    related_id = models.CharField(max_length=100, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.username}: {self.title}"


class Review(models.Model):
    """
    Buyer review and feedback on farmer produce and service reliability.
    """
    farmer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='farmer_reviews')
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_reviews')
    produce = models.ForeignKey(Produce, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviews')
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.rating} Stars by {self.buyer.username} for {self.farmer.username}"
