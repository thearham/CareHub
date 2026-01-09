export interface MedicineRecommendation {
  medicine: string;
  confidence: number;
  reason: string;
}

export interface RecommendationRequest {
  medicine_name: string;
  patient_info?: {
    age?: number;
    symptoms?: string;
    medical_history?: string;
  };
}

export interface RecommendationResponse {
  id: number;
  medicine_name: string;
  recommendations: MedicineRecommendation[];
  alternatives: string[];
  warnings: string[];
  cached: boolean;
  response_time_ms: number;
}

export interface RecommendationStats {
  total_recommendations: number;
  unique_medicines: number;
  avg_response_time_ms: number;
  top_medicines: string[];
}
