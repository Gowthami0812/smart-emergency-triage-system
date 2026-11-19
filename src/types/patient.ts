export type Gender = 'Male' | 'Female' | 'Other' | 'Prefer not to say';

export type SymptomCategory = 
  | 'Respiratory' 
  | 'Cardiac' 
  | 'Neurological' 
  | 'Gastrointestinal' 
  | 'General';

export type SymptomSeverity = 'mild' | 'moderate' | 'severe' | 'unknown';

export type PriorityLevel = 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN';

export interface VitalSigns {
  temperature: number; // Celsius (e.g. 37.0)
  heartRate: number; // bpm (e.g. 80)
  systolicBP: number; // mmHg (e.g. 120)
  diastolicBP: number; // mmHg (e.g. 80)
  respiratoryRate: number; // breaths/min (e.g. 16)
  spo2: number; // % (e.g. 98)
}

export interface MedicalHistory {
  diabetes: boolean;
  hypertension: boolean;
  heartDisease: boolean;
  asthma: boolean;
  previousSurgeries: boolean;
  allergies: boolean;
  otherConditions: string;
}

export interface Patient {
  id: string; // e.g. PT-2026-0101
  name: string;
  age: number;
  gender: Gender;
  assessmentDate: string; // ISO string or YYYY-MM-DD
  assessmentTime: string; // HH:mm
  symptoms: string[];
  vitals: VitalSigns;
  history: MedicalHistory;
  severity: SymptomSeverity;
  chiefComplaintNotes?: string;
}

export interface TriggeredRuleInfo {
  ruleId: string;
  ruleName: string;
  priorityAssigned: PriorityLevel;
  matchedConditions: string[];
  rationale: string;
  ruleCategory: string;
  weight: number;
}

export interface TriageResult {
  patientId: string;
  priority: PriorityLevel;
  priorityTitle: string; // e.g., "Immediate Emergency Assessment"
  priorityDescription: string;
  color: {
    bg: string;
    border: string;
    text: string;
    badge: string;
  };
  assessedAt: string;
  triggeredRules: TriggeredRuleInfo[];
  vitalFlags: {
    param: string;
    value: string;
    status: 'critical' | 'warning' | 'normal';
    message: string;
  }[];
  clinicalRationale: string;
  recommendedMaxWaitTime: string; // educational disclaimer: illustrative target wait
  actionRecommendations: string[];
  evidenceFactors: string[];
  uncertaintyScore: number; // 0 to 1
  beliefConfidence: number; // 0 to 1
}

export interface PatientRecord extends Patient {
  triageResult?: TriageResult;
  historyLog?: {
    date: string;
    priority: PriorityLevel;
    triggeredRulesCount: number;
    notes: string;
  }[];
}
