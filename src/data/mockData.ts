import { User, Produce, Order, Negotiation, MarketPrice, Message, Conversation, Notification, Dispute, Transaction } from '../types';

export const COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa',
  'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi',
  'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu',
  'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa',
  'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
  'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi',
  'Trans-Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
];

export const PRODUCE_CATEGORIES = [
  'Cereals & Grains',
  'Vegetables',
  'Fruits',
  'Legumes & Pulses',
  'Tubers & Roots',
  'Herbs & Spices'
] as const;

export const INITIAL_USERS: User[] = [
  {
    id: 'user-farmer-1',
    name: 'David Kiprop',
    email: 'david.farmer@farmmarket.co.ke',
    phone: '+254 712 345 678',
    role: 'farmer',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    county: 'Uasin Gishu',
    location: 'Moiben, Eldoret',
    isVerified: true,
    farmName: 'Highland Ridge Organic Farm',
    farmSize: '15 Acres',
    cropsGrown: ['Maize', 'Potatoes', 'Carrots', 'Cabbage'],
    bio: 'Third-generation grain and tuber grower dedicated to regenerative soil practices and fair farmgate pricing.',
    joinedDate: '2024-03-15'
  },
  {
    id: 'user-farmer-2',
    name: 'Grace Muthoni',
    email: 'grace.muthoni@farmmarket.co.ke',
    phone: '+254 723 456 789',
    role: 'farmer',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    county: 'Kirinyaga',
    location: 'Mwea, Wang\'uru',
    isVerified: true,
    farmName: 'Green Valley Horticultural Project',
    farmSize: '8 Acres',
    cropsGrown: ['Tomatoes', 'French Beans', 'Watermelon', 'Onions'],
    bio: 'Specialist in greenhouse tomatoes and open field drip-irrigated legumes with GlobalGAP quality certification.',
    joinedDate: '2024-05-10'
  },
  {
    id: 'user-buyer-1',
    name: 'Sarah Wambui',
    email: 'sarah.buyer@farmmarket.co.ke',
    phone: '+254 734 567 890',
    role: 'buyer',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    county: 'Nairobi',
    location: 'Westlands / Kangemi Wholesale Hub',
    businessName: 'Nairobi Fresh Grocers & Supplies',
    buyerType: 'Wholesaler',
    bio: 'Bulk procurer supplying 24 restaurants, 3 educational institutions, and retail greengrocer kiosks across Nairobi.',
    joinedDate: '2024-04-02'
  },
  {
    id: 'user-buyer-2',
    name: 'Joseph Omondi',
    email: 'joseph.omondi@farmmarket.co.ke',
    phone: '+254 745 678 901',
    role: 'buyer',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    county: 'Kisumu',
    location: 'Jubilee Market, Kisumu CBD',
    businessName: 'Lakeside Food Distributors',
    buyerType: 'Retailer',
    bio: 'Fresh produce distributor linking Western Kenya bulk markets with farmgate harvests.',
    joinedDate: '2024-06-18'
  },
  {
    id: 'user-admin-1',
    name: 'Alex Mwangi',
    email: 'admin@farmmarket.co.ke',
    phone: '+254 700 112 233',
    role: 'admin',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    county: 'Nairobi',
    location: 'Agricultural Innovation Tower, Upper Hill',
    bio: 'Senior Agricultural Systems Administrator overseeing marketplace fairness, dispute arbitration, and market data integrity.',
    joinedDate: '2024-01-01'
  }
];

