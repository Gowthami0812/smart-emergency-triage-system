import { Patient, PriorityLevel, TriageResult } from '../types/patient';
import { ProductionRule } from '../types/rules';
import { OntologyNode, OntologyEdge, OntologyMatchingItem } from '../types/ontology';

export const DEFAULT_RULES: ProductionRule[] = [
  {
    id: 'RULE-01',
    name: 'Critical Hypoxia Alert',
    category: 'Airway/Breathing',
    ruleType: 'production',
    description: 'Triggers immediate emergency triage if oxygen saturation falls below critical illustrative threshold (SpO2 < 90%).',
    conditions: [
      {
        id: 'c1',
        field: 'spo2',
        operator: '<',
        value: 90,
        label: 'Oxygen Saturation (SpO2) < 90%'
      }
    ],
    logicOperator: 'AND',
    action: {
      priority: 'RED',
      rationale: 'Severe arterial hypoxemia indicates imminent respiratory failure or severe cardiopulmonary decompensation.',
      clinicalAlert: 'High-flow supplemental oxygen and immediate resuscitation bay placement required.',
      weight: 100
    },
    enabled: true,
    isBuiltIn: true,
    triggerCount: 4
  },
  {
    id: 'RULE-02',
    name: 'Severe Dyspnea with Borderline Oxygenation',
    category: 'Airway/Breathing',
    ruleType: 'synthesis',
    description: 'Combined finding of reported severe difficulty breathing with suboptimal oxygen saturation (SpO2 <= 92%).',
    conditions: [
      {
        id: 'c1',
        field: 'symptoms',
        operator: 'contains',
        value: 'Difficulty breathing',
        label: 'Symptom contains "Difficulty breathing"'
      },
      {
        id: 'c2',
        field: 'spo2',
        operator: '<=',
        value: 92,
        label: 'Oxygen Saturation (SpO2) <= 92%'
      }
    ],
    logicOperator: 'AND',
    action: {
      priority: 'RED',
      rationale: 'Work of breathing combined with physiological hypoxemia demands emergency airway assessment.',
      clinicalAlert: 'Continuous SpO2 monitoring, rapid physician bedside evaluation, bronchodilators / ventilatory support.',
      weight: 95
    },
    enabled: true,
    isBuiltIn: true,
    triggerCount: 3
  },
  {
    id: 'RULE-03',
    name: 'Severe External or Internal Hemorrhage',
    category: 'Circulation',
    ruleType: 'production',
    description: 'Active reported severe bleeding requires immediate emergency control and volume resuscitation.',
    conditions: [
      {
        id: 'c1',
        field: 'symptoms',
        operator: 'contains',
        value: 'Bleeding',
        label: 'Symptom contains "Bleeding"'
      },
      {
        id: 'c2',
        field: 'severity',
        operator: '==',
        value: 'severe',
        label: 'Symptom Severity == severe'
      }
    ],
    logicOperator: 'AND',
    action: {
      priority: 'RED',
      rationale: 'Active uncontrolled severe hemorrhage poses immediate risk of hemorrhagic shock and cardiac arrest.',
      clinicalAlert: 'Direct pressure / tourniquet, massive transfusion protocol readiness, large-bore IV access.',
      weight: 98
    },
    enabled: true,
    isBuiltIn: true,
    triggerCount: 2
  },
  {
    id: 'RULE-04',
    name: 'Hemodynamic Collapse / Profound Hypotension',
    category: 'Circulation',
    ruleType: 'production',
    description: 'Systolic blood pressure below 90 mmHg indicating cardiogenic, distributive, or hypovolemic shock.',
    conditions: [
      {
        id: 'c1',
        field: 'systolicBP',
        operator: '<',
        value: 90,
        label: 'Systolic BP < 90 mmHg'
      }
    ],
    logicOperator: 'AND',
    action: {
      priority: 'RED',
      rationale: 'Profound hypotension compromises vital organ perfusion and constitutes a shock state.',
      clinicalAlert: 'Immediate IV fluid bolus, vasopressor preparation, central venous access readiness.',
      weight: 95
    },
    enabled: true,
    isBuiltIn: true,
    triggerCount: 1
  },
  {
    id: 'RULE-05',
    name: 'Critical Tachypnea Exhaustion Risk',
    category: 'Airway/Breathing',
    ruleType: 'production',
    description: 'Extreme respiratory rate (>= 32 breaths/min) indicating respiratory fatigue.',
    conditions: [
      {
        id: 'c1',
        field: 'respiratoryRate',
        operator: '>=',
        value: 32,
        label: 'Respiratory Rate >= 32 bpm'
      }
    ],
    logicOperator: 'AND',
    action: {
      priority: 'RED',
      rationale: 'Severe tachypnea rapidly leads to respiratory muscle exhaustion and sudden arrest.',
      clinicalAlert: 'Immediate blood gas analysis, non-invasive ventilation or intubation standby.',
      weight: 90
    },
    enabled: true,
    isBuiltIn: true,
    triggerCount: 2
  },
  {
    id: 'RULE-06',
    name: 'High-Risk Cardiac Chest Pain',
    category: 'Circulation',
    ruleType: 'synthesis',
    description: 'Reported chest pain in patients with existing heart disease or aged >= 50 years.',
    conditions: [
      {
        id: 'c1',
        field: 'symptoms',
        operator: 'contains',
        value: 'Chest pain',
        label: 'Symptom contains "Chest pain"'
      },
      {
        id: 'c2',
        field: 'hasHeartDisease',
        operator: 'is_true',
        value: true,
        label: 'Patient Has Known Heart Disease == true'
      }
    ],
    logicOperator: 'AND',
    action: {
      priority: 'ORANGE',
      rationale: 'Acute chest pain on high-risk cardiovascular background carries elevated probability of Acute Coronary Syndrome.',
      clinicalAlert: 'Stat 12-lead ECG within 10 minutes, cardiac troponin assay, aspirin / telemetry initiation.',
      weight: 85
    },
    enabled: true,
    isBuiltIn: true,
    triggerCount: 5
  },
  {
    id: 'RULE-07',
    name: 'Severe Acute Chest Pain Presentation',
    category: 'Circulation',
    ruleType: 'production',
    description: 'Severe chest pain reported without waiting for cardiac markers.',
    conditions: [
      {
        id: 'c1',
        field: 'symptoms',
        operator: 'contains',
        value: 'Chest pain',
        label: 'Symptom contains "Chest pain"'
      },
      {
        id: 'c2',
        field: 'severity',
        operator: '==',
        value: 'severe',
        label: 'Symptom Severity == severe'
      }
    ],
    logicOperator: 'AND',
    action: {
      priority: 'ORANGE',
      rationale: 'Severe chest pain warrants urgent rule-out of aortic dissection, pulmonary embolism, and STEMI.',
      clinicalAlert: 'ECG, IV access, sublingual nitroglycerin if hemodynamically stable, continuous telemetry.',
      weight: 82
    },
    enabled: true,
    isBuiltIn: true,
    triggerCount: 4
  },
  {
    id: 'RULE-08',
    name: 'Hypertensive Emergency Risk',
    category: 'Neurological',
    ruleType: 'synthesis',
    description: 'Severely elevated systolic blood pressure (>= 180 mmHg) combined with acute neurological symptoms.',
    conditions: [
      {
        id: 'c1',
        field: 'systolicBP',
        operator: '>=',
        value: 180,
        label: 'Systolic BP >= 180 mmHg'
      },
      {
        id: 'c2',
        field: 'symptoms',
        operator: 'contains_any',
        value: ['Headache', 'Dizziness'],
        label: 'Symptom contains "Headache" or "Dizziness"'
      }
    ],
    logicOperator: 'AND',
    action: {
      priority: 'ORANGE',
      rationale: 'Extreme systolic elevation with neuro symptoms indicates potential end-organ damage (stroke, encephalopathy).',
      clinicalAlert: 'Urgent non-contrast head CT, controlled IV antihypertensive infusion, neurological charting.',
      weight: 80
    },
    enabled: true,
    isBuiltIn: true,
    triggerCount: 2
  },
  {
    id: 'RULE-09',
    name: 'Acute Severe Abdomen with Systemic Fever',
    category: 'Multi-Factor',
    ruleType: 'synthesis',
    description: 'Severe abdominal pain accompanied by high fever (>= 38.5 C) indicating possible peritoneal sepsis.',
    conditions: [
      {
        id: 'c1',
        field: 'symptoms',
        operator: 'contains',
        value: 'Abdominal pain',
        label: 'Symptom contains "Abdominal pain"'
      },
      {
        id: 'c2',
        field: 'temperature',
        operator: '>=',
        value: 38.5,
        label: 'Body Temperature >= 38.5 °C'
      }
    ],
    logicOperator: 'AND',
    action: {
      priority: 'ORANGE',
      rationale: 'Peritoneal signs or intra-abdominal sepsis (appendicitis, perforation) can deteriorate into septic shock.',
      clinicalAlert: 'Surgical consult, intravenous broad-spectrum antibiotics, abdominal ultrasound / CT scan.',
      weight: 78
    },
    enabled: true,
    isBuiltIn: true,
    triggerCount: 2
  },
  {
    id: 'RULE-10',
    name: 'Asthmatic Bronchospasm Attack',
    category: 'Airway/Breathing',
    ruleType: 'synthesis',
    description: 'Known asthma history presenting with acute breathing difficulty.',
    conditions: [
      {
        id: 'c1',
        field: 'hasAsthma',
        operator: 'is_true',
        value: true,
        label: 'Patient Has Asthma == true'
      },
      {
        id: 'c2',
        field: 'symptoms',
        operator: 'contains',
        value: 'Difficulty breathing',
        label: 'Symptom contains "Difficulty breathing"'
      }
    ],
    logicOperator: 'AND',
    action: {
      priority: 'ORANGE',
      rationale: 'Acute exacerbation of asthma can quickly progress to silent chest and hypercapnic failure.',
      clinicalAlert: 'Nebulized beta-agonists + ipratropium, systemic corticosteroids, peak flow assessment.',
      weight: 76
    },
    enabled: true,
    isBuiltIn: true,
    triggerCount: 3
  },
  {
    id: 'RULE-11',
    name: 'Tachycardic Dehydration / Volume Loss',
    category: 'Circulation',
    ruleType: 'production',
    description: 'Heart rate exceeding 100 bpm associated with gastrointestinal vomiting.',
    conditions: [
      {
        id: 'c1',
        field: 'heartRate',
        operator: '>',
        value: 100,
        label: 'Heart Rate > 100 bpm'
      },
      {
        id: 'c2',
        field: 'symptoms',
        operator: 'contains',
        value: 'Vomiting',
        label: 'Symptom contains "Vomiting"'
      }
    ],
    logicOperator: 'AND',
    action: {
      priority: 'YELLOW',
      rationale: 'Persistent emesis coupled with compensatory sinus tachycardia denotes volume depletion needing hydration.',
      clinicalAlert: 'Serum electrolytes, IV fluid replacement, antiemetics, re-evaluation in 30 minutes.',
      weight: 55
    },
    enabled: true,
    isBuiltIn: true,
    triggerCount: 4
  },
  {
    id: 'RULE-12',
    name: 'Moderate Febrile Illness',
    category: 'Symptom-Severity',
    ruleType: 'production',
    description: 'Elevated temperature (>= 38.0 C) with headache but stable vitals.',
    conditions: [
      {
        id: 'c1',
        field: 'temperature',
        operator: '>=',
        value: 38.0,
        label: 'Body Temperature >= 38.0 °C'
      },
      {
        id: 'c2',
        field: 'symptoms',
        operator: 'contains',
        value: 'Headache',
        label: 'Symptom contains "Headache"'
      }
    ],
    logicOperator: 'AND',
    action: {
      priority: 'YELLOW',
      rationale: 'Systemic febrile reaction without hemodynamic compromise warrants prompt diagnosis and antipyretics.',
      clinicalAlert: 'Complete blood count, blood culture if indicated, oral antipyresis, rule out meningitis signs.',
      weight: 50
    },
    enabled: true,
    isBuiltIn: true,
    triggerCount: 5
  },
  {
    id: 'RULE-13',
    name: 'Diabetic Malaise Warning',
    category: 'Multi-Factor',
    ruleType: 'synthesis',
    description: 'Diabetic patient experiencing weakness and dizziness, raising concern for hypo/hyperglycemia.',
    conditions: [
      {
        id: 'c1',
        field: 'hasDiabetes',
        operator: 'is_true',
        value: true,
        label: 'Patient Has Diabetes == true'
      },
      {
        id: 'c2',
        field: 'symptoms',
        operator: 'contains_any',
        value: ['Weakness', 'Dizziness'],
        label: 'Symptom contains "Weakness" or "Dizziness"'
      }
    ],
    logicOperator: 'AND',
    action: {
      priority: 'YELLOW',
      rationale: 'Diabetic autonomic symptoms can signify acute glycemic dysregulation or atypical presentation of myocardial ischemia.',
      clinicalAlert: 'Immediate point-of-care blood glucose check, urine ketones, basic metabolic panel.',
      weight: 52
    },
    enabled: true,
    isBuiltIn: true,
    triggerCount: 3
  },
  {
    id: 'RULE-14',
    name: 'Multi-Morbidity Urgency Escalation',
    category: 'Multi-Factor',
    ruleType: 'synthesis',
    description: 'Patient presenting with multiple simultaneous symptoms (>= 3) and complex chronic history.',
    conditions: [
      {
        id: 'c1',
        field: 'symptoms',
        operator: '>=',
        value: 3,
        label: 'Total Active Symptoms Count >= 3'
      },
      {
        id: 'c2',
        field: 'age',
        operator: '>=',
        value: 60,
        label: 'Patient Age >= 60'
      }
    ],
    logicOperator: 'AND',
    action: {
      priority: 'ORANGE',
      rationale: 'Geriatric multi-morbidity presentations have significantly lower physiological reserve and mask severe conditions.',
      clinicalAlert: 'Comprehensive geriatric emergency assessment, full blood workup, active vital sign surveillance.',
      weight: 75
    },
    enabled: true,
    isBuiltIn: true,
    triggerCount: 2
  },
  {
    id: 'RULE-15',
    name: 'Isolated Mild Complaint with Stable Physiology',
    category: 'Reduction',
    ruleType: 'reduction',
    description: 'Reduction rule: Mild symptom severity with all vital signs strictly within normal physiological limits.',
    conditions: [
      {
        id: 'c1',
        field: 'severity',
        operator: '==',
        value: 'mild',
        label: 'Symptom Severity == mild'
      },
      {
        id: 'c2',
        field: 'spo2',
        operator: '>=',
        value: 96,
        label: 'Oxygen Saturation (SpO2) >= 96%'
      },
      {
        id: 'c3',
        field: 'systolicBP',
        operator: '<',
        value: 140,
        label: 'Systolic BP < 140 mmHg'
      }
    ],
    logicOperator: 'AND',
    action: {
      priority: 'GREEN',
      rationale: 'Mild isolated symptoms with optimal cardiopulmonary indices indicate lower apparent acute urgency.',
      clinicalAlert: 'Standard ambulatory triage queue. Subject to continuous visual re-triage if condition changes.',
      weight: 20
    },
    enabled: true,
    isBuiltIn: true,
    triggerCount: 8
  },
  {
    id: 'RULE-16',
    name: 'Non-Specific Minor Weakness Baseline',
    category: 'Reduction',
    ruleType: 'reduction',
    description: 'Isolated weakness without vital sign abnormality or high-risk cardiac/neuro flags.',
    conditions: [
      {
        id: 'c1',
        field: 'symptoms',
        operator: 'contains',
        value: 'Weakness',
        label: 'Symptom contains "Weakness"'
      },
      {
        id: 'c2',
        field: 'severity',
        operator: '==',
        value: 'mild',
        label: 'Symptom Severity == mild'
      }
    ],
    logicOperator: 'AND',
    action: {
      priority: 'GREEN',
      rationale: 'Absence of focal neurological signs and physiological stability permits outpatient evaluation or delayed review.',
      clinicalAlert: 'Routine clinical consultation, vital sign repeat in 1 hour if waiting exceeds target time.',
      weight: 15
    },
    enabled: true,
    isBuiltIn: true,
    triggerCount: 3
  }
];

