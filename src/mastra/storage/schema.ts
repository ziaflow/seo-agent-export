/**
 * Database Schema for Marketing Analytics Data
 * Stores data from Google Analytics, Meta Pixel, TikTok Pixel, Microsoft Clarity
 */

export interface AnalyticsEvent {
  id: string;
  source: 'google_analytics' | 'meta_pixel' | 'tiktok_pixel' | 'microsoft_clarity';
  eventType: string;
  eventName: string;
  timestamp: Date;
  sessionId?: string;
  userId?: string;
  deviceCategory?: string;
  browser?: string;
  platform?: string;
  country?: string;
  city?: string;
  pageUrl?: string;
  referrer?: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface TrafficMetric {
  id: string;
  date: Date;
  source: string;
  sessions: number;
  users: number;
  newUsers: number;
  pageviews: number;
  bounceRate: number;
  avgSessionDuration: number;
  createdAt: Date;
}

export interface ConversionMetric {
  id: string;
  date: Date;
  source: string;
  conversions: number;
  conversionRate: number;
  revenue?: number;
  transactionId?: string;
  eventCategory?: string;
  eventAction?: string;
  createdAt: Date;
}

export interface SeoAudit {
  id: string;
  websiteUrl: string;
  auditDate: Date;
  overallScore: number;
  onPageScore: number;
  technicalScore: number;
  structureScore: number;
  issues: Array<{
    category: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    issue: string;
    recommendation: string;
  }>;
  createdAt: Date;
}

export interface ContentOpportunity {
  id: string;
  keyword: string;
  searchVolume: number;
  difficulty: number;
  intent: 'informational' | 'navigational' | 'commercial' | 'transactional';
  opportunity: string;
  status: 'identified' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratedContent {
  id: string;
  contentType: 'blog-post' | 'meta-description' | 'title-tag' | 'outline';
  keyword: string;
  content: string;
  seoScore: number;
  readabilityScore: number;
  status: 'draft' | 'review' | 'published';
  publishedUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
