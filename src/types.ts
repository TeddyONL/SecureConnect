// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  token?: string;
}

export interface AdminUser extends User {
  lastLogin: string;
  status: 'active' | 'suspended' | 'deleted';
}

export interface AuthStore {
  user: User | null;
  isInitialized: boolean;
  lastActivity: number;
  refreshTokenTimeout: NodeJS.Timeout | null;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, name: string) => Promise<User>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

// Admin related types
export interface AdminStats {
  totalUsers: number;
  totalBusinesses: number;
  totalReviews: number;
  verifiedBusinesses: number;
  pendingVerifications: number;
  activeUsers: number;
  totalReports: number;
  pendingReports: number;
}

export interface AdminStore {
  stats: AdminStats;
  filteredUsers: User[];
  filteredBusinesses: Business[];
  pendingReviews: Review[];
  reportedContent: ReportedContent[];
  activityLogs: ActivityLog[];
  isLoading: boolean;
  error: string | null;
  initializeRealTimeUpdates: (userId: string, role: string) => void;
  fetchStats: () => Promise<void>;
  fetchUsers: (filters: UserFilters) => Promise<void>;
  fetchBusinesses: (filters: BusinessFilters) => Promise<void>;
  updateUserRole: (userId: string, role: 'user' | 'admin' | 'super_admin') => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  verifyBusiness: (businessId: string) => Promise<void>;
  deleteBusiness: (businessId: string) => Promise<void>;
  handleReport: (reportId: string, action: 'resolved' | 'dismissed') => Promise<void>;
}

export interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
}

export interface BusinessFilters {
  category?: string;
  verified?: boolean;
  search?: string;
}

export interface ReportedContent {
  id: string;
  type: 'review' | 'business' | 'user';
  targetId: string;
  reason: string;
  content: string;
  details?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  reportedBy: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
}

// Business related types
export interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  features: string[];
  location: {
    address: string;
    county: string;
    city: string;
    state: string;
    zipCode: string;
    latitude?: number;
    longitude?: number;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  operatingHours: Array<{
    day: string;
    open: string;
    close: string;
  }>;
  photos: string[];
  gallery: string[];
  imageUrl?: string;
  isVerified: boolean;
  verificationBadges: VerificationBadge[];
  stats: BusinessStats;
  owner: User;
  ownerId: string;
  priceRange: string;
  amenities: string[];
  createdAt: string;
  reviews: Review[];
  claims: BusinessClaim[];
}

export interface BusinessStats {
  id: string;
  businessId: string;
  totalReviews: number;
  averageRating: number;
  totalViews: number;
  totalBookmarks: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  user: User;
  rating: number;
  content: string;
  photos?: string[];
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessClaim {
  id: string;
  businessId: string;
  userId: string;
  documents: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface VerificationBadge {
  type: 'government' | 'business' | 'premium';
  issuedBy: string;
  issuedAt: string;
  expiresAt?: string;
}

// Chat related types
export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  read: boolean;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  messages: ChatMessage[];
  lastActivity: number;
}

export interface ChatStore {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  clearMessages: () => void;
  setIsLoading: (loading: boolean) => void;
}

// Analytics and Events
export interface Event {
  userId: string;
  type: string;
  data: any;
  timestamp: number;
}

export interface AnalyticsData {
  activeUsers: {
    hourly: number;
    daily: number;
    weekly: number;
  };
  topBusinesses: Array<{ id: string; score: number }>;
  trendingCategories: Array<{ category: string; trend: number }>;
  systemHealth: {
    responseTime: number;
    errorRate: number;
    serverLoad: {
      cpu: number;
      memory: number;
      diskSpace: number;
    };
  };
}

export interface UserInsights {
  totalEvents: number;
  lastActive: number;
  topCategories: string[];
  engagementScore: number;
}

export interface BusinessInsights {
  viewCount: number;
  interactionRate: number;
  peakHours: Array<{ hour: number; count: number }>;
  userDemographics: {
    locations: { [key: string]: number };
    devices: { [key: string]: number };
    userTypes: { [key: string]: number };
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