export const INITIAL_PRODUCE: Produce[] = [
  {
    id: 'prod-1',
    farmerId: 'user-farmer-1',
    farmerName: 'David Kiprop',
    farmerCounty: 'Uasin Gishu',
    farmerPhone: '+254 712 345 678',
    farmerRating: 4.9,
    farmerVerified: true,
    name: 'Dry White Maize Grain (90kg Bags)',
    category: 'Cereals & Grains',
    quantity: 450,
    unit: 'bags (90kg)',
    pricePerUnit: 3400,
    location: 'Moiben Depot',
    county: 'Uasin Gishu',
    harvestDate: '2026-08-20',
    availabilityStatus: 'In Stock',
    approvalStatus: 'Approved',
    description: 'Clean, well-dried Grade 1 White Maize with 13% standard moisture content. Fumigated and packed in brand new sisal bags. Excellent for commercial millers and wholesale feed/food preparation.',
    images: [
      'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800&auto=format&fit=crop&q=80'
    ],
    inquiriesCount: 14,
    minOrderQuantity: 10,
    createdAt: '2026-08-25',
    views: 312
  },
  {
    id: 'prod-2',
    farmerId: 'user-farmer-1',
    farmerName: 'David Kiprop',
    farmerCounty: 'Uasin Gishu',
    farmerPhone: '+254 712 345 678',
    farmerRating: 4.9,
    farmerVerified: true,
    name: 'Fresh Shangi Irish Potatoes',
    category: 'Tubers & Roots',
    quantity: 180,
    unit: 'bags (50kg)',
    pricePerUnit: 2800,
    location: 'Eldoret Sub-county Hub',
    county: 'Uasin Gishu',
    harvestDate: '2026-09-02',
    availabilityStatus: 'In Stock',
    approvalStatus: 'Approved',
    description: 'Freshly harvested large cooking and crisping Shangi potatoes. Firm skin, minimal soil, sorted for uniform size. Perfect for chips vendors, hotels, and retail stores.',
    images: [
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508747703725-719777637510?w=800&auto=format&fit=crop&q=80'
    ],
    inquiriesCount: 9,
    minOrderQuantity: 5,
    createdAt: '2026-09-04',
    views: 245
  },
  {
    id: 'prod-3',
    farmerId: 'user-farmer-2',
    farmerName: 'Grace Muthoni',
    farmerCounty: 'Kirinyaga',
    farmerPhone: '+254 723 456 789',
    farmerRating: 4.8,
    farmerVerified: true,
    name: 'Plum Anna F1 Salad Tomatoes',
    category: 'Vegetables',
    quantity: 65,
    unit: 'crates (60kg)',
    pricePerUnit: 3600,
    location: 'Wang\'uru Collection Center',
    county: 'Kirinyaga',
    harvestDate: '2026-09-10',
    availabilityStatus: 'In Stock',
    approvalStatus: 'Approved',
    description: 'Bright red, firm-textured Anna F1 tomatoes grown under integrated pest management. Long shelf life of 12-14 days. Carefully packaged in sanitized wooden crates with foam cushioning.',
    images: [
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546470427-227c7369a9b7?w=800&auto=format&fit=crop&q=80'
    ],
    inquiriesCount: 22,
    minOrderQuantity: 2,
    createdAt: '2026-09-11',
    views: 480
  },
  {
    id: 'prod-4',
    farmerId: 'user-farmer-2',
    farmerName: 'Grace Muthoni',
    farmerCounty: 'Kirinyaga',
    farmerPhone: '+254 723 456 789',
    farmerRating: 4.8,
    farmerVerified: true,
    name: 'Red Bombay Hybrid Onions',
    category: 'Vegetables',
    quantity: 120,
    unit: 'net bags (25kg)',
    pricePerUnit: 2200,
    location: 'Mwea Drip Farm',
    county: 'Kirinyaga',
    harvestDate: '2026-08-28',
    availabilityStatus: 'In Stock',
    approvalStatus: 'Approved',
    description: 'Cured sun-dried red Bombay onions with tight papery skins. High pungency, exceptional storage durability up to 3 months in well-ventilated conditions.',
    images: [
      'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=800&auto=format&fit=crop&q=80'
    ],
    inquiriesCount: 16,
    minOrderQuantity: 4,
    createdAt: '2026-08-30',
    views: 389
  },
  {
    id: 'prod-5',
    farmerId: 'user-farmer-1',
    farmerName: 'David Kiprop',
    farmerCounty: 'Uasin Gishu',
    farmerPhone: '+254 712 345 678',
    farmerRating: 4.9,
    farmerVerified: true,
    name: 'Gloria F1 Sugarloaf Cabbages',
    category: 'Vegetables',
    quantity: 350,
    unit: 'heads',
    pricePerUnit: 65,
    location: 'Moiben Green Plots',
    county: 'Uasin Gishu',
    harvestDate: '2026-09-08',
    availabilityStatus: 'In Stock',
    approvalStatus: 'Approved',
    description: 'Dense, crisp green cabbage heads averaging 2.5kg to 3.2kg each. Cut fresh on the morning of pickup or delivery dispatch.',
    images: [
      'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550950158-d0d960dff51b?w=800&auto=format&fit=crop&q=80'
    ],
    inquiriesCount: 8,
    minOrderQuantity: 50,
    createdAt: '2026-09-08',
    views: 190
  },
  {
    id: 'prod-6',
    farmerId: 'user-farmer-2',
    farmerName: 'Grace Muthoni',
    farmerCounty: 'Kirinyaga',
    farmerPhone: '+254 723 456 789',
    farmerRating: 4.8,
    farmerVerified: true,
    name: 'Rosecoco (GLP-2) Red Speckled Dry Beans',
    category: 'Legumes & Pulses',
    quantity: 90,
    unit: 'bags (90kg)',
    pricePerUnit: 8500,
    location: 'Mwea Depot',
    county: 'Kirinyaga',
    harvestDate: '2026-08-15',
    availabilityStatus: 'In Stock',
    approvalStatus: 'Approved',
    description: 'Triple-winnowed, hand-sorted Rosecoco dry beans. Free from weevils or stone debris. Superior fast-boiling quality cherished by boarding schools and institutional caterers.',
    images: [
      'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=800&auto=format&fit=crop&q=80'
    ],
    inquiriesCount: 19,
    minOrderQuantity: 2,
    createdAt: '2026-08-18',
    views: 520
  },
  {
    id: 'prod-7',
    farmerId: 'user-farmer-1',
    farmerName: 'David Kiprop',
    farmerCounty: 'Uasin Gishu',
    farmerPhone: '+254 712 345 678',
    farmerRating: 4.9,
    farmerVerified: true,
    name: 'Nantes Sweet Orange Carrots',
    category: 'Vegetables',
    quantity: 80,
    unit: 'bags (70kg)',
    pricePerUnit: 3100,
    location: 'Plateau Cold Store',
    county: 'Uasin Gishu',
    harvestDate: '2026-09-06',
    availabilityStatus: 'In Stock',
    approvalStatus: 'Approved',
    description: 'Washed and graded cylindrical Nantes carrots with bright orange cores. Sweet flavor with crunchy texture suitable for salads and juicing bars.',
    images: [
      'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&auto=format&fit=crop&q=80'
    ],
    inquiriesCount: 7,
    minOrderQuantity: 2,
    createdAt: '2026-09-07',
    views: 175
  },
  {
    id: 'prod-8',
    farmerId: 'user-farmer-2',
    farmerName: 'Grace Muthoni',
    farmerCounty: 'Kirinyaga',
    farmerPhone: '+254 723 456 789',
    farmerRating: 4.8,
    farmerVerified: true,
    name: 'Hass Export-Grade Fresh Avocados',
    category: 'Fruits',
    quantity: 250,
    unit: 'crates (10kg)',
    pricePerUnit: 1400,
    location: 'Wang\'uru Packhouse',
    county: 'Kirinyaga',
    harvestDate: '2026-09-09',
    availabilityStatus: 'In Stock',
    approvalStatus: 'Approved',
    description: 'Rich oil content (24%+), mature harvest Hass avocados. Uniform calibers 16, 18, and 20. Stored under temperature-controlled airflow ready for immediate freight or local supply.',
    images: [
      'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1601039641847-7857b994d704?w=800&auto=format&fit=crop&q=80'
    ],
    inquiriesCount: 31,
    minOrderQuantity: 5,
    createdAt: '2026-09-09',
    views: 610
  }
];

