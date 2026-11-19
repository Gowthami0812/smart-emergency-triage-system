import { AbductiveHypothesis } from '../types/uncertainty';

interface ClinicalEtiology {
  id: string;
  conditionName: string;
  category: string;
  cardinalSymptoms: string[];
  vitalPatterns: string[];
  basePrior: number; // 0 to 1
  rationale: string;
}

const ETIOLOGY_KNOWLEDGE_BASE: ClinicalEtiology[] = [
  {
    id: 'eti-ami',
    conditionName: 'Acute Coronary Syndrome / Myocardial Infarction',
    category: 'Cardiovascular',
    cardinalSymptoms: ['Chest pain', 'Difficulty breathing', 'Weakness', 'Dizziness'],
    vitalPatterns: ['Hypoxia (SpO2 < 92%)', 'Tachycardia', 'Hypertension'],
    basePrior: 0.18,
    rationale: 'Myocardial ischemia produces severe retrosternal pressure, secondary dyspnea from elevated left ventricular end-diastolic pressure, and autonomic diaphoresis.'
  },
  {
    id: 'eti-pe',
    conditionName: 'Acute Pulmonary Embolism',
    category: 'Cardiovascular / Pulmonary',
    cardinalSymptoms: ['Difficulty breathing', 'Chest pain', 'Dizziness'],
    vitalPatterns: ['Hypoxia (SpO2 < 90%)', 'Tachycardia', 'Tachypnea'],
    basePrior: 0.09,
    rationale: 'Pulmonary arterial occlusion causes dead-space ventilation, sudden acute dyspnea, pleuritic chest discomfort, and right ventricular strain.'
  },
  {
    id: 'eti-asthma',
    conditionName: 'Acute Bronchial Asthma Exacerbation',
    category: 'Respiratory',
    cardinalSymptoms: ['Difficulty breathing', 'Weakness'],
    vitalPatterns: ['Tachypnea (RR > 24)', 'Hypoxia (SpO2 <= 92%)'],
    basePrior: 0.15,
    rationale: 'Airway hyperresponsiveness leads to bronchospasm, mucous plugging, expiratory wheeze, and ventilation-perfusion mismatch.'
  },
  {
    id: 'eti-sepsis',
    conditionName: 'Intra-Abdominal Sepsis / Peritonitis',
    category: 'Gastrointestinal / Infectious',
    cardinalSymptoms: ['Abdominal pain', 'Fever', 'Vomiting', 'Weakness'],
    vitalPatterns: ['Pyrexia (Temp >= 38.5)', 'Tachycardia (HR > 100)'],
    basePrior: 0.11,
    rationale: 'Visceral inflammation or perforation triggers peritoneal irritation, systemic inflammatory cascade, and compensatory circulatory tachycardia.'
  },
  {
    id: 'eti-cva',
    conditionName: 'Hypertensive Cerebrovascular Emergency',
    category: 'Neurological',
    cardinalSymptoms: ['Headache', 'Dizziness', 'Weakness'],
    vitalPatterns: ['Severe Hypertension (Systolic >= 180)'],
    basePrior: 0.08,
    rationale: 'Autoregulatory failure under acute pressure spikes leads to cerebral hyperperfusion, headache, intracranial pressure rise, and focal deficits.'
  },
  {
    id: 'eti-gastro',
    conditionName: 'Acute Febrile Gastroenteritis',
    category: 'Gastrointestinal',
    cardinalSymptoms: ['Vomiting', 'Abdominal pain', 'Fever', 'Weakness'],
    vitalPatterns: ['Mild Tachycardia', 'Mild Pyrexia'],
    basePrior: 0.22,
    rationale: 'Enteric viral or bacterial invasion causes mucosal hypersecretion, cramps, vomiting, and dehydration.'
  },
  {
    id: 'eti-tension',
    conditionName: 'Tension-Type Headache / Mild Fatigue',
    category: 'General Ambulatory',
    cardinalSymptoms: ['Headache', 'Weakness'],
    vitalPatterns: ['Normal Vitals'],
    basePrior: 0.35,
    rationale: 'Pericranial myofascial tension or fatigue manifesting as mild bilateral head pressure with preserved physiological homeostasis.'
  }
];

export class AbductiveReasoningEngine {
  /**
   * Perform abductive inference: Given observed symptoms, infer most plausible explanatory etiologies
   */
  public static inferExplanations(observedSymptoms: string[], severity: string): AbductiveHypothesis[] {
    if (!observedSymptoms || observedSymptoms.length === 0) {
      return [];
    }

    const hypotheses: AbductiveHypothesis[] = [];

    for (const etiology of ETIOLOGY_KNOWLEDGE_BASE) {
      // Find explained symptoms: intersection of observed symptoms with etiology's symptoms
      const explained = observedSymptoms.filter(s => 
        etiology.cardinalSymptoms.some(cs => cs.toLowerCase() === s.toLowerCase())
      );

      // Find unexplained symptoms
      const unexplained = observedSymptoms.filter(s => 
        !etiology.cardinalSymptoms.some(cs => cs.toLowerCase() === s.toLowerCase())
      );

      // Explanatory power: fraction of patient's observed symptoms covered by this etiology
      const coverage = explained.length / observedSymptoms.length;

      // Symptom specificity: fraction of the etiology's cardinal symptoms present in the patient
      const specificity = explained.length / etiology.cardinalSymptoms.length;

      if (explained.length > 0) {
        // Combined plausibility metric (Bayesian-inspired heuristic)
        let severityMultiplier = 1.0;
        if (severity === 'severe' && (etiology.category.includes('Cardio') || etiology.category.includes('Pulm') || etiology.category.includes('Neuro'))) {
          severityMultiplier = 1.25;
        }

        const plausibility = Math.min(0.98, Math.max(0.05, 
          (etiology.basePrior * 0.3 + coverage * 0.45 + specificity * 0.25) * severityMultiplier
        ));

        hypotheses.push({
          id: etiology.id,
          conditionName: etiology.conditionName,
          category: etiology.category,
          priorLikelihood: etiology.basePrior,
          explanatoryPower: Number(coverage.toFixed(2)),
          explainedSymptoms: explained,
          unexplainedSymptoms: unexplained,
          plausibilityScore: Number(plausibility.toFixed(2)),
          clinicalRationale: etiology.rationale
        });
      }
    }

    // Sort by plausibility score descending
    return hypotheses.sort((a, b) => b.plausibilityScore - a.plausibilityScore);
  }
}