export const DEFAULT_PATIENTS: Patient[] = [
  {
    id: 'PT-2026-0001',
    name: 'Rajesh Sharma',
    age: 58,
    gender: 'Male',
    assessmentDate: '2026-11-19',
    assessmentTime: '18:15',
    symptoms: ['Chest pain', 'Difficulty breathing', 'Weakness'],
    vitals: {
      temperature: 37.1,
      heartRate: 122,
      systolicBP: 145,
      diastolicBP: 95,
      respiratoryRate: 26,
      spo2: 88
    },
    history: {
      diabetes: true,
      hypertension: true,
      heartDisease: true,
      asthma: false,
      previousSurgeries: false,
      allergies: false,
      otherConditions: 'Hyperlipidemia'
    },
    severity: 'severe',
    chiefComplaintNotes: 'Crushing substernal chest pressure radiating to left arm for 45 mins with shortness of breath.'
  },
  {
    id: 'PT-2026-0002',
    name: 'Priya Patel',
    age: 29,
    gender: 'Female',
    assessmentDate: '2026-11-19',
    assessmentTime: '18:40',
    symptoms: ['Bleeding', 'Dizziness', 'Weakness'],
    vitals: {
      temperature: 36.6,
      heartRate: 134,
      systolicBP: 85,
      diastolicBP: 55,
      respiratoryRate: 22,
      spo2: 94
    },
    history: {
      diabetes: false,
      hypertension: false,
      heartDisease: false,
      asthma: false,
      previousSurgeries: true,
      allergies: true,
      otherConditions: 'Penicillin allergy'
    },
    severity: 'severe',
    chiefComplaintNotes: 'Laceration injury with active severe arterial spurting and rapid pallor.'
  },
  {
    id: 'PT-2026-0003',
    name: 'Ramesh Kumar',
    age: 64,
    gender: 'Male',
    assessmentDate: '2026-11-19',
    assessmentTime: '19:02',
    symptoms: ['Difficulty breathing', 'Weakness'],
    vitals: {
      temperature: 37.4,
      heartRate: 118,
      systolicBP: 135,
      diastolicBP: 88,
      respiratoryRate: 34,
      spo2: 86
    },
    history: {
      diabetes: false,
      hypertension: false,
      heartDisease: false,
      asthma: true,
      previousSurgeries: false,
      allergies: false,
      otherConditions: 'COPD'
    },
    severity: 'severe',
    chiefComplaintNotes: 'Severe acute respiratory distress with audible inspiratory wheezing and accessory muscle use.'
  },
  {
    id: 'PT-2026-0004',
    name: 'Ananya Sen',
    age: 34,
    gender: 'Female',
    assessmentDate: '2026-11-19',
    assessmentTime: '19:20',
    symptoms: ['Abdominal pain', 'Vomiting', 'Fever'],
    vitals: {
      temperature: 39.2,
      heartRate: 108,
      systolicBP: 110,
      diastolicBP: 72,
      respiratoryRate: 20,
      spo2: 97
    },
    history: {
      diabetes: false,
      hypertension: false,
      heartDisease: false,
      asthma: false,
      previousSurgeries: false,
      allergies: false,
      otherConditions: ''
    },
    severity: 'severe',
    chiefComplaintNotes: 'Right lower quadrant excruciating tenderness with guarding, rigors, and vomiting.'
  },
  {
    id: 'PT-2026-0005',
    name: 'Vikram Singh',
    age: 52,
    gender: 'Male',
    assessmentDate: '2026-11-19',
    assessmentTime: '19:45',
    symptoms: ['Headache', 'Dizziness'],
    vitals: {
      temperature: 36.9,
      heartRate: 86,
      systolicBP: 195,
      diastolicBP: 118,
      respiratoryRate: 18,
      spo2: 98
    },
    history: {
      diabetes: false,
      hypertension: true,
      heartDisease: false,
      asthma: false,
      previousSurgeries: false,
      allergies: false,
      otherConditions: 'Non-compliant with antihypertensive medications'
    },
    severity: 'moderate',
    chiefComplaintNotes: 'Throbbing occipital headache with blurred vision and lightheadedness.'
  },
  {
    id: 'PT-2026-0006',
    name: 'Meera Nair',
    age: 42,
    gender: 'Female',
    assessmentDate: '2026-11-19',
    assessmentTime: '20:05',
    symptoms: ['Chest pain', 'Weakness'],
    vitals: {
      temperature: 37.0,
      heartRate: 88,
      systolicBP: 132,
      diastolicBP: 84,
      respiratoryRate: 17,
      spo2: 98
    },
    history: {
      diabetes: false,
      hypertension: false,
      heartDisease: false,
      asthma: false,
      previousSurgeries: false,
      allergies: false,
      otherConditions: ''
    },
    severity: 'severe',
    chiefComplaintNotes: 'Atypical stabbing chest discomfort on deep inspiration without radiation.'
  },
  {
    id: 'PT-2026-0007',
    name: 'Karthik Iyer',
    age: 22,
    gender: 'Male',
    assessmentDate: '2026-11-19',
    assessmentTime: '20:18',
    symptoms: ['Difficulty breathing'],
    vitals: {
      temperature: 36.8,
      heartRate: 104,
      systolicBP: 124,
      diastolicBP: 78,
      respiratoryRate: 24,
      spo2: 93
    },
    history: {
      diabetes: false,
      hypertension: false,
      heartDisease: false,
      asthma: true,
      previousSurgeries: false,
      allergies: true,
      otherConditions: 'Dust mite allergy'
    },
    severity: 'moderate',
    chiefComplaintNotes: 'Moderate asthma flare-up triggered by pollution. Inhaler provided mild relief.'
  },
  {
    id: 'PT-2026-0008',
    name: 'Sunita Verma',
    age: 48,
    gender: 'Female',
    assessmentDate: '2026-11-19',
    assessmentTime: '20:30',
    symptoms: ['Fever', 'Headache'],
    vitals: {
      temperature: 38.6,
      heartRate: 94,
      systolicBP: 120,
      diastolicBP: 80,
      respiratoryRate: 18,
      spo2: 98
    },
    history: {
      diabetes: false,
      hypertension: false,
      heartDisease: false,
      asthma: false,
      previousSurgeries: false,
      allergies: false,
      otherConditions: ''
    },
    severity: 'moderate',
    chiefComplaintNotes: '2-day high fever with fronto-temporal throbbing headache and myalgias.'
  },
  {
    id: 'PT-2026-0009',
    name: 'Suresh Reddy',
    age: 61,
    gender: 'Male',
    assessmentDate: '2026-11-19',
    assessmentTime: '20:45',
    symptoms: ['Vomiting', 'Dizziness', 'Weakness'],
    vitals: {
      temperature: 36.8,
      heartRate: 106,
      systolicBP: 105,
      diastolicBP: 68,
      respiratoryRate: 18,
      spo2: 97
    },
    history: {
      diabetes: true,
      hypertension: false,
      heartDisease: false,
      asthma: false,
      previousSurgeries: false,
      allergies: false,
      otherConditions: 'Type 2 DM on Metformin'
    },
    severity: 'moderate',
    chiefComplaintNotes: 'Multiple episodes of bilious vomiting since morning, unable to keep oral medications down.'
  },
  {
    id: 'PT-2026-0010',
    name: 'Deepa Joshi',
    age: 31,
    gender: 'Female',
    assessmentDate: '2026-11-19',
    assessmentTime: '20:55',
    symptoms: ['Abdominal pain', 'Vomiting'],
    vitals: {
      temperature: 37.3,
      heartRate: 80,
      systolicBP: 118,
      diastolicBP: 76,
      respiratoryRate: 16,
      spo2: 99
    },
    history: {
      diabetes: false,
      hypertension: false,
      heartDisease: false,
      asthma: false,
      previousSurgeries: false,
      allergies: false,
      otherConditions: 'Gastritis history'
    },
    severity: 'moderate',
    chiefComplaintNotes: 'Crampy epigastric abdominal discomfort following spicy meal.'
  },
  {
    id: 'PT-2026-0011',
    name: 'Arun Sundaram',
    age: 26,
    gender: 'Male',
    assessmentDate: '2026-11-19',
    assessmentTime: '21:10',
    symptoms: ['Weakness'],
    vitals: {
      temperature: 36.7,
      heartRate: 72,
      systolicBP: 118,
      diastolicBP: 74,
      respiratoryRate: 15,
      spo2: 99
    },
    history: {
      diabetes: false,
      hypertension: false,
      heartDisease: false,
      asthma: false,
      previousSurgeries: false,
      allergies: false,
      otherConditions: ''
    },
    severity: 'mild',
    chiefComplaintNotes: 'General tiredness and muscle fatigue after rigorous physical sports session.'
  },
  {
    id: 'PT-2026-0012',
    name: 'Kavita Menon',
    age: 38,
    gender: 'Female',
    assessmentDate: '2026-11-19',
    assessmentTime: '21:25',
    symptoms: ['Headache'],
    vitals: {
      temperature: 37.0,
      heartRate: 74,
      systolicBP: 122,
      diastolicBP: 78,
      respiratoryRate: 16,
      spo2: 99
    },
    history: {
      diabetes: false,
      hypertension: false,
      heartDisease: false,
      asthma: false,
      previousSurgeries: false,
      allergies: false,
      otherConditions: 'Tension headaches'
    },
    severity: 'mild',
    chiefComplaintNotes: 'Mild band-like bilateral tension headache after prolonged screen work.'
  }
];

