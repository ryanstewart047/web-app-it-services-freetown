// Comprehensive data models for analytics system

export interface VisitorSession {
  sessionId: string;
  firstVisit: string;
  lastActivity: string;
  pageViews: number;
  totalDuration: number;
  referrer: string;
  country: string;
  city: string;
  device: DeviceInfo;
  isReturning: boolean;
  conversionGoals: string[];
}

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  screenResolution: string;
  viewportSize: string;
  connectionType?: string;
  language: string;
  timezone: string;
}

export interface PageView {
  id: string;
  sessionId: string;
  timestamp: string;
  path: string;
  title: string;
  referrer: string;
  duration: number;
  scrollDepth: number;
  clicks: ClickEvent[];
  performance: PagePerformance;
  exitPage: boolean;
}

export interface ClickEvent {
  timestamp: string;
  element: string;
  elementText: string;
  elementType: string;
  coordinates: { x: number; y: number };
  ctrlKey: boolean;
  shiftKey: boolean;
}

export interface PagePerformance {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToFirstByte: number;
  resourceLoadTimes: ResourceTiming[];
}

export interface ResourceTiming {
  name: string;
  type: string;
  duration: number;
  size: number;
  cached: boolean;
}

export interface FormInteraction {
  formId: string;
  formType: string;
  sessionId: string;
  timestamp: string;
  events: FormEvent[];
  completion: {
    started: boolean;
    completed: boolean;
    abandoned: boolean;
    timeToComplete: number;
    timeToAbandon?: number;
  };
  fields: FormFieldData[];
}

export interface FormEvent {
  timestamp: string;
  type: 'focus' | 'blur' | 'change' | 'submit' | 'error';
  fieldName: string;
  value?: string;
  errorMessage?: string;
}

export interface FormFieldData {
  fieldName: string;
  fieldType: string;
  timeToFill: number;
  changesCount: number;
  finalValue: string;
  validationErrors: string[];
  helpUsed: boolean;
}

export interface BusinessMetrics {
  timestamp: string;
  revenue: {
    total: number;
    byService: Record<string, number>;
    byPaymentMethod: Record<string, number>;
    recurring: number;
    oneTime: number;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    churned: number;
    averageLifetimeValue: number;
  };
  services: {
    mostRequested: Array<{ service: string; count: number }>;
    completionRate: number;
    averageRating: number;
    averageResponseTime: number;
  };
  marketing: {
    conversionRate: number;
    costPerAcquisition: number;
    returnOnAdSpend: number;
    topChannels: Array<{ channel: string; conversions: number; cost: number }>;
  };
}

export interface UserBehavior {
  sessionId: string;
  userId?: string;
  actions: UserAction[];
  goals: ConversionGoal[];
  segments: string[];
  preferences: UserPreferences;
}

export interface UserAction {
  timestamp: string;
  type: 'page_view' | 'click' | 'form_interaction' | 'download' | 'video_play' | 'scroll' | 'search';
  target: string;
  value?: string;
  metadata: Record<string, any>;
}

export interface ConversionGoal {
  goalId: string;
  goalName: string;
  achieved: boolean;
  timestamp?: string;
  value?: number;
  funnel: FunnelStep[];
}

export interface FunnelStep {
  stepId: string;
  stepName: string;
  completed: boolean;
  timestamp?: string;
  timeToComplete?: number;
}

export interface UserPreferences {
  language: string;
  theme?: string;
  notifications: boolean;
  contactMethod: 'email' | 'phone' | 'sms';
  serviceInterests: string[];
  priceRange: string;
}

export interface ErrorContext {
  url: string;
  userAgent: string;
  timestamp: string;
  userId?: string;
  sessionId: string;
  breadcrumbs: Breadcrumb[];
  tags: Record<string, string>;
  extra: Record<string, any>;
}

export interface Breadcrumb {
  timestamp: string;
  category: string;
  message: string;
  level: 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}

export interface ABTest {
  testId: string;
  testName: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
  variants: ABVariant[];
  metrics: ABMetrics;
  segments: string[];
}

export interface ABVariant {
  variantId: string;
  variantName: string;
  description: string;
  trafficPercentage: number;
  isControl: boolean;
  conversions: number;
  visitors: number;
}

export interface ABMetrics {
  primaryMetric: string;
  secondaryMetrics: string[];
  confidenceLevel: number;
  significanceReached: boolean;
  winningVariant?: string;
}

export interface RealTimeMetrics {
  timestamp: string;
  activeUsers: number;
  pageViews: number;
  topPages: Array<{ path: string; views: number }>;
  topCountries: Array<{ country: string; users: number }>;
  recentEvents: RealtimeEvent[];
  alerts: SystemAlert[];
}

export interface RealtimeEvent {
  timestamp: string;
  type: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  userId?: string;
  sessionId: string;
}

export interface SystemAlert {
  id: string;
  timestamp: string;
  type: 'performance' | 'error' | 'security' | 'business';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  actions: string[];
}

export interface DataRetentionPolicy {
  visitorData: number; // days
  errorLogs: number;
  transactionData: number;
  analyticsData: number;
  userBehavior: number;
}

export interface PrivacySettings {
  anonymizeIPs: boolean;
  cookieConsent: boolean;
  dataProcessingConsent: boolean;
  retentionPeriod: number;
  allowDataExport: boolean;
  allowDataDeletion: boolean;
}

// Utility types for API responses
export interface AnalyticsResponse<T> {
  success: boolean;
  data: T;
  metadata: {
    timestamp: string;
    dataRange: {
      start: string;
      end: string;
    };
    totalRecords: number;
    filteredRecords: number;
  };
  errors?: string[];
}

export interface PaginatedResponse<T> extends AnalyticsResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Dashboard configuration types
export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'heatmap' | 'funnel';
  title: string;
  dataSource: string;
  configuration: Record<string, any>;
  position: { x: number; y: number; width: number; height: number };
  refreshInterval: number;
}

export interface DashboardLayout {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardFilter {
  id: string;
  name: string;
  type: 'date' | 'select' | 'multiselect' | 'text';
  options?: string[];
  defaultValue?: any;
  required: boolean;
}