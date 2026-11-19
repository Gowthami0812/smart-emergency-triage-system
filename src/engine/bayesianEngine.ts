export interface BayesianCase {
  id: string;
  name: string;
  condition: string;
  prior: number; // P(H)
  evidenceName: string;
  sensitivity: number; // P(E|H)
  falsePositiveRate: number; // P(E|~H)
  description: string;
}

export const PRESET_BAYESIAN_CASES: BayesianCase[] = [
  {
    id: 'case-ami',
    name: 'Acute Myocardial Infarction (AMI)',
    condition: 'Acute Coronary Syndrome',
    prior: 0.12, // Baseline ED chest pain prevalence
    evidenceName: 'ST-Segment Elevation on 12-lead ECG',
    sensitivity: 0.90, // P(ST-elevation | AMI)
    falsePositiveRate: 0.05, // P(ST-elevation | ~AMI)
    description: 'Calculates the updated probability of AMI when a patient presenting with acute chest pain exhibits positive ST-segment elevation.'
  },
  {
    id: 'case-pe',
    name: 'Pulmonary Embolism (PE)',
    condition: 'Acute Pulmonary Embolism',
    prior: 0.08,
    evidenceName: 'Elevated D-Dimer Assay (> 500 ng/mL)',
    sensitivity: 0.95,
    falsePositiveRate: 0.40,
    description: 'High sensitivity screening test where high false positive rate demonstrates need for clinical Wells scoring.'
  },
  {
    id: 'case-sepsis',
    name: 'Severe Sepsis Alert',
    condition: 'Systemic Sepsis / Bacteraemia',
    prior: 0.15,
    evidenceName: 'Serum Lactate > 2.5 mmol/L + Tachycardia',
    sensitivity: 0.85,
    falsePositiveRate: 0.12,
    description: 'Evaluates probability of severe systemic infection requiring immediate 1-hour antibiotic sepsis bundle.'
  }
];

export class BayesianEngine {
  /**
   * Calculate P(H|E) using Bayes' Rule
   */
  public static calculatePosterior(
    prior: number,
    sensitivity: number,
    falsePositiveRate: number
  ): {
    posteriorGivenPositive: number;
    posteriorGivenNegative: number;
    marginalEvidence: number;
    likelihoodRatioPositive: number;
    oddsPrior: number;
    oddsPosterior: number;
  } {
    // P(E) = P(E|H)*P(H) + P(E|~H)*P(~H)
    const marginalEvidence = (sensitivity * prior) + (falsePositiveRate * (1 - prior));
    
    // P(H|E) = (P(E|H) * P(H)) / P(E)
    const posteriorGivenPositive = marginalEvidence > 0 
      ? (sensitivity * prior) / marginalEvidence 
      : 0;

    // P(~E|H) = 1 - sensitivity
    // P(~E|~H) = 1 - falsePositiveRate
    const marginalNoEvidence = ((1 - sensitivity) * prior) + ((1 - falsePositiveRate) * (1 - prior));
    const posteriorGivenNegative = marginalNoEvidence > 0
      ? ((1 - sensitivity) * prior) / marginalNoEvidence
      : 0;

    const likelihoodRatioPositive = falsePositiveRate > 0 ? sensitivity / falsePositiveRate : 99;
    const oddsPrior = prior / (1 - prior);
    const oddsPosterior = oddsPrior * likelihoodRatioPositive;

    return {
      posteriorGivenPositive: Number(posteriorGivenPositive.toFixed(4)),
      posteriorGivenNegative: Number(posteriorGivenNegative.toFixed(4)),
      marginalEvidence: Number(marginalEvidence.toFixed(4)),
      likelihoodRatioPositive: Number(likelihoodRatioPositive.toFixed(2)),
      oddsPrior: Number(oddsPrior.toFixed(4)),
      oddsPosterior: Number(oddsPosterior.toFixed(4))
    };
  }
}
