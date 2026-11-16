export type UserRole = "Farmer" | "Agricultural Officer" | "Ministry Admin";

export type SupportedLanguage = "Hausa" | "Yoruba" | "Igbo" | "Nigerian Pidgin" | "English";

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  phoneNumber?: string;
  role: UserRole;
  state: string;
  lga?: string;
  preferredLanguage: SupportedLanguage;
  farmSizeHectares?: number;
  primaryCrops?: string[];
  photoURL?: string;
}

export type SeverityLevel = "Low" | "Medium" | "Critical";

export interface GeolocationCoords {
  latitude: number;
  longitude: number;
  state: string;
  lga?: string;
  locationName?: string;
}

export interface CropDiagnosis {
  id: string;
  farmerId: string;
  farmerName: string;
  cropType: string;
  disease_name: string;
  confidence_score: number;
  primary_symptoms: string[];
  immediate_treatment_plan: string[];
  preventative_measures: string[];
  severity_level: SeverityLevel;
  affected_plant_part?: string;
  localized_advice?: {
    hausa?: string;
    yoruba?: string;
    igbo?: string;
    pidgin?: string;
  };
  imageUrl: string;
  coordinates: GeolocationCoords;
  timestamp: number;
  verifiedByOfficer?: boolean;
  officerNotes?: string;
}

export type NewsCategory = 
  | "Government Policies" 
  | "Weather Alerts" 
  | "Fertilizer Availability" 
  | "Pest Surveillance" 
  | "Market Intelligence" 
  | "Weather Alert" 
  | "Fertilizer Subsidy" 
  | "Policy & Trade";

export interface MarketPriceItem {
  id: string;
  crop: string;
  variety?: string;
  unit: string;
  priceNgn: number;
  previousPriceNgn: number;
  changePercent: number;
  trend: "up" | "down" | "stable";
  supplyLevel: "Surplus" | "Stable" | "Deficit";
  state: string;
  marketName: string;
  zone?: string;
  lastUpdated: string;
  timestamp?: number;
}

export interface AgriNewsItem {
  id: string;
  title: string;
  category: NewsCategory;
  summary: string;
  content?: string;
  source: string;
  urgency: "Normal" | "Important" | "Critical";
  publishedAt: string;
  affectedStates?: string[];
  url?: string;
  isLive?: boolean;
  groundingSources?: { title: string; url: string }[];
}

export interface RegionalOutbreakData {
  state: string;
  zone: string;
  totalOutbreaks: number;
  activeAlerts: number;
  dominantDisease: string;
  primaryCropAtRisk: string;
  riskLevel: "Low" | "Moderate" | "High" | "Severe";
  estimatedLossPercent: number;
  lat: number;
  lng: number;
}

export interface VoiceAssistantQuery {
  audio?: string;
  audioMimeType?: string;
  textQuery?: string;
  language: SupportedLanguage;
  contextCrop?: string;
  state?: string;
}

export interface VoiceAssistantResponse {
  transcription?: string;
  response_text: string;
  english_translation?: string;
  key_recommendations: string[];
  audio_script?: string;
  language: SupportedLanguage;
  relevant_crops?: string[];
  recommended_inputs?: string[];
}

export interface AgriMapPlace {
  title: string;
  uri: string;
  address?: string;
  type?: string;
  phone?: string;
  snippets?: string[];
}

export interface MapsGroundingResponse {
  answerText: string;
  places: AgriMapPlace[];
  groundingSources: { title: string; url: string }[];
  searchQueries: string[];
  isLive: boolean;
}

export interface SearchGroundingResponse {
  answer: string;
  groundingSources: { title: string; url: string }[];
  searchQueries: string[];
  isLive: boolean;
  grounded: boolean;
}

export interface AudioTranscriptItem {
  id: string;
  userId?: string;
  transcription: string;
  confidence?: number;
  language?: string;
  timestamp: number;
  model: string;
  isSimulated?: boolean;
}