export const CLINICAL_PRESETS = [
  {
    id: 'preset-ami',
    title: 'Acute Coronary Syndrome (STEMI/NSTEMI)',
    badge: 'RED - Immediate',
    patient: {
      name: 'Demonstration Patient: Acute MI',
      age: 58,
      gender: 'Male' as const,
      symptoms: ['Chest pain', 'Difficulty breathing', 'Weakness', 'Dizziness'],
      vitals: {
        temperature: 37.2,
        heartRate: 124,
        systolicBP: 150,
        diastolicBP: 95,
        respiratoryRate: 26,
        spo2: 89
      },
      history: {
        diabetes: true,
        hypertension: true,
        heartDisease: true,
        asthma: false,
        previousSurgeries: false,
        allergies: false,
        otherConditions: 'CAD with Stent (2021)'
      },
      severity: 'severe' as const,
      chiefComplaintNotes: 'Sudden onset retrosternal crushing pain, diaphoresis, dyspnea, and SpO2 89%.'
    }
  },
  {
    id: 'preset-hypovolemic',
    title: 'Hemorrhagic Shock / Major Trauma',
    badge: 'RED - Immediate',
    patient: {
      name: 'Demonstration Patient: Hemorrhagic Shock',
      age: 32,
      gender: 'Female' as const,
      symptoms: ['Bleeding', 'Dizziness', 'Weakness'],
      vitals: {
        temperature: 36.2,
        heartRate: 138,
        systolicBP: 82,
        diastolicBP: 50,
        respiratoryRate: 28,
        spo2: 93
      },
      history: {
        diabetes: false,
        hypertension: false,
        heartDisease: false,
        asthma: false,
        previousSurgeries: false,
        allergies: false,
        otherConditions: 'Trauma accident'
      },
      severity: 'severe' as const,
      chiefComplaintNotes: 'Severe laceration bleed with tachycardia 138 bpm and hypotension 82/50 mmHg.'
    }
  },
  {
    id: 'preset-septic-abdomen',
    title: 'Peritoneal Sepsis / Acute Abdomen',
    badge: 'ORANGE - Urgent',
    patient: {
      name: 'Demonstration Patient: Acute Abdomen',
      age: 41,
      gender: 'Female' as const,
      symptoms: ['Abdominal pain', 'Fever', 'Vomiting'],
      vitals: {
        temperature: 39.3,
        heartRate: 112,
        systolicBP: 115,
        diastolicBP: 70,
        respiratoryRate: 22,
        spo2: 97
      },
      history: {
        diabetes: false,
        hypertension: false,
        heartDisease: false,
        asthma: false,
        previousSurgeries: false,
        allergies: false,
        otherConditions: ''
      },
      severity: 'severe' as const,
      chiefComplaintNotes: 'Acute peritoneal signs with severe abdominal tenderness and high pyrexia 39.3 C.'
    }
  },
  {
    id: 'preset-gastroenteritis',
    title: 'Dehydration / Febrile Gastroenteritis',
    badge: 'YELLOW - Prompt',
    patient: {
      name: 'Demonstration Patient: Gastroenteritis',
      age: 28,
      gender: 'Male' as const,
      symptoms: ['Vomiting', 'Abdominal pain', 'Weakness'],
      vitals: {
        temperature: 37.8,
        heartRate: 104,
        systolicBP: 112,
        diastolicBP: 74,
        respiratoryRate: 17,
        spo2: 98
      },
      history: {
        diabetes: false,
        hypertension: false,
        heartDisease: false,
        asthma: false,
        previousSurgeries: false,
        allergies: false,
        otherConditions: ''
      },
      severity: 'moderate' as const,
      chiefComplaintNotes: 'Repeated vomiting for 12 hours with sinus tachycardia 104 bpm.'
    }
  },
  {
    id: 'preset-minor',
    title: 'Ambulatory Minor Headache / Tension',
    badge: 'GREEN - Lower Urgency',
    patient: {
      name: 'Demonstration Patient: Tension Headache',
      age: 25,
      gender: 'Female' as const,
      symptoms: ['Headache'],
      vitals: {
        temperature: 36.8,
        heartRate: 68,
        systolicBP: 116,
        diastolicBP: 74,
        respiratoryRate: 14,
        spo2: 99
      },
      history: {
        diabetes: false,
        hypertension: false,
        heartDisease: false,
        asthma: false,
        previousSurgeries: false,
        allergies: false,
        otherConditions: ''
      },
      severity: 'mild' as const,
      chiefComplaintNotes: 'Mild frontal headache, fully alert, stable vital signs, no red flags.'
    }
  }
];