export const INITIAL_MARKET_PRICES: MarketPrice[] = [
  {
    id: 'mp-1',
    crop: 'Dry White Maize',
    category: 'Cereals & Grains',
    unit: '90kg bag',
    averagePrice: 3550,
    minPrice: 3300,
    maxPrice: 3800,
    location: 'Nairobi / Eldoret / Nakuru Hubs',
    county: 'National Average',
    trend: 'down',
    changePercentage: -3.2,
    dateUpdated: '2026-09-13'
  },
  {
    id: 'mp-2',
    crop: 'Plum Tomatoes',
    category: 'Vegetables',
    unit: '64kg wooden crate',
    averagePrice: 3750,
    minPrice: 3200,
    maxPrice: 4200,
    location: 'Marikiti Wholesale Market',
    county: 'Nairobi',
    trend: 'up',
    changePercentage: 6.8,
    dateUpdated: '2026-09-14'
  },
  {
    id: 'mp-3',
    crop: 'Shangi Potatoes',
    category: 'Tubers & Roots',
    unit: '50kg bag',
    averagePrice: 2900,
    minPrice: 2600,
    maxPrice: 3250,
    location: 'Wakash Bazaar',
    county: 'Nakuru',
    trend: 'stable',
    changePercentage: 0.5,
    dateUpdated: '2026-09-12'
  },
  {
    id: 'mp-4',
    crop: 'Rosecoco Dry Beans',
    category: 'Legumes & Pulses',
    unit: '90kg bag',
    averagePrice: 8700,
    minPrice: 8200,
    maxPrice: 9300,
    location: 'Gikomba Grain Terminal',
    county: 'Nairobi',
    trend: 'up',
    changePercentage: 4.1,
    dateUpdated: '2026-09-13'
  },
  {
    id: 'mp-5',
    crop: 'Red Bombay Onions',
    category: 'Vegetables',
    unit: '25kg net bag',
    averagePrice: 2350,
    minPrice: 2100,
    maxPrice: 2600,
    location: 'Karatina Open Market',
    county: 'Nyeri',
    trend: 'down',
    changePercentage: -2.4,
    dateUpdated: '2026-09-14'
  },
  {
    id: 'mp-6',
    crop: 'Gloria Cabbage',
    category: 'Vegetables',
    unit: 'Head (approx 3kg)',
    averagePrice: 70,
    minPrice: 50,
    maxPrice: 90,
    location: 'Kibuye Market',
    county: 'Kisumu',
    trend: 'stable',
    changePercentage: 0.0,
    dateUpdated: '2026-09-11'
  },
  {
    id: 'mp-7',
    crop: 'Nantes Carrots',
    category: 'Vegetables',
    unit: '70kg extended bag',
    averagePrice: 3300,
    minPrice: 2900,
    maxPrice: 3700,
    location: 'Kangemi Market',
    county: 'Nairobi',
    trend: 'up',
    changePercentage: 5.0,
    dateUpdated: '2026-09-13'
  },
  {
    id: 'mp-8',
    crop: 'Hass Avocados',
    category: 'Fruits',
    unit: '10kg carton crate',
    averagePrice: 1500,
    minPrice: 1300,
    maxPrice: 1750,
    location: 'Thika Agro Terminal',
    county: 'Kiambu',
    trend: 'up',
    changePercentage: 8.2,
    dateUpdated: '2026-09-14'
  }
];

