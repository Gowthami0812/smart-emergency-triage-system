export type OntologyNodeType = 
  | 'Root' 
  | 'Concept' 
  | 'SubConcept' 
  | 'Instance' 
  | 'Property' 
  | 'FeatureValue';

export type RelationType = 
  | 'is_a' 
  | 'has_symptom' 
  | 'has_vital_sign' 
  | 'has_medical_history' 
  | 'belongs_to' 
  | 'has_severity' 
  | 'generates' 
  | 'part_of' 
  | 'maps_to';

export interface OntologyNode {
  id: string;
  label: string;
  type: OntologyNodeType;
  category: 'Patient' | 'Symptom' | 'VitalSign' | 'History' | 'Severity' | 'Priority' | 'System';
  description: string;
  definingFeatures?: string[];
  objectFeatures?: Record<string, string>;
  inheritedFeatures?: string[];
  transitiveAncestors?: string[];
  examples?: string[];
  synonyms?: string[];
  x?: number;
  y?: number;
  color?: string;
}

export interface OntologyEdge {
  id: string;
  source: string;
  target: string;
  relation: RelationType;
  label: string;
  isTransitive?: boolean;
  isInherited?: boolean;
}

export interface OntologyMatchingItem {
  sourceTerm: string;
  sourceOntology: string; // e.g., "Internal Triage Ontology"
  targetTerm: string;
  targetOntology: string; // e.g., "SNOMED-CT" or "ICD-10-CM"
  similarityScore: number; // 0.0 - 1.0
  matchType: 'Exact' | 'Synonym' | 'Subsumption' | 'Partial';
  mappingRationale: string;
}