export const ONTOLOGY_NODES: OntologyNode[] = [
  // Root Concept
  {
    id: 'OntologyRoot',
    label: 'EmergencyTriageDomain',
    type: 'Root',
    category: 'System',
    description: 'Top-level foundational ontology container modeling the Emergency Medical Department knowledge domain.',
    definingFeatures: ['Domain: Acute Healthcare', 'Formalism: Description Logic ALC(D)', 'Purpose: Patient Prioritization'],
    x: 450,
    y: 50,
    color: '#0f172a'
  },
  // Core Concepts
  {
    id: 'Concept_Patient',
    label: 'Patient',
    type: 'Concept',
    category: 'Patient',
    description: 'The core subject presenting to the emergency triage room with symptoms, physiological vitals, and medical history.',
    definingFeatures: ['Has unique ID', 'Has Demographic Profile', 'Has Dynamic Clinical State'],
    objectFeatures: {
      'hasSymptom': 'Symptom',
      'hasVitalSign': 'VitalSign',
      'hasMedicalHistory': 'MedicalCondition',
      'hasSeverity': 'SeverityLevel',
      'generates': 'PriorityRecommendation'
    },
    x: 450,
    y: 150,
    color: '#0284c7'
  },
  {
    id: 'Concept_Symptom',
    label: 'Symptom',
    type: 'Concept',
    category: 'Symptom',
    description: 'Subjective patient-reported clinical phenomenon indicating potential underlying pathological process.',
    definingFeatures: ['Belongs to Body System', 'Has Acuteness', 'Has Subjective Intensity'],
    objectFeatures: {
      'belongsTo': 'SymptomCategory',
      'exhibitedBy': 'Patient'
    },
    x: 180,
    y: 260,
    color: '#8b5cf6'
  },
  {
    id: 'Concept_VitalSign',
    label: 'VitalSign',
    type: 'Concept',
    category: 'VitalSign',
    description: 'Objective, quantitative physiological measurement indicating vital organ homeostasis.',
    definingFeatures: ['Quantitative Value', 'Measurement Unit', 'Physiological Reference Range'],
    objectFeatures: {
      'measuredIn': 'Patient',
      'hasNormativeRange': 'PhysiologicalInterval'
    },
    x: 450,
    y: 260,
    color: '#ec4899'
  },
  {
    id: 'Concept_MedicalCondition',
    label: 'MedicalCondition',
    type: 'Concept',
    category: 'History',
    description: 'Pre-existing chronic or past pathology affecting baseline risk stratification.',
    definingFeatures: ['Chronicity', 'Target Organ System', 'Risk Modulating Factor'],
    x: 720,
    y: 260,
    color: '#f59e0b'
  },
  {
    id: 'Concept_PriorityRecommendation',
    label: 'PriorityRecommendation',
    type: 'Concept',
    category: 'Priority',
    description: 'Knowledge inference output categorizing patient into clinical urgency strata.',
    definingFeatures: ['Urgency Tier (RED/ORANGE/YELLOW/GREEN)', 'Target Wait Envelope', 'Clinical Action Directives'],
    x: 450,
    y: 390,
    color: '#10b981'
  },
  // Subconcepts - Symptom Categories
  {
    id: 'SubConcept_CardiacSymptom',
    label: 'CardiacSymptom',
    type: 'SubConcept',
    category: 'Symptom',
    description: 'Symptoms arising from cardiovascular ischemia, pump failure, or dysrhythmia.',
    definingFeatures: ['Organ: Heart / Coronary Vessels', 'Ischemic Potential', 'Urgent Triage Weight'],
    inheritedFeatures: ['Subjective intensity', 'Acuteness'],
    transitiveAncestors: ['Symptom', 'EmergencyTriageDomain'],
    examples: ['Chest pain', 'Palpitations', 'Radiation to left arm'],
    x: 80,
    y: 380,
    color: '#8b5cf6'
  },
  {
    id: 'SubConcept_RespiratorySymptom',
    label: 'RespiratorySymptom',
    type: 'SubConcept',
    category: 'Symptom',
    description: 'Symptoms involving airway patency, ventilation gas exchange, or pleural irritation.',
    definingFeatures: ['Organ: Lungs / Tracheobronchial tree', 'Hypoxic Hazard'],
    inheritedFeatures: ['Subjective intensity', 'Acuteness'],
    transitiveAncestors: ['Symptom', 'EmergencyTriageDomain'],
    examples: ['Difficulty breathing', 'Stridor', 'Wheezing'],
    x: 200,
    y: 430,
    color: '#8b5cf6'
  },
  {
    id: 'SubConcept_NeurologicalSymptom',
    label: 'NeurologicalSymptom',
    type: 'SubConcept',
    category: 'Symptom',
    description: 'Symptoms related to central or peripheral nervous system dysfunction.',
    definingFeatures: ['Organ: Brain / Cranial Nerves', 'Consciousness Threat'],
    inheritedFeatures: ['Subjective intensity'],
    examples: ['Severe Headache', 'Dizziness', 'Altered Sensorium'],
    x: 100,
    y: 490,
    color: '#8b5cf6'
  },
  {
    id: 'SubConcept_GISymptom',
    label: 'GastrointestinalSymptom',
    type: 'SubConcept',
    category: 'Symptom',
    description: 'Symptoms of abdominal viscera irritation, peritonitis, or dehydration.',
    definingFeatures: ['Organ: Digestive Tract / Peritoneum'],
    examples: ['Abdominal pain', 'Vomiting'],
    x: 220,
    y: 540,
    color: '#8b5cf6'
  },
  // Vital Signs Subconcepts
  {
    id: 'SubConcept_SpO2',
    label: 'OxygenSaturation (SpO2)',
    type: 'SubConcept',
    category: 'VitalSign',
    description: 'Percentage of oxygenated hemoglobin in arterial blood.',
    definingFeatures: ['Normal: 95-100%', 'Hypoxia: <90%', 'Critical Life-Threat Metric'],
    transitiveAncestors: ['VitalSign', 'EmergencyTriageDomain'],
    x: 370,
    y: 500,
    color: '#ec4899'
  },
  {
    id: 'SubConcept_HeartRate',
    label: 'HeartRate (HR)',
    type: 'SubConcept',
    category: 'VitalSign',
    description: 'Cardiac cycles per minute indicating sympathetic drive, shock, or dysrhythmia.',
    definingFeatures: ['Normal: 60-100 bpm', 'Tachycardia: >100 bpm', 'Bradycardia: <50 bpm'],
    x: 480,
    y: 500,
    color: '#ec4899'
  },
  {
    id: 'SubConcept_BloodPressure',
    label: 'BloodPressure (BP)',
    type: 'SubConcept',
    category: 'VitalSign',
    description: 'Systolic and Diastolic vascular pressures driving end-organ tissue perfusion.',
    definingFeatures: ['Shock: Systolic < 90 mmHg', 'Hypertensive Crisis: Systolic >= 180 mmHg'],
    x: 590,
    y: 500,
    color: '#ec4899'
  },
  // Instances
  {
    id: 'Instance_RedPriority',
    label: 'RED: Immediate Assessment',
    type: 'Instance',
    category: 'Priority',
    description: 'Resuscitation / Immediate life-threat priority requiring instant clinical attendance (0 min wait).',
    definingFeatures: ['Max Target Wait: 0 mins', 'Clinical Pathway: Resuscitation Bay', 'Nursing: 1-to-1'],
    x: 350,
    y: 610,
    color: '#dc2626'
  },
  {
    id: 'Instance_OrangePriority',
    label: 'ORANGE: Urgent Assessment',
    type: 'Instance',
    category: 'Priority',
    description: 'Emergent condition with potential for rapid physiological deterioration (target wait <= 15 mins).',
    definingFeatures: ['Max Target Wait: 15 mins', 'Clinical Pathway: Acute Assessment Bed'],
    x: 470,
    y: 610,
    color: '#ea580c'
  },
  {
    id: 'Instance_YellowPriority',
    label: 'YELLOW: Prompt Assessment',
    type: 'Instance',
    category: 'Priority',
    description: 'Urgent illness requiring timely diagnosis and symptom relief (target wait <= 60 mins).',
    definingFeatures: ['Max Target Wait: 60 mins', 'Clinical Pathway: Subacute Observation'],
    x: 590,
    y: 610,
    color: '#d97706'
  },
  {
    id: 'Instance_GreenPriority',
    label: 'GREEN: Lower Urgency',
    type: 'Instance',
    category: 'Priority',
    description: 'Stable minor acute condition subject to ongoing queue re-evaluation (target wait <= 120 mins).',
    definingFeatures: ['Max Target Wait: 120 mins', 'Clinical Pathway: Fast-Track / Ambulatory'],
    x: 710,
    y: 610,
    color: '#16a34a'
  }
];

