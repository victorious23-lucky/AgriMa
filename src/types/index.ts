export type UserRole = 'farmer' | 'buyer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'active' | 'suspended';
  avatar: string;
  county: string;
  location: string;
  isVerified?: boolean;
  farmName?: string;
  farmSize?: string;
  cropsGrown?: string[];
  businessName?: string;
  buyerType?: 'Retailer' | 'Wholesaler' | 'Household' | 'Processor' | 'Supermarket';
  bio?: string;
  joinedDate: string;
  latitude?: number;
  longitude?: number;
}

export interface Produce {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerCounty: string;
  farmerPhone: string;
  farmerRating: number;
  farmerVerified: boolean;
  name: string;
  category: ProduceCategory;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  location: string;
  county: string;
  latitude?: number;
  longitude?: number;
  harvestDate: string;
  availabilityStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Sold';
  approvalStatus: 'Approved' | 'Pending' | 'Suspended';
  description: string;
  images: string[];
  inquiriesCount: number;
  minOrderQuantity: number;
  createdAt: string;
  views?: number;
}

export type ProduceCategory =
  | 'Cereals & Grains'
  | 'Vegetables'
  | 'Fruits'
  | 'Legumes & Pulses'
  | 'Tubers & Roots'
  | 'Herbs & Spices';

export interface NegotiationHistoryItem {
  senderId: string;
  senderName: string;
  senderRole: 'buyer' | 'farmer';
  type: 'offer' | 'counter' | 'accept' | 'reject';
  price: number;
  quantity: number;
  message: string;
  timestamp: string;
}

export interface Negotiation {
  id: string;
  produceId: string;
  produceName: string;
  produceImage: string;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  farmerName: string;
  unit: string;
  originalPrice: number;
  desiredQuantity: number;
  proposedPrice: number;
  counterPrice?: number;
  counterQuantity?: number;
  status: 'pending' | 'countered' | 'accepted' | 'rejected';
  history: NegotiationHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Negotiating'
  | 'Accepted'
  | 'Preparing'
  | 'Ready for Collection'
  | 'In Transit'
  | 'Completed'
  | 'Cancelled'
  | 'Disputed';

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  produceId: string;
  produceName: string;
  produceImage: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalAmount: number;
  deliveryLocation: string;
  county: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  farmLatitude?: number;
  farmLongitude?: number;
  orderDate: string;
  status: OrderStatus;
  paymentStatus: 'Pending' | 'Escrow Secured' | 'Paid Out' | 'Refunded';
  notes?: string;
  negotiationId?: string;
  trackingUpdates: { status: OrderStatus; note: string; timestamp: string }[];
}

export interface Transaction {
  id: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  farmerName: string;
  produceName: string;
  amount: number;
  type: 'sale' | 'purchase' | 'refund' | 'payout';
  status: 'completed' | 'pending' | 'cancelled';
  paymentMethod: 'M-Pesa / Mobile Money' | 'Bank Transfer' | 'Escrow Guarantee';
  referenceCode: string;
  date: string;
}

export type DisputeReason =
  | 'Quality issue'
  | 'Wrong quantity'
  | 'Delayed shipment'
  | 'Produce damaged in transit'
  | 'Non-delivery'
  | 'Price discrepancy'
  | 'Produce quality mismatch'
  | 'Damaged in transit'
  | 'Quantity shortfall'
  | 'Late delivery'
  | 'Payment issue'
  | 'Other';

export interface MarketPrice {
  id: string;
  crop: string;
  category: ProduceCategory;
  unit: string;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  location?: string;
  market?: string;
  county: string;
  latitude?: number;
  longitude?: number;
  trend: 'up' | 'down' | 'stable' | 'rising' | 'falling';
  changePercentage?: number;
  dateUpdated?: string;
  lastUpdated?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  receiverId: string;
  receiverName: string;
  produceId?: string;
  produceName?: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participants: {
    id: string;
    name: string;
    role: UserRole;
    avatar: string;
  }[];
  produceId?: string;
  produceName?: string;
  lastMessage?: string;
  lastMessageTimestamp?: string;
  unreadCount?: Record<string, number>;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type:
    | 'message'
    | 'order'
    | 'offer'
    | 'counter'
    | 'market_price'
    | 'status_change'
    | 'dispute'
    | 'verification';
  relatedId?: string;
  read: boolean;
  createdAt: string;
}

export interface DisputeAuditItem {
  action: string;
  note: string;
  timestamp: string;
  adminName: string;
}

export interface Dispute {
  id: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  farmerName: string;
  produceName: string;
  reason:
    | 'Quality issue'
    | 'Wrong quantity'
    | 'Delayed shipment'
    | 'Produce damaged in transit'
    | 'Non-delivery'
    | 'Price discrepancy'
    | 'Other';
  description: string;
  evidenceUrls?: string[];
  status:
    | 'Open'
    | 'Under Review'
    | 'Under Investigation'
    | 'Resolved'
    | 'Resolved - Buyer Refunded'
    | 'Resolved - Farmer Paid'
    | 'Closed';
  adminDecision?: string;
  conversationId?: string;
  auditTrail?: DisputeAuditItem[];
  createdAt: string;
  resolutionDate?: string;
}

export interface Review {
  id: string;
  farmerId: string;
  buyerId: string;
  buyerName: string;
  produceId: string;
  rating: number;
  comment: string;
  createdAt: string;
}
