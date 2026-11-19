import { ProductionRule, RuleCondition } from '../types/rules';
import { PatientRecord } from '../types/patient';

export interface RuleAnomaly {
  type: 'Redundancy' | 'Conflict' | 'Subsumption' | 'DeadRule';
  severity: 'Warning' | 'High' | 'Info';
  ruleIds: string[];
  message: string;
  explanation: string;
  suggestedFix: string;
}

export interface RuleRefinementComparison {
  originalRule: ProductionRule;
  refinedRule: ProductionRule;
  refinementType: 'Specialization' | 'Generalization';
  coverageBefore: number;
  coverageAfter: number;
  specificityBefore: number;
  specificityAfter: number;
  explanation: string;
}

export class RuleLearnerEngine {
  /**
   * Analyze rule base for anomalies (Redundancy, Subsumption, Conflict)
   */
  public static analyzeRuleBase(rules: ProductionRule[]): RuleAnomaly[] {
    const anomalies: RuleAnomaly[] = [];
    const activeRules = rules.filter(r => r.enabled);

    for (let i = 0; i < activeRules.length; i++) {
      for (let j = i + 1; j < activeRules.length; j++) {
        const r1 = activeRules[i];
        const r2 = activeRules[j];

        // Check for Conflict: Similar condition fields but conflicting priorities
        const r1Fields = r1.conditions.map(c => `${c.field}-${c.operator}`);
        const r2Fields = r2.conditions.map(c => `${c.field}-${c.operator}`);
        const sharedFields = r1Fields.filter(f => r2Fields.includes(f));

        if (sharedFields.length > 0 && sharedFields.length === r1Fields.length && sharedFields.length === r2Fields.length) {
          if (r1.action.priority !== r2.action.priority) {
            anomalies.push({
              type: 'Conflict',
              severity: 'High',
              ruleIds: [r1.id, r2.id],
              message: `Conflicting actions between ${r1.id} and ${r2.id}`,
              explanation: `Both rules test identical condition signatures (${sharedFields.join(', ')}) but assign opposing priority levels (${r1.action.priority} vs ${r2.action.priority}). This creates non-deterministic production system behavior.`,
              suggestedFix: 'Differentiate the conditions using more specific physiological thresholds or remove the conflicting rule.'
            });
          } else {
            anomalies.push({
              type: 'Redundancy',
              severity: 'Warning',
              ruleIds: [r1.id, r2.id],
              message: `Redundant production rules ${r1.id} and ${r2.id}`,
              explanation: `Rules ${r1.id} and ${r2.id} share the exact same condition fields and both produce ${r1.action.priority} priority. One of them is logically redundant.`,
              suggestedFix: 'Merge the rules or disable the duplicate entry.'
            });
          }
        }

        // Subsumption check
        if (r1.action.priority === r2.action.priority) {
          const r1SubsumesR2 = r2.conditions.length > r1.conditions.length && 
            r1.conditions.every(c1 => r2.conditions.some(c2 => c1.field === c2.field && c1.operator === c2.operator));

          if (r1SubsumesR2) {
            anomalies.push({
              type: 'Subsumption',
              severity: 'Info',
              ruleIds: [r1.id, r2.id],
              message: `Rule ${r1.id} subsumes ${r2.id}`,
              explanation: `${r1.id} is more general than ${r2.id} and produces the same priority. In a forward chaining engine, ${r1.id} will fire whenever ${r2.id} fires, making ${r2.id} shadowed.`,
              suggestedFix: 'Review if the more specialized rule requires a higher priority or additional distinct action.'
            });
          }
        }
      }
    }

    return anomalies;
  }

  /**
   * Demonstrate Rule Specialization (Adding condition / tightening threshold)
   */
  public static specializeRule(
    baseRule: ProductionRule,
    newCondition: RuleCondition,
    rationaleAddition: string
  ): ProductionRule {
    return {
      ...baseRule,
      id: `${baseRule.id}-SPEC`,
      name: `${baseRule.name} (Specialized)`,
      description: `Specialized version of ${baseRule.id}: Added constraint [${newCondition.label}]. Reduces false positive triggering.`,
      conditions: [...baseRule.conditions, newCondition],
      refinedFrom: baseRule.id,
      specializationNotes: rationaleAddition,
      action: {
        ...baseRule.action,
        rationale: `${baseRule.action.rationale} [Specialized with ${newCondition.label}]`
      },
      isLearned: true
    };
  }

  /**
   * Demonstrate Rule Generalization (Dropping condition / loosening threshold)
   */
  public static generalizeRule(
    baseRule: ProductionRule,
    conditionIdToRemove: string
  ): ProductionRule {
    const retainedConditions = baseRule.conditions.filter(c => c.id !== conditionIdToRemove);
    return {
      ...baseRule,
      id: `${baseRule.id}-GEN`,
      name: `${baseRule.name} (Generalized)`,
      description: `Generalized version of ${baseRule.id}: Dropped condition to broaden coverage across emergency patient population.`,
      conditions: retainedConditions,
      refinedFrom: baseRule.id,
      isLearned: true
    };
  }

  /**
   * Inductive Rule Induction: Derive candidate hypothesis rule from patient records
   */
  public static induceCandidateRuleFromCases(cases: PatientRecord[], targetPriority: 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN'): {
    candidateRule: ProductionRule;
    trainingAccuracy: number;
    supportCount: number;
  } {
    const matchingCases = cases.filter(c => c.triageResult?.priority === targetPriority);
    
    // Find most frequent symptom in these cases
    const symptomFreq: Record<string, number> = {};
    matchingCases.forEach(c => {
      c.symptoms.forEach(s => {
        symptomFreq[s] = (symptomFreq[s] || 0) + 1;
      });
    });

    const topSymptom = Object.entries(symptomFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Chest pain';

    const candidateRule: ProductionRule = {
      id: `LEARNED-${targetPriority}-01`,
      name: `Inductively Learned Rule: ${topSymptom} Pattern`,
      category: 'Symptom-Severity',
      ruleType: 'production',
      description: `Inductively mined from historical patient registry: Correlates '${topSymptom}' with ${targetPriority} priority.`,
      conditions: [
        {
          id: 'ind-1',
          field: 'symptoms',
          operator: 'contains',
          value: topSymptom,
          label: `Symptom contains "${topSymptom}"`
        }
      ],
      logicOperator: 'AND',
      action: {
        priority: targetPriority,
        rationale: `Inductively generated association: Frequently observed in historical ${targetPriority} triage cohorts.`,
        clinicalAlert: 'Subject to clinical validation prior to deployment.',
        weight: targetPriority === 'RED' ? 90 : targetPriority === 'ORANGE' ? 75 : 50
      },
      enabled: false,
      isBuiltIn: false,
      isLearned: true
    };

    const supportCount = matchingCases.length;
    const trainingAccuracy = matchingCases.length > 0 ? Number((matchingCases.length / Math.max(1, cases.length)).toFixed(2)) : 0.8;

    return { candidateRule, trainingAccuracy, supportCount };
  }
}
