export interface AbductiveHypothesis {
  id: string;
  conditionName: string;
  category: string;
  priorLikelihood: number; // 0 - 1
  explanatoryPower: number; // 0 - 1 (how many symptoms this explains)
  explainedSymptoms: string[];
  unexplainedSymptoms: string[];
  plausibilityScore: number; // combined metric
  clinicalRationale: string;
}

export interface BayesianScenario {
  id: string;
  hypothesisName: string;
  prior: number; // P(H)
  evidenceName: string;
  sensitivity: number; // P(E|H) - true positive rate
  falsePositiveRate: number; // P(E|~H)
  observedEvidence: boolean;
}

export interface DempsterShaferMass {
  hypothesisSet: string[]; // e.g. ['RED'], ['RED', 'ORANGE'], ['THETA']
  mass: number; // m(A) in [0, 1], sum of masses = 1
  label: string;
}

export interface DempsterShaferResult {
  focalSet: string;
  belief: number; // Bel(A)
  plausibility: number; // Pl(A)
  uncertaintyInterval: [number, number];
  mass: number;
}

export interface FuzzyMembershipPoint {
  x: number;
  y: number;
}

export interface FuzzySet {
  name: string; // e.g. "Hypothermia", "Normal", "Fever", "High Fever"
  color: string;
  type: 'triangular' | 'trapezoidal';
  points: [number, number, number] | [number, number, number, number];
}

export interface FuzzyVariable {
  name: string;
  unit: string;
  min: number;
  max: number;
  currentValue: number;
  sets: FuzzySet[];
}

export interface AgentPEAS {
  performance: string[];
  environment: string[];
  actuators: string[];
  sensors: string[];
  agentCycle: {
    perceive: string;
    deliberate: string;
    infer: string;
    act: string;
    learn: string;
  };
}

export interface MixedInitiativeDecision {
  patientId: string;
  systemRecommendation: string;
  systemConfidence: number;
  clinicianOverride?: string;
  clinicianRationale?: string;
  overridden: boolean;
  timestamp: string;
}