export const ONTOLOGY_EDGES: OntologyEdge[] = [
  // Root linkages
  { id: 'e1', source: 'OntologyRoot', target: 'Concept_Patient', relation: 'part_of', label: 'models' },
  { id: 'e2', source: 'OntologyRoot', target: 'Concept_Symptom', relation: 'part_of', label: 'models' },
  { id: 'e3', source: 'OntologyRoot', target: 'Concept_VitalSign', relation: 'part_of', label: 'models' },
  { id: 'e4', source: 'OntologyRoot', target: 'Concept_MedicalCondition', relation: 'part_of', label: 'models' },
  { id: 'e5', source: 'OntologyRoot', target: 'Concept_PriorityRecommendation', relation: 'part_of', label: 'models' },

  // Core semantic relations
  { id: 'e6', source: 'Concept_Patient', target: 'Concept_Symptom', relation: 'has_symptom', label: 'HAS_SYMPTOM' },
  { id: 'e7', source: 'Concept_Patient', target: 'Concept_VitalSign', relation: 'has_vital_sign', label: 'HAS_VITAL_SIGN' },
  { id: 'e8', source: 'Concept_Patient', target: 'Concept_MedicalCondition', relation: 'has_medical_history', label: 'HAS_MEDICAL_HISTORY' },
  { id: 'e9', source: 'Concept_Patient', target: 'Concept_PriorityRecommendation', relation: 'generates', label: 'GENERATES' },

  // Taxonomic specialization (is_a)
  { id: 'e10', source: 'SubConcept_CardiacSymptom', target: 'Concept_Symptom', relation: 'is_a', label: 'is_a', isTransitive: true },
  { id: 'e11', source: 'SubConcept_RespiratorySymptom', target: 'Concept_Symptom', relation: 'is_a', label: 'is_a', isTransitive: true },
  { id: 'e12', source: 'SubConcept_NeurologicalSymptom', target: 'Concept_Symptom', relation: 'is_a', label: 'is_a', isTransitive: true },
  { id: 'e13', source: 'SubConcept_GISymptom', target: 'Concept_Symptom', relation: 'is_a', label: 'is_a', isTransitive: true },

  { id: 'e14', source: 'SubConcept_SpO2', target: 'Concept_VitalSign', relation: 'is_a', label: 'is_a', isTransitive: true },
  { id: 'e15', source: 'SubConcept_HeartRate', target: 'Concept_VitalSign', relation: 'is_a', label: 'is_a', isTransitive: true },
  { id: 'e16', source: 'SubConcept_BloodPressure', target: 'Concept_VitalSign', relation: 'is_a', label: 'is_a', isTransitive: true },

  // Instances instantiation
  { id: 'e17', source: 'Instance_RedPriority', target: 'Concept_PriorityRecommendation', relation: 'is_a', label: 'instance_of' },
  { id: 'e18', source: 'Instance_OrangePriority', target: 'Concept_PriorityRecommendation', relation: 'is_a', label: 'instance_of' },
  { id: 'e19', source: 'Instance_YellowPriority', target: 'Concept_PriorityRecommendation', relation: 'is_a', label: 'instance_of' },
  { id: 'e20', source: 'Instance_GreenPriority', target: 'Concept_PriorityRecommendation', relation: 'is_a', label: 'instance_of' }
];

