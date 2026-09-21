export type VerificationStatus = 
  | 'Official Source'
  | 'Verified Local Partner'
  | 'Community Submitted'
  | 'Curated Pilot Data';

export type ProviderCategory = 
  | 'Homestay'
  | 'Small Hotel'
  | 'Local Guide'
  | 'Restaurant'
  | 'Food Experience'
  | 'Artisan Workshop'
  | 'Cultural Workshop'
  | 'Activity Operator'
  | 'Local Transport';

export type TravellerType = 
  | 'Student'
  | 'Solo'
  | 'Family'
  | 'Senior-friendly'
  | 'International visitor'
  | 'Budget traveller';

export type TravelStyle = 'Budget' | 'Balanced' | 'Comfort';
export type TransportPreference = 'Public transport' | 'Auto/taxi' | 'Rental vehicle' | 'Walking-friendly';
export type CrowdPreference = 'Popular places are okay' | 'Balanced' | 'Prefer less crowded places';

export type IssueCategory = 
  | 'Safety'
  | 'Cleanliness'
  | 'Accessibility'
  | 'Incorrect price'
  | 'Incorrect opening hours'
  | 'Transport issue'
  | 'Closed location'
  | 'Harassment/misconduct'
  | 'Other';

export type IssueSeverity = 'Low' | 'Medium' | 'High' | 'Urgent';
export type ModerationStatus = 'Pending' | 'Approved' | 'Under Review' | 'Resolved' | 'Rejected' | 'Investigating' | 'Dismissed';

export type UserRole = 'traveller' | 'provider' | 'admin';
export type ProviderReviewStatus = 
  | 'Approved' 
  | 'Pending' 
  | 'Changes Requested' 
  | 'Suspended' 
  | 'Rejected' 
  | 'Submitted' 
  | 'Contact verified' 
  | 'Location verified' 
  | 'Needs re-verification';

export interface Destination {
  id: string;
  name: string;
  tagline: string;
  area: string;
  coordinates: { lat: number; lng: number };
  description: string;
  category: 'Beach' | 'Heritage' | 'Hill Station' | 'Wildlife' | 'Culture' | 'Backwater';
  crowdLevel: 'Low' | 'Moderate' | 'High';
  bestTimeToVisit: string;
  publicTransportFeasibility: 'High' | 'Moderate' | 'Low';
  accessibilityRating: 'Full' | 'Partial' | 'Limited';
  safetyRating: string;
  image: string;
  source: string;
  verificationStatus: VerificationStatus;
  lastUpdated: string;
  activeStatus: boolean;
  highlights?: string[];
  entryFee?: string;
  accessibilityNotes?: string;
  publicTransportAccess?: string;
}

export interface Provider {
  id: string;
  name: string;
  category: ProviderCategory;
  location: string;
  destinationId?: string;
  coordinates: { lat: number; lng: number };
  priceRange: string;
  startingPrice: number;
  description: string;
  services: string[];
  languages: string[];
  phone: string;
  whatsapp: string;
  verificationStatus: VerificationStatus;
  source: string;
  lastVerifiedDate: string;
  lastUpdated: string;
  communityImpact: string;
  accessibilityNotes: string;
  safetyNotes: string;
  seasonality: string;
  image: string;
  activeStatus: boolean;
  adminReviewStatus: ProviderReviewStatus;
  contactVerified: boolean;
  locationVerified: boolean;
  documentsVerified: boolean;
  consentSigned: boolean;
  submittedDate: string;
  rating?: number;
  reviewsCount?: number;
}

export interface ItineraryStop {
  id: string;
  time: string;
  activityOrProviderName: string;
  category: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  estimatedTime: string;
  estimatedCost: number;
  travelTimeToNext?: string;
  distanceToNext?: string;
  transitModeToNext?: string;
  verificationBadge: VerificationStatus;
  sourceLabel: string;
  lastUpdated: string;
  accessibilityNote: string;
  safetyNote: string;
  whyRecommended: string;
  image: string;
  providerId?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  dayTitle: string;
  theme: string;
  stops: ItineraryStop[];
}

export interface CostBreakdown {
  stay: number;
  food: number;
  transport: number;
  activities: number;
  emergencyBuffer: number;
  total: number;
}

export interface ResponsibleScoreBreakdown {
  overall: number; // 0-100
  budgetFit: number; // 0-20 (or scaled 0-100)
  communityBenefit: number; // 0-20
  safetyConfidence: number; // 0-20
  accessibilityMatch: number; // 0-15
  publicTransportFeasibility: number; // 0-15
  crowdSuitability: number; // 0-10
  explanation: string;
}

export interface TripPlanPreferences {
  startingPoint: string;
  destinationArea: string;
  dates: string;
  numberOfDays: number;
  numberOfTravellers: number;
  totalBudget: number;
  travellerType: TravellerType;
  travelStyle: TravelStyle;
  transportPreference: TransportPreference;
  crowdPreference: CrowdPreference;
  interests: string[];
  dietaryPreference: string;
  languagePreference: 'English' | 'Malayalam' | 'Hindi';
  accessibilityNeeds: string[];
  safetyPreferences: string[];
}

export interface IssueReport {
  id: string;
  category: IssueCategory;
  relatedEntity: string;
  destination: string;
  severity: IssueSeverity;
  description: string;
  timestamp: string;
  moderationStatus: ModerationStatus;
  hasLocationShared: boolean;
  hasImageAttached: boolean;
  isSensitive: boolean;
  resolutionNotes?: string;
  adminNotes?: string;
}

export interface TravellerFeedback {
  id: string;
  travellerName: string;
  travellerType: string;
  rating: number;
  comment: string;
  destination: string;
  date: string;
  responsibleAspect: string;
}

export type CommunityFeedbackItem = TravellerFeedback;

export interface AuditLog {
  id: string;
  timestamp: string;
  actor?: string;
  action: string;
  targetEntity: string;
  details?: string;
  performedBy?: string;
  reason?: string;
}

export type AuditLogEntry = AuditLog;
