import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  UserRole,
  Produce,
  Order,
  OrderStatus,
  Negotiation,
  MarketPrice,
  Message,
  Conversation,
  Notification,
  Dispute,
  Transaction
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PRODUCE,
  INITIAL_MARKET_PRICES,
  INITIAL_NEGOTIATIONS,
  INITIAL_ORDERS,
  INITIAL_TRANSACTIONS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_DISPUTES
} from '../data/mockData';
import {
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInAnonymously,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  collection
} from '../lib/firebase';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface MarketplaceContextType {
  currentUser: User | null;
  allUsers: User[];
  activeView: string;
  setActiveView: (view: string) => void;
  login: (email: string, password?: string) => boolean;
  loginAsRole: (role: UserRole) => void;
  loginAsDemoUser: (role: UserRole) => void;
  register: (userData: Partial<User> & { password: string }) => boolean;
  logout: () => void;
  resetPassword: (email: string, newPass: string) => boolean;
  updateProfile: (data: Partial<User>) => void;
  toggleUserStatus: (userId: string) => void;
  verifyFarmer: (userId: string) => void;
  deleteUser: (userId: string) => void;

  // Produce
  produceList: Produce[];
  addProduce: (data: Omit<Produce, 'id' | 'farmerId' | 'farmerName' | 'farmerCounty' | 'farmerPhone' | 'farmerRating' | 'farmerVerified' | 'inquiriesCount' | 'createdAt' | 'approvalStatus'>) => void;
  updateProduce: (id: string, data: Partial<Produce>) => void;
  deleteProduce: (id: string) => void;
  markProduceSold: (id: string) => void;
  approveProduce: (id: string) => void;
  suspendProduce: (id: string) => void;

  // Orders
  orders: Order[];
  createDirectOrder: (produceId: string, quantity: number, deliveryLocation: string, notes?: string) => Order | null;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;

  // Negotiations
  negotiations: Negotiation[];
  createNegotiation: (produceId: string, quantity: number, proposedPrice: number, message: string) => Negotiation | null;
  farmerCounterOffer: (negotiationId: string, counterPrice: number, counterQuantity: number, message: string) => void;
  acceptOffer: (negotiationId: string) => Order | null;
  rejectOffer: (negotiationId: string, message?: string) => void;

  // Market Prices
  marketPrices: MarketPrice[];
  addMarketPrice: (data: Omit<MarketPrice, 'id' | 'dateUpdated'>) => void;
  updateMarketPrice: (id: string, data: Partial<MarketPrice>) => void;
  deleteMarketPrice: (id: string) => void;

  // Messages
  conversations: Conversation[];
  messages: Message[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (receiverId: string, content: string, produceId?: string, produceName?: string) => void;
  markConversationAsRead: (convId: string) => void;

  // Disputes
  disputes: Dispute[];
  reportDispute: (orderId: string, reason: Dispute['reason'], description: string, evidenceUrls?: string[]) => void;
  resolveDispute: (disputeId: string, decision: string, outcome: 'refund' | 'payout' | 'dismiss') => void;

  // Transactions
  transactions: Transaction[];

  // Notifications
  notifications: Notification[];
  unreadNotificationCount: number;
  markNotificationRead: (notifId: string) => void;
  clearAllNotifications: () => void;

  // Toasts
  toast: Toast | null;
  showToast: (message: string, type?: Toast['type']) => void;

  // Selected produce for details modal
  selectedProduce: Produce | null;
  setSelectedProduce: (p: Produce | null) => void;
  selectedOrderForTracking: Order | null;
  setSelectedOrderForTracking: (o: Order | null) => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load state or default to mock data
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fpm_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[0]; // Default to Farmer David for rich initial preview
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('fpm_all_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [activeView, setActiveView] = useState<string>('dashboard');

  const [produceList, setProduceList] = useState<Produce[]>(() => {
    const saved = localStorage.getItem('fpm_produce');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCE;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('fpm_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [negotiations, setNegotiations] = useState<Negotiation[]>(() => {
    const saved = localStorage.getItem('fpm_negotiations');
    return saved ? JSON.parse(saved) : INITIAL_NEGOTIATIONS;
  });

  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>(() => {
    const saved = localStorage.getItem('fpm_market_prices');
    return saved ? JSON.parse(saved) : INITIAL_MARKET_PRICES;
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('fpm_conversations');
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('fpm_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const [disputes, setDisputes] = useState<Dispute[]>(() => {
    const saved = localStorage.getItem('fpm_disputes');
    return saved ? JSON.parse(saved) : INITIAL_DISPUTES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('fpm_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('fpm_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [selectedProduce, setSelectedProduce] = useState<Produce | null>(null);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('fpm_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('fpm_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('fpm_produce', JSON.stringify(produceList));
  }, [produceList]);

  useEffect(() => {
    localStorage.setItem('fpm_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('fpm_negotiations', JSON.stringify(negotiations));
  }, [negotiations]);

  useEffect(() => {
    localStorage.setItem('fpm_market_prices', JSON.stringify(marketPrices));
  }, [marketPrices]);

  useEffect(() => {
    localStorage.setItem('fpm_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('fpm_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('fpm_disputes', JSON.stringify(disputes));
  }, [disputes]);

  useEffect(() => {
    localStorage.setItem('fpm_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('fpm_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser && fbUser.email) {
        const found = allUsers.find(u => (u.email || '').toLowerCase() === fbUser.email?.toLowerCase());
        if (found && (!currentUser || currentUser.id !== found.id)) {
          setCurrentUser(found);
        }
      }
    });
    return () => unsubscribe();
  }, [allUsers, currentUser]);

  // Initial Firestore cloud sync
  useEffect(() => {
    async function syncFirestoreSeed() {
      try {
        const isSynced = localStorage.getItem('fpm_synced_firestore');
        if (!isSynced) {
          for (const u of INITIAL_USERS) {
            await setDoc(doc(db, 'users', u.id), u, { merge: true }).catch(() => {});
          }
          for (const p of INITIAL_PRODUCE) {
            await setDoc(doc(db, 'produce', p.id), p, { merge: true }).catch(() => {});
          }
          for (const mp of INITIAL_MARKET_PRICES) {
            await setDoc(doc(db, 'marketPrices', mp.id), mp, { merge: true }).catch(() => {});
          }
          localStorage.setItem('fpm_synced_firestore', 'true');
        }
      } catch (err) {
        console.warn('Initial Firestore seed sync non-blocking error:', err);
      }
    }
    syncFirestoreSeed();
  }, []);

  const showToast = (message: string, type: Toast['type'] = 'success') => {
    const newToast = { id: Date.now().toString(), message, type };
    setToast(newToast);
    setTimeout(() => {
      setToast((prev) => (prev?.id === newToast.id ? null : prev));
    }, 4000);
  };

  const login = (email: string, password?: string): boolean => {
    const targetEmail = (email || '').trim().toLowerCase();
    const found = allUsers.find(u => (u.email || '').trim().toLowerCase() === targetEmail);
    if (found) {
      if (found.status === 'suspended') {
        showToast('Your account is currently suspended. Please contact admin.', 'error');
        return false;
      }
      setCurrentUser(found);
      setActiveView('dashboard');
      showToast(`Welcome back, ${found.name}! Signed in as ${(found.role || 'user').toUpperCase()}.`, 'success');

      // Firebase Auth sign-in
      signInWithEmailAndPassword(auth, targetEmail, password || 'AgriMa2026!').catch(() => {
        signInAnonymously(auth).catch(() => {});
      });
      return true;
    }
    showToast('No user found with that email. Please check your credentials or register.', 'error');
    return false;
  };

  const loginAsRole = (role: UserRole) => {
    const target = allUsers.find(u => u.role === role);
    if (target) {
      setCurrentUser(target);
      setActiveView('dashboard');
      showToast(`Switched persona to ${target.name} (${(role || '').toUpperCase()})`, 'info');
      signInAnonymously(auth).catch(() => {});
    }
  };

  const register = (userData: Partial<User> & { password: string }): boolean => {
    const regEmail = (userData.email || '').trim().toLowerCase();
    const existing = allUsers.find(u => (u.email || '').trim().toLowerCase() === regEmail);
    if (existing) {
      showToast('An account with this email already exists.', 'error');
      return false;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name || 'New Member',
      email: userData.email || '',
      phone: userData.phone || '+254 700 000 000',
      role: userData.role || 'farmer',
      status: 'active',
      avatar: userData.role === 'farmer'
        ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      county: userData.county || 'Nairobi',
      location: userData.location || 'Central Area',
      isVerified: userData.role === 'farmer' ? false : undefined,
      farmName: userData.farmName,
      farmSize: userData.farmSize,
      cropsGrown: userData.cropsGrown || [],
      businessName: userData.businessName,
      buyerType: userData.buyerType,
      bio: userData.bio || (userData.role === 'farmer' ? 'Dedicated smallholder farmer producing fresh produce.' : 'Commercial produce purchaser.'),
      joinedDate: new Date().toISOString().split('T')[0]
    };

    setAllUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setActiveView('dashboard');
    showToast(`Account successfully registered! Welcome to Farm Produce Market, ${newUser.name}.`, 'success');

    // Register in Firebase Auth & persist to Firestore
    createUserWithEmailAndPassword(auth, regEmail, userData.password || 'AgriMa2026!')
      .then((cred) => {
        setDoc(doc(db, 'users', cred.user.uid), { ...newUser, id: cred.user.uid }).catch(() => {});
      })
      .catch(() => {
        setDoc(doc(db, 'users', newUser.id), newUser).catch(() => {});
      });

    return true;
  };

  const logout = () => {
    signOut(auth).catch(() => {});
    setCurrentUser(null);
    setActiveView('login');
    showToast('You have been logged out securely.', 'info');
  };

  const resetPassword = (email: string): boolean => {
    const targetEmail = (email || '').trim().toLowerCase();
    const user = allUsers.find(u => (u.email || '').trim().toLowerCase() === targetEmail);
    if (user) {
      showToast(`Password reset link sent to ${email}. Check your inbox or use demo login.`, 'info');
      return true;
    }
    showToast('Email not registered in the system.', 'error');
    return false;
  };

  const updateProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    setAllUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));
    showToast('Profile updated successfully.', 'success');
  };

  const toggleUserStatus = (userId: string) => {
    setAllUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const nextStatus = u.status === 'active' ? 'suspended' : 'active';
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
    showToast('User status updated by Administrator.', 'info');
  };

  const verifyFarmer = (userId: string) => {
    setAllUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          return { ...u, isVerified: !u.isVerified };
        }
        return u;
      })
    );
    showToast('Farmer verification status updated.', 'success');
  };

  const deleteUser = (userId: string) => {
    setAllUsers(prev => prev.filter(u => u.id !== userId));
    showToast('User deleted from platform.', 'warning');
  };

  // PRODUCE METHODS
  const addProduce = (data: Omit<Produce, 'id' | 'farmerId' | 'farmerName' | 'farmerCounty' | 'farmerPhone' | 'farmerRating' | 'farmerVerified' | 'inquiriesCount' | 'createdAt' | 'approvalStatus'>) => {
    if (!currentUser || currentUser.role !== 'farmer') {
      showToast('Only registered farmers can list produce.', 'error');
      return;
    }

    const newProd: Produce = {
      ...data,
      id: `prod-${Date.now()}`,
      farmerId: currentUser.id,
      farmerName: currentUser.name,
      farmerCounty: currentUser.county,
      farmerPhone: currentUser.phone,
      farmerRating: 5.0,
      farmerVerified: !!currentUser.isVerified,
      inquiriesCount: 0,
      approvalStatus: 'Approved', // automatic baseline approval with admin review capability
      createdAt: new Date().toISOString().split('T')[0],
      views: 0
    };

    setProduceList(prev => [newProd, ...prev]);
    setDoc(doc(db, 'produce', newProd.id), newProd).catch(() => {});
    showToast(`"${newProd.name}" listed successfully!`, 'success');
  };

  const updateProduce = (id: string, data: Partial<Produce>) => {
    setProduceList(prev =>
      prev.map(p => (p.id === id ? { ...p, ...data } : p))
    );
    setDoc(doc(db, 'produce', id), data, { merge: true }).catch(() => {});
    showToast('Produce listing updated.', 'success');
  };

  const deleteProduce = (id: string) => {
    setProduceList(prev => prev.filter(p => p.id !== id));
    deleteDoc(doc(db, 'produce', id)).catch(() => {});
    showToast('Listing removed.', 'warning');
  };

  const markProduceSold = (id: string) => {
    setProduceList(prev =>
      prev.map(p => (p.id === id ? { ...p, availabilityStatus: 'Sold', quantity: 0 } : p))
    );
    showToast('Listing marked as Sold.', 'info');
  };

  const approveProduce = (id: string) => {
    setProduceList(prev =>
      prev.map(p => (p.id === id ? { ...p, approvalStatus: 'Approved' } : p))
    );
    showToast('Produce listing approved by administrator.', 'success');
  };

  const suspendProduce = (id: string) => {
    setProduceList(prev =>
      prev.map(p => (p.id === id ? { ...p, approvalStatus: 'Suspended' } : p))
    );
    showToast('Produce listing suspended.', 'warning');
  };

  // ORDER METHODS
  const createDirectOrder = (produceId: string, quantity: number, deliveryLocation: string, notes?: string): Order | null => {
    if (!currentUser || currentUser.role !== 'buyer') {
      showToast('Please sign in as a Buyer to place orders.', 'error');
      return null;
    }

    const prod = produceList.find(p => p.id === produceId);
    if (!prod) {
      showToast('Produce not found.', 'error');
      return null;
    }

    if (quantity > prod.quantity) {
      showToast(`Only ${prod.quantity} ${prod.unit} available in stock.`, 'error');
      return null;
    }

    const total = quantity * prod.pricePerUnit;
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: orderId,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      buyerPhone: currentUser.phone,
      farmerId: prod.farmerId,
      farmerName: prod.farmerName,
      farmerPhone: prod.farmerPhone,
      produceId: prod.id,
      produceName: prod.name,
      produceImage: prod.images[0] || 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800',
      quantity,
      unit: prod.unit,
      pricePerUnit: prod.pricePerUnit,
      totalAmount: total,
      deliveryLocation,
      county: currentUser.county,
      orderDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Pending',
      paymentStatus: 'Escrow Secured',
      notes,
      trackingUpdates: [
        {
          status: 'Pending',
          note: `Order created for ${quantity} ${prod.unit} of ${prod.name}. Payment held in secure escrow.`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
        }
      ]
    };

    // Update produce remaining stock
    setProduceList(prev =>
      prev.map(p => {
        if (p.id === prod.id) {
          const nextQty = Math.max(0, p.quantity - quantity);
          return {
            ...p,
            quantity: nextQty,
            availabilityStatus: nextQty === 0 ? 'Out of Stock' : (nextQty < 10 ? 'Low Stock' : p.availabilityStatus)
          };
        }
        return p;
      })
    );

    setOrders(prev => [newOrder, ...prev]);

    // Record Transaction
    const newTxn: Transaction = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: newOrder.id,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      farmerId: prod.farmerId,
      farmerName: prod.farmerName,
      produceName: `${prod.name} (${quantity} ${prod.unit})`,
      amount: total,
      type: 'purchase',
      status: 'completed',
      paymentMethod: 'Escrow Guarantee',
      referenceCode: `ESC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      date: new Date().toISOString().split('T')[0]
    };
    setTransactions(prev => [newTxn, ...prev]);

    // Notify farmer
    const farmerNotif: Notification = {
      id: `notif-${Date.now()}`,
      userId: prod.farmerId,
      title: 'New Order Received!',
      message: `${currentUser.name} placed order #${orderId} for ${quantity} ${prod.unit} of ${prod.name} (KES ${total.toLocaleString()}).`,
      type: 'order',
      relatedId: orderId,
      read: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setNotifications(prev => [farmerNotif, ...prev]);

    showToast(`Order #${orderId} placed successfully with Escrow protection!`, 'success');
    setDoc(doc(db, 'orders', newOrder.id), newOrder).catch(() => {});
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, note?: string) => {
    setDoc(doc(db, 'orders', orderId), { status }, { merge: true }).catch(() => {});
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const newUpdate = {
            status,
            note: note || `Order status updated to "${status}".`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
          };

          let newPaymentStatus = ord.paymentStatus;
          if (status === 'Completed') {
            newPaymentStatus = 'Paid Out';
          } else if (status === 'Cancelled') {
            newPaymentStatus = 'Refunded';
          }

          return {
            ...ord,
            status,
            paymentStatus: newPaymentStatus,
            trackingUpdates: [...ord.trackingUpdates, newUpdate]
          };
        }
        return ord;
      })
    );

    // Notify other party
    const targetOrder = orders.find(o => o.id === orderId);
    if (targetOrder && currentUser) {
      const recipientId = currentUser.id === targetOrder.farmerId ? targetOrder.buyerId : targetOrder.farmerId;
      const notif: Notification = {
        id: `notif-${Date.now()}`,
        userId: recipientId,
        title: `Order #${orderId} Update`,
        message: `Order status changed to: ${status}.`,
        type: 'status_change',
        relatedId: orderId,
        read: false,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setNotifications(prev => [notif, ...prev]);
    }

    showToast(`Order #${orderId} status updated to ${status}.`, 'info');
  };

  // NEGOTIATION METHODS
  const createNegotiation = (produceId: string, quantity: number, proposedPrice: number, message: string): Negotiation | null => {
    if (!currentUser || currentUser.role !== 'buyer') {
      showToast('Only registered buyers can initiate price negotiations.', 'error');
      return null;
    }

    const prod = produceList.find(p => p.id === produceId);
    if (!prod) {
      showToast('Produce listing not found.', 'error');
      return null;
    }

    const negId = `neg-${Date.now()}`;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newNeg: Negotiation = {
      id: negId,
      produceId: prod.id,
      produceName: prod.name,
      produceImage: prod.images[0] || 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800',
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      farmerId: prod.farmerId,
      farmerName: prod.farmerName,
      unit: prod.unit,
      originalPrice: prod.pricePerUnit,
      desiredQuantity: quantity,
      proposedPrice: proposedPrice,
      status: 'pending',
      history: [
        {
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: 'buyer',
          type: 'offer',
          price: proposedPrice,
          quantity: quantity,
          message: message || `Offered KES ${proposedPrice.toLocaleString()} per ${prod.unit} for ${quantity} units.`,
          timestamp
        }
      ],
      createdAt: timestamp,
      updatedAt: timestamp
    };

    setNegotiations(prev => [newNeg, ...prev]);

    // Send notification to farmer
    const notif: Notification = {
      id: `notif-${Date.now()}`,
      userId: prod.farmerId,
      title: 'New Price Offer Received',
      message: `${currentUser.name} offered KES ${proposedPrice.toLocaleString()}/${prod.unit} for ${quantity} ${prod.unit} of ${prod.name}.`,
      type: 'offer',
      relatedId: negId,
      read: false,
      createdAt: timestamp
    };
    setNotifications(prev => [notif, ...prev]);

    showToast('Your offer has been submitted directly to the farmer!', 'success');
    return newNeg;
  };

  const farmerCounterOffer = (negotiationId: string, counterPrice: number, counterQuantity: number, message: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setNegotiations(prev =>
      prev.map(neg => {
        if (neg.id === negotiationId) {
          const counterItem = {
            senderId: currentUser?.id || '',
            senderName: currentUser?.name || 'Farmer',
            senderRole: 'farmer' as const,
            type: 'counter' as const,
            price: counterPrice,
            quantity: counterQuantity,
            message: message || `Counter-offered KES ${counterPrice.toLocaleString()}/${neg.unit} for ${counterQuantity} units.`,
            timestamp
          };

          return {
            ...neg,
            counterPrice,
            counterQuantity,
            status: 'countered',
            history: [...neg.history, counterItem],
            updatedAt: timestamp
          };
        }
        return neg;
      })
    );

    const targetNeg = negotiations.find(n => n.id === negotiationId);
    if (targetNeg) {
      const notif: Notification = {
        id: `notif-${Date.now()}`,
        userId: targetNeg.buyerId,
        title: 'Counter-Offer Received',
        message: `${currentUser?.name || 'Farmer'} sent a counter-offer of KES ${counterPrice.toLocaleString()}/${targetNeg.unit} for ${targetNeg.produceName}.`,
        type: 'counter',
        relatedId: negotiationId,
        read: false,
        createdAt: timestamp
      };
      setNotifications(prev => [notif, ...prev]);
    }

    showToast('Counter-offer sent to buyer.', 'info');
  };

  const acceptOffer = (negotiationId: string): Order | null => {
    const targetNeg = negotiations.find(n => n.id === negotiationId);
    if (!targetNeg) return null;

    const agreedPrice = targetNeg.status === 'countered' && targetNeg.counterPrice ? targetNeg.counterPrice : targetNeg.proposedPrice;
    const agreedQuantity = targetNeg.status === 'countered' && targetNeg.counterQuantity ? targetNeg.counterQuantity : targetNeg.desiredQuantity;
    const total = agreedPrice * agreedQuantity;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // Update negotiation state
    setNegotiations(prev =>
      prev.map(n => {
        if (n.id === negotiationId) {
          return {
            ...n,
            status: 'accepted',
            history: [
              ...n.history,
              {
                senderId: currentUser?.id || '',
                senderName: currentUser?.name || 'User',
                senderRole: (currentUser?.role === 'farmer' ? 'farmer' : 'buyer'),
                type: 'accept',
                price: agreedPrice,
                quantity: agreedQuantity,
                message: `Negotiation agreed! Terms: ${agreedQuantity} ${targetNeg.unit} @ KES ${agreedPrice.toLocaleString()}/${targetNeg.unit}.`,
                timestamp
              }
            ],
            updatedAt: timestamp
          };
        }
        return n;
      })
    );

    // Auto-create order from accepted terms
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: orderId,
      buyerId: targetNeg.buyerId,
      buyerName: targetNeg.buyerName,
      buyerPhone: '+254 734 567 890',
      farmerId: targetNeg.farmerId,
      farmerName: targetNeg.farmerName,
      farmerPhone: '+254 712 345 678',
      produceId: targetNeg.produceId,
      produceName: targetNeg.produceName,
      produceImage: targetNeg.produceImage,
      quantity: agreedQuantity,
      unit: targetNeg.unit,
      pricePerUnit: agreedPrice,
      totalAmount: total,
      deliveryLocation: 'Agreed Collection Point / Delivery Hub',
      county: 'Designated Hub',
      orderDate: timestamp,
      status: 'Accepted',
      paymentStatus: 'Escrow Secured',
      notes: `Order created from agreed negotiation #${negotiationId}`,
      negotiationId,
      trackingUpdates: [
        {
          status: 'Accepted',
          note: `Agreed via direct negotiation at KES ${agreedPrice.toLocaleString()}/${targetNeg.unit}. Ready for processing.`,
          timestamp
        }
      ]
    };

    setOrders(prev => [newOrder, ...prev]);

    // Record transaction
    const newTxn: Transaction = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: newOrder.id,
      buyerId: targetNeg.buyerId,
      buyerName: targetNeg.buyerName,
      farmerId: targetNeg.farmerId,
      farmerName: targetNeg.farmerName,
      produceName: `${targetNeg.produceName} (${agreedQuantity} ${targetNeg.unit})`,
      amount: total,
      type: 'sale',
      status: 'completed',
      paymentMethod: 'Escrow Guarantee',
      referenceCode: `ESC-NEG-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      date: new Date().toISOString().split('T')[0]
    };
    setTransactions(prev => [newTxn, ...prev]);

    // Notify both parties
    const recipientId = currentUser?.id === targetNeg.farmerId ? targetNeg.buyerId : targetNeg.farmerId;
    const notif: Notification = {
      id: `notif-${Date.now()}`,
      userId: recipientId,
      title: 'Offer Accepted! Order Created',
      message: `Terms agreed for ${targetNeg.produceName}. Order #${orderId} has been created and escrow secured.`,
      type: 'order',
      relatedId: orderId,
      read: false,
      createdAt: timestamp
    };
    setNotifications(prev => [notif, ...prev]);

    showToast(`Offer accepted! Order #${orderId} generated successfully.`, 'success');
    return newOrder;
  };

  const rejectOffer = (negotiationId: string, message?: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setNegotiations(prev =>
      prev.map(n => {
        if (n.id === negotiationId) {
          return {
            ...n,
            status: 'rejected',
            history: [
              ...n.history,
              {
                senderId: currentUser?.id || '',
                senderName: currentUser?.name || 'User',
                senderRole: (currentUser?.role === 'farmer' ? 'farmer' : 'buyer'),
                type: 'reject',
                price: n.proposedPrice,
                quantity: n.desiredQuantity,
                message: message || 'Offer declined.',
                timestamp
              }
            ],
            updatedAt: timestamp
          };
        }
        return n;
      })
    );

    const targetNeg = negotiations.find(n => n.id === negotiationId);
    if (targetNeg) {
      const recipientId = currentUser?.id === targetNeg.farmerId ? targetNeg.buyerId : targetNeg.farmerId;
      const notif: Notification = {
        id: `notif-${Date.now()}`,
        userId: recipientId,
        title: 'Offer Declined',
        message: `Your price proposal for ${targetNeg.produceName} was declined.`,
        type: 'offer',
        relatedId: negotiationId,
        read: false,
        createdAt: timestamp
      };
      setNotifications(prev => [notif, ...prev]);
    }

    showToast('Offer declined.', 'info');
  };

  // MARKET PRICE METHODS
  const addMarketPrice = (data: Omit<MarketPrice, 'id' | 'dateUpdated'>) => {
    const newMp: MarketPrice = {
      ...data,
      id: `mp-${Date.now()}`,
      dateUpdated: new Date().toISOString().split('T')[0]
    };
    setMarketPrices(prev => [newMp, ...prev]);
    showToast(`Market price benchmark for ${newMp.crop} added.`, 'success');
  };

  const updateMarketPrice = (id: string, data: Partial<MarketPrice>) => {
    setMarketPrices(prev =>
      prev.map(mp => (mp.id === id ? { ...mp, ...data, dateUpdated: new Date().toISOString().split('T')[0] } : mp))
    );
    showToast('Market benchmark updated.', 'success');
  };

  const deleteMarketPrice = (id: string) => {
    setMarketPrices(prev => prev.filter(mp => mp.id !== id));
    showToast('Market benchmark deleted.', 'warning');
  };

  // MESSAGING METHODS
  const sendMessage = (receiverId: string, content: string, produceId?: string, produceName?: string) => {
    if (!currentUser || !content.trim()) return;

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const receiver = allUsers.find(u => u.id === receiverId);

    // Find existing conversation or create new
    let conv = conversations.find(c =>
      c.participantIds.includes(currentUser.id) && c.participantIds.includes(receiverId)
    );

    let convId = conv ? conv.id : `conv-${Date.now()}`;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId: convId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      receiverId: receiverId,
      receiverName: receiver?.name || 'User',
      produceId,
      produceName,
      content,
      timestamp,
      read: false
    };

    setMessages(prev => [...prev, newMsg]);
    setDoc(doc(db, 'messages', newMsg.id), newMsg).catch(() => {});

    if (conv) {
      setConversations(prev =>
        prev.map(c => {
          if (c.id === convId) {
            return {
              ...c,
              lastMessage: content,
              lastMessageTimestamp: timestamp,
              produceId: produceId || c.produceId,
              produceName: produceName || c.produceName,
              unreadCount: {
                ...(c.unreadCount || {}),
                [receiverId]: ((c.unreadCount && c.unreadCount[receiverId]) || 0) + 1
              }
            };
          }
          return c;
        })
      );
    } else {
      const newConv: Conversation = {
        id: convId,
        participantIds: [currentUser.id, receiverId],
        participants: [
          { id: currentUser.id, name: currentUser.name, role: currentUser.role, avatar: currentUser.avatar },
          { id: receiverId, name: receiver?.name || 'Member', role: receiver?.role || 'buyer', avatar: receiver?.avatar || '' }
        ],
        produceId,
        produceName,
        lastMessage: content,
        lastMessageTimestamp: timestamp,
        unreadCount: { [receiverId]: 1, [currentUser.id]: 0 }
      };
      setConversations(prev => [newConv, ...prev]);
    }

    setActiveConversationId(convId);

    // Notify receiver
    const notif: Notification = {
      id: `notif-${Date.now()}`,
      userId: receiverId,
      title: `New Message from ${currentUser.name}`,
      message: content.length > 50 ? `${content.substring(0, 50)}...` : content,
      type: 'message',
      relatedId: convId,
      read: false,
      createdAt: timestamp
    };
    setNotifications(prev => [notif, ...prev]);

    showToast('Message sent.', 'success');
  };

  const markConversationAsRead = (convId: string) => {
    if (!currentUser) return;
    setConversations(prev =>
      prev.map(c => {
        if (c.id === convId) {
          return {
            ...c,
            unreadCount: {
              ...(c.unreadCount || {}),
              [currentUser.id]: 0
            }
          };
        }
        return c;
      })
    );
    setMessages(prev =>
      prev.map(m => (m.conversationId === convId && m.receiverId === currentUser.id ? { ...m, read: true } : m))
    );
  };

  // DISPUTES
  const reportDispute = (orderId: string, reason: Dispute['reason'], description: string, evidenceUrls?: string[]) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder || !currentUser) return;

    const newDispute: Dispute = {
      id: `disp-${Date.now()}`,
      orderId,
      buyerId: targetOrder.buyerId,
      buyerName: targetOrder.buyerName,
      farmerId: targetOrder.farmerId,
      farmerName: targetOrder.farmerName,
      produceName: targetOrder.produceName,
      reason,
      description,
      evidenceUrls,
      status: 'Under Investigation',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setDisputes(prev => [newDispute, ...prev]);

    // Update order status to Disputed
    updateOrderStatus(orderId, 'Disputed', `Dispute filed: ${reason}. Admin investigation opened.`);

    // Notify admin
    const adminUser = allUsers.find(u => u.role === 'admin');
    if (adminUser) {
      const notif: Notification = {
        id: `notif-${Date.now()}`,
        userId: adminUser.id,
        title: 'New Order Dispute Filed',
        message: `${currentUser.name} reported a dispute for Order #${orderId} (${reason}).`,
        type: 'dispute',
        relatedId: newDispute.id,
        read: false,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setNotifications(prev => [notif, ...prev]);
    }

    showToast('Dispute reported. Platform Administrators have been notified for resolution.', 'warning');
  };

  const resolveDispute = (disputeId: string, decision: string, outcome: 'refund' | 'payout' | 'dismiss') => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    let statusText: Dispute['status'] = 'Closed';
    if (outcome === 'refund') statusText = 'Resolved - Buyer Refunded';
    if (outcome === 'payout') statusText = 'Resolved - Farmer Paid';

    setDisputes(prev =>
      prev.map(d => {
        if (d.id === disputeId) {
          return {
            ...d,
            status: statusText,
            adminDecision: decision,
            resolutionDate: timestamp
          };
        }
        return d;
      })
    );

    const targetDisp = disputes.find(d => d.id === disputeId);
    if (targetDisp) {
      if (outcome === 'refund') {
        updateOrderStatus(targetDisp.orderId, 'Cancelled', `Dispute resolved by Admin: Buyer refunded. Decision: ${decision}`);
      } else if (outcome === 'payout') {
        updateOrderStatus(targetDisp.orderId, 'Completed', `Dispute resolved by Admin: Farmer payout authorized. Decision: ${decision}`);
      }
    }

    showToast(`Dispute resolved by Administrator (${outcome}).`, 'success');
  };

  // NOTIFICATIONS
  const markNotificationRead = (notifId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    if (!currentUser) return;
    setNotifications(prev =>
      prev.map(n => (n.userId === currentUser.id ? { ...n, read: true } : n))
    );
    showToast('All notifications marked as read.', 'info');
  };

  const unreadNotificationCount = currentUser
    ? notifications.filter(n => n.userId === currentUser.id && !n.read).length
    : 0;

  return (
    <MarketplaceContext.Provider
      value={{
        currentUser,
        allUsers,
        activeView,
        setActiveView,
        login,
        loginAsRole,
        loginAsDemoUser: loginAsRole,
        register,
        logout,
        resetPassword,
        updateProfile,
        toggleUserStatus,
        verifyFarmer,
        deleteUser,

        produceList,
        addProduce,
        updateProduce,
        deleteProduce,
        markProduceSold,
        approveProduce,
        suspendProduce,

        orders,
        createDirectOrder,
        updateOrderStatus,

        negotiations,
        createNegotiation,
        farmerCounterOffer,
        acceptOffer,
        rejectOffer,

        marketPrices,
        addMarketPrice,
        updateMarketPrice,
        deleteMarketPrice,

        conversations,
        messages,
        activeConversationId,
        setActiveConversationId,
        sendMessage,
        markConversationAsRead,

        disputes,
        reportDispute,
        resolveDispute,

        transactions,

        notifications,
        unreadNotificationCount,
        markNotificationRead,
        clearAllNotifications,

        toast,
        showToast,

        selectedProduce,
        setSelectedProduce,
        selectedOrderForTracking,
        setSelectedOrderForTracking
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
