import { Patient, PriorityLevel, TriageResult, TriggeredRuleInfo } from '../types/patient';
import { ProductionRule, RuleExecutionTrace, InferenceSession } from '../types/rules';

const PRIORITY_ORDER: Record<PriorityLevel, number> = {
  RED: 4,
  ORANGE: 3,
  YELLOW: 2,
  GREEN: 1
};

export const PRIORITY_CONFIG: Record<PriorityLevel, {
  title: string;
  description: string;
  maxWait: string;
  color: {
    bg: string;
    border: string;
    text: string;
    badge: string;
    accent: string;
  };
  actions: string[];
}> = {
  RED: {
    title: 'Immediate Emergency Assessment',
    description: 'Resuscitation / Immediately life-threatening physiological decompensation. Zero allowable triage wait.',
    maxWait: 'Immediate (0 minutes)',
    color: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      badge: 'bg-red-600 text-white',
      accent: '#dc2626'
    },
    actions: [
      'Immediate resuscitation bay allocation',
      'Continuous cardiopulmonary & SpO2 monitoring',
      'Direct nursing supervision (1:1 ratio)',
      'Prepare emergency airway / IV resuscitation equipment'
    ]
  },
  ORANGE: {
    title: 'Urgent Assessment',
    description: 'Emergent condition with imminent risk of deterioration or severe distress requiring urgent medical intervention.',
    maxWait: '<= 15 minutes',
    color: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-900',
      badge: 'bg-orange-600 text-white',
      accent: '#ea580c'
    },
    actions: [
      'Transfer to acute clinical assessment cubicle',
      'Stat diagnostic workup (12-lead ECG, blood sampling)',
      'Frequent vital signs reassessment every 15 minutes',
      'Physician bedside evaluation within 15 minutes'
    ]
  },
  YELLOW: {
    title: 'Prompt Assessment',
    description: 'Potentially serious condition requiring timely medical evaluation, symptom relief, and diagnostic investigation.',
    maxWait: '<= 60 minutes',
    color: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      badge: 'bg-amber-500 text-white',
      accent: '#d97706'
    },
    actions: [
      'Observation area placement',
      'Point-of-care laboratory screening as indicated',
      'Analgesia / antipyresis protocol administration',
      'Vital sign check every 30-45 minutes'
    ]
  },
  GREEN: {
    title: 'Lower Apparent Urgency',
    description: 'Stable condition with normal physiological vital signs and low acute morbidity risk. Subject to clinical queue monitoring.',
    maxWait: '<= 120 minutes',
    color: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-900',
      badge: 'bg-emerald-600 text-white',
      accent: '#059669'
    },
    actions: [
      'Ambulatory fast-track waiting queue',
      'Patient educated to notify staff immediately if new symptoms appear',
      'Scheduled visual nurse re-triage at 60 minutes',
      'Routine medical consultation'
    ]
  }
};

export class KnowledgeInferenceEngine {
  /**
   * Extract working memory facts from patient record
   */
  public static extractFacts(patient: Patient): Record<string, any> {
    return {
      id: patient.id,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      symptoms: patient.symptoms || [],
      symptomsCount: (patient.symptoms || []).length,
      severity: patient.severity,
      // Vital signs
      spo2: patient.vitals.spo2,
      heartRate: patient.vitals.heartRate,
      systolicBP: patient.vitals.systolicBP,
      diastolicBP: patient.vitals.diastolicBP,
      temperature: patient.vitals.temperature,
      respiratoryRate: patient.vitals.respiratoryRate,
      // Medical history flags
      hasHeartDisease: patient.history.heartDisease,
      hasDiabetes: patient.history.diabetes,
      hasAsthma: patient.history.asthma,
      hasHypertension: patient.history.hypertension,
      hasPreviousSurgeries: patient.history.previousSurgeries,
      hasAllergies: patient.history.allergies,
      otherConditions: patient.history.otherConditions
    };
  }

  /**
   * Evaluate a single condition against extracted facts
   */
  private static evaluateCondition(condition: any, facts: Record<string, any>): { passed: boolean; actualValue: any } {
    const { field, operator, value } = condition;
    const actual = facts[field];

    if (actual === undefined || actual === null) {
      return { passed: false, actualValue: 'Undefined' };
    }

    let passed = false;

    switch (operator) {
      case '<':
        passed = Number(actual) < Number(value);
        break;
      case '<=':
        passed = Number(actual) <= Number(value);
        break;
      case '>':
        passed = Number(actual) > Number(value);
        break;
      case '>=':
        if (field === 'symptoms' && Array.isArray(actual)) {
          passed = actual.length >= Number(value);
        } else {
          passed = Number(actual) >= Number(value);
        }
        break;
      case '==':
        passed = String(actual).toLowerCase() === String(value).toLowerCase();
        break;
      case '!=':
        passed = String(actual).toLowerCase() !== String(value).toLowerCase();
        break;
      case 'contains':
        if (Array.isArray(actual)) {
          passed = actual.some(item => 
            String(item).toLowerCase().includes(String(value).toLowerCase())
          );
        } else {
          passed = String(actual).toLowerCase().includes(String(value).toLowerCase());
        }
        break;
      case 'contains_any':
        if (Array.isArray(actual) && Array.isArray(value)) {
          passed = value.some(target => 
            actual.some(item => String(item).toLowerCase().includes(String(target).toLowerCase()))
          );
        }
        break;
      case 'is_true':
        passed = actual === true;
        break;
      default:
        passed = false;
    }

    return { passed, actualValue: actual };
  }

