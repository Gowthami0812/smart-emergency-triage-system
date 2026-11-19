import { PriorityLevel } from './patient';

export type RuleCategory = 
  | 'Airway/Breathing' 
  | 'Circulation' 
  | 'Neurological' 
  | 'Symptom-Severity' 
  | 'Multi-Factor' 
  | 'Synthesis' 
  | 'Reduction';

export type RuleType = 'production' | 'synthesis' | 'reduction';

export type ConditionField = 
  | 'spo2' 
  | 'heartRate' 
  | 'systolicBP' 
  | 'diastolicBP' 
  | 'temperature' 
  | 'respiratoryRate' 
  | 'symptoms' 
  | 'severity' 
  | 'hasHeartDisease' 
  | 'hasDiabetes' 
  | 'hasAsthma' 
  | 'age';

export type ConditionOperator = 
  | '<' 
  | '<=' 
  | '>' 
  | '>=' 
  | '==' 
  | '!=' 
  | 'contains' 
  | 'contains_any' 
  | 'is_true';

export interface RuleCondition {
  id: string;
  field: ConditionField;
  operator: ConditionOperator;
  value: any;
  label: string;
}

export interface RuleAction {
  priority: PriorityLevel;
  rationale: string;
  clinicalAlert: string;
  weight: number; // 90-100: Immediate (Red), 70-89: Urgent (Orange), 40-69: Prompt (Yellow), 10-39: Lower Urgency (Green)
}

export interface ProductionRule {
  id: string;
  name: string;
  category: RuleCategory;
  ruleType: RuleType;
  description: string;
  conditions: RuleCondition[];
  logicOperator: 'AND' | 'OR';
  action: RuleAction;
  enabled: boolean;
  isBuiltIn: boolean;
  createdAt?: string;
  updatedAt?: string;
  triggerCount?: number;
  
  // Learning & Refinement metadata (Unit 5)
  refinedFrom?: string;
  specializationNotes?: string;
  isLearned?: boolean;
}

export interface RuleExecutionTrace {
  ruleId: string;
  ruleName: string;
  ruleCategory: RuleCategory;
  evaluated: boolean;
  matched: boolean;
  matchedConditions: {
    condition: string;
    passed: boolean;
    actualValue: any;
  }[];
  resultingPriority?: PriorityLevel;
  actionTaken?: string;
}

export interface InferenceSession {
  patientId: string;
  timestamp: string;
  extractedFacts: Record<string, any>;
  applicableRulesCount: number;
  matchedRulesCount: number;
  traces: RuleExecutionTrace[];
  finalPriority: PriorityLevel;
  explanation: string;
}