export const INITIAL_NEGOTIATIONS: Negotiation[] = [
  {
    id: 'neg-101',
    produceId: 'prod-1',
    produceName: 'Dry White Maize Grain (90kg Bags)',
    produceImage: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&auto=format&fit=crop&q=80',
    buyerId: 'user-buyer-1',
    buyerName: 'Sarah Wambui',
    farmerId: 'user-farmer-1',
    farmerName: 'David Kiprop',
    unit: 'bags (90kg)',
    originalPrice: 3400,
    desiredQuantity: 80,
    proposedPrice: 3200,
    status: 'pending',
    history: [
      {
        senderId: 'user-buyer-1',
        senderName: 'Sarah Wambui',
        senderRole: 'buyer',
        type: 'offer',
        price: 3200,
        quantity: 80,
        message: 'Hello David, I run supplies for 3 bakeries and retail millers. Can we do KES 3,200 per bag if I take 80 bags immediately and arrange my own transit truck?',
        timestamp: '2026-09-13 14:20'
      }
    ],
    createdAt: '2026-09-13 14:20',
    updatedAt: '2026-09-13 14:20'
  },
  {
    id: 'neg-102',
    produceId: 'prod-3',
    produceName: 'Plum Anna F1 Salad Tomatoes',
    produceImage: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
    buyerId: 'user-buyer-1',
    buyerName: 'Sarah Wambui',
    farmerId: 'user-farmer-2',
    farmerName: 'Grace Muthoni',
    unit: 'crates (60kg)',
    originalPrice: 3600,
    desiredQuantity: 20,
    proposedPrice: 3300,
    counterPrice: 3450,
    counterQuantity: 20,
    status: 'countered',
    history: [
      {
        senderId: 'user-buyer-1',
        senderName: 'Sarah Wambui',
        senderRole: 'buyer',
        type: 'offer',
        price: 3300,
        quantity: 20,
        message: 'Hi Grace, interested in 20 crates for weekend restaurant deliveries. Could you consider KES 3,300 per crate?',
        timestamp: '2026-09-12 10:15'
      },
      {
        senderId: 'user-farmer-2',
        senderName: 'Grace Muthoni',
        senderRole: 'farmer',
        type: 'counter',
        price: 3450,
        quantity: 20,
        message: 'Thank you Sarah. These are premium greenhouse harvests with foam packaging. Best I can offer for 20 crates is KES 3,450.',
        timestamp: '2026-09-12 11:40'
      }
    ],
    createdAt: '2026-09-12 10:15',
    updatedAt: '2026-09-12 11:40'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-8821',
    buyerId: 'user-buyer-1',
    buyerName: 'Sarah Wambui',
    buyerPhone: '+254 734 567 890',
    farmerId: 'user-farmer-1',
    farmerName: 'David Kiprop',
    farmerPhone: '+254 712 345 678',
    produceId: 'prod-2',
    produceName: 'Fresh Shangi Irish Potatoes',
    produceImage: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80',
    quantity: 30,
    unit: 'bags (50kg)',
    pricePerUnit: 2750,
    totalAmount: 82500,
    deliveryLocation: 'Westlands Wholesale Depot, Nairobi',
    county: 'Nairobi',
    orderDate: '2026-09-12 09:30',
    status: 'In Transit',
    paymentStatus: 'Escrow Secured',
    notes: 'Agreed via negotiation. Driver assigned: Peter M. (KBZ 412X).',
    trackingUpdates: [
      { status: 'Pending', note: 'Order initiated and payment held in escrow.', timestamp: '2026-09-12 09:30' },
      { status: 'Accepted', note: 'Farmer accepted the order and began bagging.', timestamp: '2026-09-12 10:15' },
      { status: 'Preparing', note: 'Potatoes cleaned, sorted, and weighed at Eldoret hub.', timestamp: '2026-09-13 08:00' },
      { status: 'Ready for Collection', note: 'Loaded onto regional transit lorry.', timestamp: '2026-09-13 16:30' },
      { status: 'In Transit', note: 'Vehicle departed Nakuru highway en route to Nairobi Westlands.', timestamp: '2026-09-14 06:15' }
    ]
  },
  {
    id: 'ORD-8794',
    buyerId: 'user-buyer-1',
    buyerName: 'Sarah Wambui',
    buyerPhone: '+254 734 567 890',
    farmerId: 'user-farmer-2',
    farmerName: 'Grace Muthoni',
    farmerPhone: '+254 723 456 789',
    produceId: 'prod-4',
    produceName: 'Red Bombay Hybrid Onions',
    produceImage: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80',
    quantity: 15,
    unit: 'net bags (25kg)',
    pricePerUnit: 2200,
    totalAmount: 33000,
    deliveryLocation: 'Kangemi Market Stall 14B, Nairobi',
    county: 'Nairobi',
    orderDate: '2026-09-08 11:00',
    status: 'Completed',
    paymentStatus: 'Paid Out',
    notes: 'Successfully delivered and inspected. Farmer received payout.',
    trackingUpdates: [
      { status: 'Pending', note: 'Order placed.', timestamp: '2026-09-08 11:00' },
      { status: 'Accepted', note: 'Farmer confirmed availability.', timestamp: '2026-09-08 11:30' },
      { status: 'In Transit', note: 'Dispatched via Mwea express courier.', timestamp: '2026-09-09 07:00' },
      { status: 'Completed', note: 'Goods received and accepted in good order.', timestamp: '2026-09-09 17:20' }
    ]
  },
  {
    id: 'ORD-8902',
    buyerId: 'user-buyer-2',
    buyerName: 'Joseph Omondi',
    buyerPhone: '+254 745 678 901',
    farmerId: 'user-farmer-1',
    farmerName: 'David Kiprop',
    farmerPhone: '+254 712 345 678',
    produceId: 'prod-5',
    produceName: 'Gloria F1 Sugarloaf Cabbages',
    produceImage: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=800&auto=format&fit=crop&q=80',
    quantity: 120,
    unit: 'heads',
    pricePerUnit: 65,
    totalAmount: 7800,
    deliveryLocation: 'Jubilee Market, Kisumu',
    county: 'Kisumu',
    orderDate: '2026-09-13 16:45',
    status: 'Preparing',
    paymentStatus: 'Escrow Secured',
    notes: 'Early morning harvest requested.',
    trackingUpdates: [
      { status: 'Pending', note: 'Direct order placed by buyer.', timestamp: '2026-09-13 16:45' },
      { status: 'Accepted', note: 'Farmer accepted order.', timestamp: '2026-09-13 17:10' },
      { status: 'Preparing', note: 'Field harvesting scheduled for dawn.', timestamp: '2026-09-14 05:30' }
    ]
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-9941',
    orderId: 'ORD-8794',
    buyerId: 'user-buyer-1',
    buyerName: 'Sarah Wambui',
    farmerId: 'user-farmer-2',
    farmerName: 'Grace Muthoni',
    produceName: 'Red Bombay Hybrid Onions (15 bags)',
    amount: 33000,
    type: 'sale',
    status: 'completed',
    paymentMethod: 'M-Pesa / Mobile Money',
    referenceCode: 'QKL982HX19',
    date: '2026-09-09'
  },
  {
    id: 'TXN-9952',
    orderId: 'ORD-8821',
    buyerId: 'user-buyer-1',
    buyerName: 'Sarah Wambui',
    farmerId: 'user-farmer-1',
    farmerName: 'David Kiprop',
    produceName: 'Fresh Shangi Irish Potatoes (30 bags)',
    amount: 82500,
    type: 'sale',
    status: 'pending',
    paymentMethod: 'Escrow Guarantee',
    referenceCode: 'ESC-77192A',
    date: '2026-09-12'
  },
  {
    id: 'TXN-9910',
    orderId: 'ORD-8510',
    buyerId: 'user-buyer-1',
    buyerName: 'Sarah Wambui',
    farmerId: 'user-farmer-1',
    farmerName: 'David Kiprop',
    produceName: 'Dry White Maize Grain (50 bags)',
    amount: 170000,
    type: 'sale',
    status: 'completed',
    paymentMethod: 'Bank Transfer',
    referenceCode: 'KCB-994102',
    date: '2026-08-29'
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    participantIds: ['user-farmer-1', 'user-buyer-1'],
    participants: [
      { id: 'user-farmer-1', name: 'David Kiprop', role: 'farmer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
      { id: 'user-buyer-1', name: 'Sarah Wambui', role: 'buyer', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' }
    ],
    produceId: 'prod-1',
    produceName: 'Dry White Maize Grain (90kg Bags)',
    lastMessage: 'I received the moisture testing report. The quality looks excellent.',
    lastMessageTimestamp: '2026-09-13 17:15',
    unreadCount: { 'user-farmer-1': 0, 'user-buyer-1': 1 }
  },
  {
    id: 'conv-2',
    participantIds: ['user-farmer-2', 'user-buyer-1'],
    participants: [
      { id: 'user-farmer-2', name: 'Grace Muthoni', role: 'farmer', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
      { id: 'user-buyer-1', name: 'Sarah Wambui', role: 'buyer', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' }
    ],
    produceId: 'prod-3',
    produceName: 'Plum Anna F1 Salad Tomatoes',
    lastMessage: 'Let me know if KES 3,450 works for your restaurant schedule.',
    lastMessageTimestamp: '2026-09-12 11:45',
    unreadCount: { 'user-farmer-2': 0, 'user-buyer-1': 0 }
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'user-buyer-1',
    senderName: 'Sarah Wambui',
    senderRole: 'buyer',
    receiverId: 'user-farmer-1',
    receiverName: 'David Kiprop',
    produceId: 'prod-1',
    produceName: 'Dry White Maize Grain (90kg Bags)',
    content: 'Habari David, I noticed your maize listing has 450 bags available in Moiben. Can you confirm the current moisture percentage?',
    timestamp: '2026-09-13 14:10',
    read: true
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: 'user-farmer-1',
    senderName: 'David Kiprop',
    senderRole: 'farmer',
    receiverId: 'user-buyer-1',
    receiverName: 'Sarah Wambui',
    produceId: 'prod-1',
    produceName: 'Dry White Maize Grain (90kg Bags)',
    content: 'Habari Sarah! Yes, we calibrated yesterday at 12.8% to 13.1%. All bags are stored on wooden pallets in our covered warehouse.',
    timestamp: '2026-09-13 14:25',
    read: true
  },
  {
    id: 'msg-3',
    conversationId: 'conv-1',
    senderId: 'user-buyer-1',
    senderName: 'Sarah Wambui',
    senderRole: 'buyer',
    receiverId: 'user-farmer-1',
    receiverName: 'David Kiprop',
    produceId: 'prod-1',
    produceName: 'Dry White Maize Grain (90kg Bags)',
    content: 'I received the moisture testing report. The quality looks excellent. I have submitted an offer for 80 bags on the platform.',
    timestamp: '2026-09-13 17:15',
    read: true
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-farmer-1',
    title: 'New Price Negotiation Offer',
    message: 'Sarah Wambui proposed KES 3,200/bag for 80 bags of Dry White Maize Grain.',
    type: 'offer',
    relatedId: 'neg-101',
    read: false,
    createdAt: '2026-09-13 14:20'
  },
  {
    id: 'notif-2',
    userId: 'user-farmer-1',
    title: 'Order Status Update',
    message: 'Order #ORD-8821 for 30 bags Shangi Potatoes is now marked In Transit.',
    type: 'order',
    relatedId: 'ORD-8821',
    read: false,
    createdAt: '2026-09-14 06:15'
  },
  {
    id: 'notif-3',
    userId: 'user-buyer-1',
    title: 'Counter-Offer Received',
    message: 'Grace Muthoni offered KES 3,450/crate for Plum Anna F1 Salad Tomatoes.',
    type: 'counter',
    relatedId: 'neg-102',
    read: false,
    createdAt: '2026-09-12 11:40'
  },
  {
    id: 'notif-4',
    userId: 'user-buyer-1',
    title: 'Produce Shipped',
    message: 'Your order #ORD-8821 has been loaded and dispatched from Eldoret.',
    type: 'order',
    relatedId: 'ORD-8821',
    read: true,
    createdAt: '2026-09-14 06:20'
  },
  {
    id: 'notif-5',
    userId: 'user-farmer-1',
    title: 'Market Benchmark Alert',
    message: 'Maize benchmark price in Eldoret adjusted to KES 3,550/bag. Your listing is competitively priced.',
    type: 'market_price',
    relatedId: 'mp-1',
    read: true,
    createdAt: '2026-09-13 09:00'
  }
];

export const INITIAL_DISPUTES: Dispute[] = [
  {
    id: 'disp-301',
    orderId: 'ORD-8504',
    buyerId: 'user-buyer-2',
    buyerName: 'Joseph Omondi',
    farmerId: 'user-farmer-2',
    farmerName: 'Grace Muthoni',
    produceName: 'French Export Beans (Crates)',
    reason: 'Delayed shipment',
    description: 'Produce delivery was delayed by 38 hours during transit causing 15% shelf life deterioration upon arrival at Kisumu.',
    status: 'Under Investigation',
    adminDecision: 'Reviewing GPS transit logs and cold chain compliance certificate.',
    createdAt: '2026-09-10 15:00'
  }
];
