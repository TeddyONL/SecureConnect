// Add these new types to your existing types.ts file

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

// ... (keep existing types)