  /**
   * Run the production rule inference cycle
   */
  public static runInference(patient: Patient, rules: ProductionRule[]): {
    triageResult: TriageResult;
    session: InferenceSession;
  } {
    const facts = this.extractFacts(patient);
    const traces: RuleExecutionTrace[] = [];
    const triggeredRules: TriggeredRuleInfo[] = [];

    // Filter enabled rules
    const activeRules = rules.filter(r => r.enabled);

    for (const rule of activeRules) {
      const conditionResults = rule.conditions.map(c => {
        const evalRes = this.evaluateCondition(c, facts);
        return {
          condition: c.label || `${c.field} ${c.operator} ${c.value}`,
          passed: evalRes.passed,
          actualValue: evalRes.actualValue
        };
      });

      // AND / OR aggregation
      let ruleMatched = false;
      if (rule.logicOperator === 'OR') {
        ruleMatched = conditionResults.some(r => r.passed);
      } else {
        ruleMatched = conditionResults.every(r => r.passed);
      }

      traces.push({
        ruleId: rule.id,
        ruleName: rule.name,
        ruleCategory: rule.category,
        evaluated: true,
        matched: ruleMatched,
        matchedConditions: conditionResults,
        resultingPriority: ruleMatched ? rule.action.priority : undefined,
        actionTaken: ruleMatched ? rule.action.rationale : undefined
      });

      if (ruleMatched) {
        triggeredRules.push({
          ruleId: rule.id,
          ruleName: rule.name,
          priorityAssigned: rule.action.priority,
          matchedConditions: conditionResults.filter(c => c.passed).map(c => c.condition),
          rationale: rule.action.rationale,
          ruleCategory: rule.category,
          weight: rule.action.weight
        });
      }
    }

    // Conflict Resolution: Find highest priority tier triggered, then highest weight
    let finalPriority: PriorityLevel = 'GREEN';
    let highestRank = 0;
    let selectedRule: TriggeredRuleInfo | null = null;

    if (triggeredRules.length > 0) {
      // Sort triggered rules by Priority Order descending, then weight descending
      const sortedRules = [...triggeredRules].sort((a, b) => {
        const pDiff = PRIORITY_ORDER[b.priorityAssigned] - PRIORITY_ORDER[a.priorityAssigned];
        if (pDiff !== 0) return pDiff;
        return b.weight - a.weight;
      });

      selectedRule = sortedRules[0];
      finalPriority = selectedRule.priorityAssigned;
    } else {
      // Default deductive fallback rule: Check if any vitals deviate from safe normal ranges
      const abnormalVitals: string[] = [];
      if (patient.vitals.spo2 < 95) abnormalVitals.push(`Borderline SpO2 (${patient.vitals.spo2}%)`);
      if (patient.vitals.heartRate > 100) abnormalVitals.push(`Tachycardia (${patient.vitals.heartRate} bpm)`);
      if (patient.vitals.heartRate < 55) abnormalVitals.push(`Bradycardia (${patient.vitals.heartRate} bpm)`);
      if (patient.vitals.systolicBP > 140) abnormalVitals.push(`Elevated BP (${patient.vitals.systolicBP} mmHg)`);
      if (patient.vitals.systolicBP < 95) abnormalVitals.push(`Low Systolic BP (${patient.vitals.systolicBP} mmHg)`);
      if (patient.vitals.temperature >= 38.0) abnormalVitals.push(`Pyrexia (${patient.vitals.temperature} °C)`);

      if (abnormalVitals.length > 0 || patient.severity === 'severe') {
        finalPriority = 'YELLOW';
      } else {
        finalPriority = 'GREEN';
      }
    }

    // Analyze vital sign physiological flags
    const vitalFlags: TriageResult['vitalFlags'] = [];
    const v = patient.vitals;

    // SpO2
    if (v.spo2 < 90) {
      vitalFlags.push({ param: 'SpO2', value: `${v.spo2}%`, status: 'critical', message: 'Severe arterial hypoxemia (<90%)' });
    } else if (v.spo2 <= 94) {
      vitalFlags.push({ param: 'SpO2', value: `${v.spo2}%`, status: 'warning', message: 'Suboptimal oxygen saturation' });
    } else {
      vitalFlags.push({ param: 'SpO2', value: `${v.spo2}%`, status: 'normal', message: 'Adequate oxygen saturation' });
    }

    // Heart Rate
    if (v.heartRate > 130 || v.heartRate < 45) {
      vitalFlags.push({ param: 'Heart Rate', value: `${v.heartRate} bpm`, status: 'critical', message: 'Severe dysrhythmia / extreme tachycardia' });
    } else if (v.heartRate > 100 || v.heartRate < 60) {
      vitalFlags.push({ param: 'Heart Rate', value: `${v.heartRate} bpm`, status: 'warning', message: 'Abnormal pulse rate' });
    } else {
      vitalFlags.push({ param: 'Heart Rate', value: `${v.heartRate} bpm`, status: 'normal', message: 'Normal resting pulse' });
    }

    // Blood Pressure
    if (v.systolicBP < 90 || v.systolicBP >= 180) {
      vitalFlags.push({ param: 'Blood Pressure', value: `${v.systolicBP}/${v.diastolicBP} mmHg`, status: 'critical', message: 'Hemodynamic compromise / hypertensive urgency' });
    } else if (v.systolicBP > 140 || v.diastolicBP > 90) {
      vitalFlags.push({ param: 'Blood Pressure', value: `${v.systolicBP}/${v.diastolicBP} mmHg`, status: 'warning', message: 'Stage 1/2 Hypertension' });
    } else {
      vitalFlags.push({ param: 'Blood Pressure', value: `${v.systolicBP}/${v.diastolicBP} mmHg`, status: 'normal', message: 'Normotensive' });
    }

    // Respiratory Rate
    if (v.respiratoryRate >= 30 || v.respiratoryRate <= 8) {
      vitalFlags.push({ param: 'Respiratory Rate', value: `${v.respiratoryRate} bpm`, status: 'critical', message: 'Critical respiratory distress' });
    } else if (v.respiratoryRate > 20 || v.respiratoryRate < 12) {
      vitalFlags.push({ param: 'Respiratory Rate', value: `${v.respiratoryRate} bpm`, status: 'warning', message: 'Tachypnea / Bradypnea' });
    } else {
      vitalFlags.push({ param: 'Respiratory Rate', value: `${v.respiratoryRate} bpm`, status: 'normal', message: 'Eupneic ventilation' });
    }

    // Temperature
    if (v.temperature >= 39.0 || v.temperature < 35.0) {
      vitalFlags.push({ param: 'Temperature', value: `${v.temperature} °C`, status: 'critical', message: 'High pyrexia / hypothermia risk' });
    } else if (v.temperature >= 38.0) {
      vitalFlags.push({ param: 'Temperature', value: `${v.temperature} °C`, status: 'warning', message: 'Febrile state' });
    } else {
      vitalFlags.push({ param: 'Temperature', value: `${v.temperature} °C`, status: 'normal', message: 'Afebrile' });
    }

    // Evidence synthesis
    const evidenceFactors: string[] = [
      `Chief symptoms reported: ${patient.symptoms.join(', ') || 'None specified'}`,
      `Symptom severity classified as ${patient.severity.toUpperCase()}`,
      `Vital signs state: SpO2 ${v.spo2}%, HR ${v.heartRate} bpm, BP ${v.systolicBP}/${v.diastolicBP} mmHg`,
      `Relevant history: ${[
        patient.history.heartDisease ? 'Known Heart Disease' : null,
        patient.history.diabetes ? 'Diabetes' : null,
        patient.history.asthma ? 'Asthma' : null,
        patient.history.hypertension ? 'Hypertension' : null
      ].filter(Boolean).join(', ') || 'No major cardiovascular/respiratory conditions'}`
    ];

    // Generate explainable clinical rationale
    let clinicalRationale = '';
    if (triggeredRules.length > 0) {
      const topRule = triggeredRules[0];
      clinicalRationale = `Assigned ${finalPriority} priority via knowledge rule "${topRule.ruleName}" (${topRule.ruleId}). ${topRule.rationale} Matched conditions: ${topRule.matchedConditions.join(' AND ')}. ${triggeredRules.length > 1 ? `Additionally supported by ${triggeredRules.length - 1} secondary inference rule(s).` : ''}`;
    } else {
      clinicalRationale = `No explicit production rule matched. Assigned default baseline priority ${finalPriority} based on general physiological assessment and stable normal limits. All findings subject to professional clinical validation.`;
    }

    const priorityInfo = PRIORITY_CONFIG[finalPriority];

    const triageResult: TriageResult = {
      patientId: patient.id,
      priority: finalPriority,
      priorityTitle: priorityInfo.title,
      priorityDescription: priorityInfo.description,
      color: priorityInfo.color,
      assessedAt: new Date().toISOString(),
      triggeredRules,
      vitalFlags,
      clinicalRationale,
      recommendedMaxWaitTime: priorityInfo.maxWait,
      actionRecommendations: priorityInfo.actions,
      evidenceFactors,
      uncertaintyScore: triggeredRules.length > 0 ? Math.max(0.05, 0.3 - triggeredRules.length * 0.05) : 0.45,
      beliefConfidence: triggeredRules.length > 0 ? Math.min(0.98, 0.70 + triggeredRules.length * 0.08) : 0.55
    };

    const session: InferenceSession = {
      patientId: patient.id,
      timestamp: triageResult.assessedAt,
      extractedFacts: facts,
      applicableRulesCount: activeRules.length,
      matchedRulesCount: triggeredRules.length,
      traces,
      finalPriority,
      explanation: clinicalRationale
    };

    return { triageResult, session };
  }
}