export const ONTOLOGY_MATCHINGS: OntologyMatchingItem[] = [
  {
    sourceTerm: 'Difficulty breathing',
    sourceOntology: 'Emergency Triage Ontology',
    targetTerm: 'Dyspnea (Finding) [SCTID: 267036007]',
    targetOntology: 'SNOMED-CT',
    similarityScore: 0.96,
    matchType: 'Synonym',
    mappingRationale: 'Semantically identical clinical sign of perceived respiratory distress.'
  },
  {
    sourceTerm: 'Chest pain',
    sourceOntology: 'Emergency Triage Ontology',
    targetTerm: 'Chest pain (Finding) [SCTID: 29857009]',
    targetOntology: 'SNOMED-CT',
    similarityScore: 1.0,
    matchType: 'Exact',
    mappingRationale: 'Direct syntactic and lexical concept alignment.'
  },
  {
    sourceTerm: 'OxygenSaturation (SpO2)',
    sourceOntology: 'Emergency Triage Ontology',
    targetTerm: 'Oxygen saturation of blood [LOINC: 2708-6]',
    targetOntology: 'LOINC',
    similarityScore: 0.98,
    matchType: 'Exact',
    mappingRationale: 'Standard laboratory and vital sign observation code matching.'
  },
  {
    sourceTerm: 'CardiacSymptom',
    sourceOntology: 'Emergency Triage Ontology',
    targetTerm: 'Disorder of cardiovascular system [ICD-10-CM: I51.9]',
    targetOntology: 'ICD-10-CM',
    similarityScore: 0.88,
    matchType: 'Subsumption',
    mappingRationale: 'Ontological subsumption where ICD-10 covers disease states manifested by the symptoms.'
  },
  {
    sourceTerm: 'Hypertension',
    sourceOntology: 'Emergency Triage Ontology',
    targetTerm: 'Essential (primary) hypertension [ICD-10: I10]',
    targetOntology: 'ICD-10-CM',
    similarityScore: 0.95,
    matchType: 'Exact',
    mappingRationale: 'Canonical chronic pre-existing disease crosswalk.'
  }
];
