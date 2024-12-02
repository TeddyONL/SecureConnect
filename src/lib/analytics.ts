import { Business, User, Event } from '../types';

export class AnalyticsService {
  private static readonly KAFKA_TOPIC = 'user-events';
  private static events: Event[] = [];

  // Track user event
  static async trackEvent(event: {
    userId: string;
    type: string;
    data: any;
    timestamp?: number;
  }) {
    const eventData = {
      ...event,
      timestamp: event.timestamp || Date.now()
    };

    // Store event (in production this would go to Kafka)
    this.events.push(eventData);

    // Process real-time analytics
    await this.processRealTimeAnalytics(eventData);
  }

  // Get user insights
  static async getUserInsights(userId: string) {
    const userEvents = this.events.filter(event => event.userId === userId);

    return {
      totalEvents: userEvents.length,
      lastActive: Math.max(...userEvents.map(e => e.timestamp)),
      topCategories: this.getTopCategories(userEvents),
      engagementScore: this.calculateEngagementScore(userEvents)
    };
  }

  // Get business insights
  static async getBusinessInsights(businessId: string) {
    const businessEvents = this.events.filter(
      event => event.data.businessId === businessId
    );

    return {
      viewCount: this.countEventType(businessEvents, 'view'),
      interactionRate: this.calculateInteractionRate(businessEvents),
      peakHours: this.analyzePeakHours(businessEvents),
      userDemographics: this.analyzeUserDemographics(businessEvents)
    };
  }

  // Get platform-wide analytics
  static async getPlatformAnalytics() {
    const timeRanges = {
      hour: Date.now() - 60 * 60 * 1000,
      day: Date.now() - 24 * 60 * 60 * 1000,
      week: Date.now() - 7 * 24 * 60 * 60 * 1000
    };

    return {
      activeUsers: {
        hourly: this.countActiveUsers(timeRanges.hour),
        daily: this.countActiveUsers(timeRanges.day),
        weekly: this.countActiveUsers(timeRanges.week)
      },
      topBusinesses: this.getTopBusinesses(),
      trendingCategories: this.getTrendingCategories(),
      systemHealth: this.getSystemHealthMetrics()
    };
  }

  // Private helper methods
  private static countEventType(events: Event[], type: string): number {
    return events.filter(event => event.type === type).length;
  }

  private static calculateInteractionRate(events: Event[]): number {
    const views = this.countEventType(events, 'view');
    const interactions = events.filter(event => 
      ['click', 'contact', 'review', 'bookmark'].includes(event.type)
    ).length;

    return views ? (interactions / views) * 100 : 0;
  }

  private static analyzePeakHours(events: Event[]): { hour: number; count: number }[] {
    const hourCounts = new Array(24).fill(0);

    events.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourCounts[hour]++;
    });

    return hourCounts.map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count);
  }

  private static analyzeUserDemographics(events: Event[]): any {
    // In a real implementation, this would analyze user data
    // from a user profile database
    return {
      locations: {},
      devices: {},
      userTypes: {}
    };
  }

  private static countActiveUsers(since: number): number {
    return new Set(
      this.events
        .filter(event => event.timestamp >= since)
        .map(event => event.userId)
    ).size;
  }

  private static getTopBusinesses(): Array<{ id: string; score: number }> {
    const businessScores = new Map<string, number>();

    this.events.forEach(event => {
      if (!event.data.businessId) return;
      
      const score = businessScores.get(event.data.businessId) || 0;
      businessScores.set(
        event.data.businessId,
        score + this.getEventScore(event.type)
      );
    });

    return Array.from(businessScores.entries())
      .map(([id, score]) => ({ id, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  private static getEventScore(type: string): number {
    const scores: { [key: string]: number } = {
      view: 1,
      click: 2,
      contact: 5,
      review: 10,
      bookmark: 3
    };
    return scores[type] || 0;
  }

  private static getTrendingCategories(): Array<{ category: string; trend: number }> {
    const categoryTrends = new Map<string, number>();
    const recentCutoff = Date.now() - 24 * 60 * 60 * 1000; // Last 24 hours

    this.events
      .filter(event => event.timestamp >= recentCutoff)
      .forEach(event => {
        if (!event.data.category) return;
        
        const trend = categoryTrends.get(event.data.category) || 0;
        categoryTrends.set(
          event.data.category,
          trend + this.getEventScore(event.type)
        );
      });

    return Array.from(categoryTrends.entries())
      .map(([category, trend]) => ({ category, trend }))
      .sort((a, b) => b.trend - a.trend);
  }

  private static getSystemHealthMetrics() {
    return {
      responseTime: this.calculateAverageResponseTime(),
      errorRate: this.calculateErrorRate(),
      serverLoad: this.getServerLoadMetrics()
    };
  }

  private static calculateAverageResponseTime(): number {
    // Mock implementation
    return Math.random() * 100 + 50; // 50-150ms
  }

  private static calculateErrorRate(): number {
    const errorEvents = this.events.filter(e => e.type === 'error').length;
    return errorEvents / this.events.length * 100;
  }

  private static getServerLoadMetrics() {
    // Mock implementation
    return {
      cpu: Math.random() * 60 + 20, // 20-80%
      memory: Math.random() * 50 + 30, // 30-80%
      diskSpace: Math.random() * 40 + 20 // 20-60%
    };
  }

  private static async processRealTimeAnalytics(event: Event) {
    // In production, this would:
    // 1. Send event to Kafka
    // 2. Update real-time dashboards
    // 3. Trigger alerts if necessary
    // 4. Update ML models
  }
}