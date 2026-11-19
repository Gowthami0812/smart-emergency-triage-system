import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Default Seed Rules
const DEFAULT_RULES = [
  {
    id: 'RULE-01',
    name: 'Critical Hypoxia Alert',
    category: 'Airway/Breathing',
    ruleType: 'production',
    description: 'Triggers immediate emergency triage if oxygen saturation falls below critical illustrative threshold (SpO2 < 90%).',
    conditions: [{ id: 'c1', field: 'spo2', operator: '<', value: 90, label: 'Oxygen Saturation (SpO2) < 90%' }],
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
      { id: 'c1', field: 'symptoms', operator: 'contains', value: 'Difficulty breathing', label: 'Symptom contains "Difficulty breathing"' },
      { id: 'c2', field: 'spo2', operator: '<=', value: 92, label: 'Oxygen Saturation (SpO2) <= 92%' }
    ],
    logicOperator: 'AND',
    action: {
      priority: 'RED',
      rationale: 'Work of breathing combined with physiological hypoxemia demands emergency airway assessment.',
      clinicalAlert: 'Continuous SpO2 monitoring, rapid physician bedside evaluation.',
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
    description: 'Active reported severe bleeding requires immediate emergency control.',
    conditions: [
      { id: 'c1', field: 'symptoms', operator: 'contains', value: 'Bleeding', label: 'Symptom contains "Bleeding"' },
      { id: 'c2', field: 'severity', operator: '==', value: 'severe', label: 'Symptom Severity == severe' }
    ],
    logicOperator: 'AND',
    action: {
      priority: 'RED',
      rationale: 'Active uncontrolled severe hemorrhage poses immediate risk of hemorrhagic shock.',
      clinicalAlert: 'Direct pressure / tourniquet, massive transfusion protocol readiness.',
      weight: 98
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
    description: 'Reported chest pain in patients with existing heart disease.',
    conditions: [
      { id: 'c1', field: 'symptoms', operator: 'contains', value: 'Chest pain', label: 'Symptom contains "Chest pain"' },
      { id: 'c2', field: 'hasHeartDisease', operator: 'is_true', value: true, label: 'Patient Has Known Heart Disease == true' }
    ],
    logicOperator: 'AND',
    action: {
      priority: 'ORANGE',
      rationale: 'Acute chest pain on high-risk cardiovascular background carries elevated probability of Acute Coronary Syndrome.',
      clinicalAlert: 'Stat 12-lead ECG within 10 minutes, cardiac troponin assay.',
      weight: 85
    },
    enabled: true,
    isBuiltIn: true,
    triggerCount: 5
  },
  {
    id: 'RULE-15',
    name: 'Isolated Mild Complaint with Stable Physiology',
    category: 'Reduction',
    ruleType: 'reduction',
    description: 'Reduction rule: Mild symptom severity with all vital signs strictly within normal physiological limits.',
    conditions: [
      { id: 'c1', field: 'severity', operator: '==', value: 'mild', label: 'Symptom Severity == mild' },
      { id: 'c2', field: 'spo2', operator: '>=', value: 96, label: 'Oxygen Saturation (SpO2) >= 96%' },
      { id: 'c3', field: 'systolicBP', operator: '<', value: 140, label: 'Systolic BP < 140 mmHg' }
    ],
    logicOperator: 'AND',
    action: {
      priority: 'GREEN',
      rationale: 'Mild isolated symptoms with optimal cardiopulmonary indices indicate lower apparent acute urgency.',
      clinicalAlert: 'Standard ambulatory triage queue.',
      weight: 20
    },
    enabled: true,
    isBuiltIn: true,
    triggerCount: 8
  }
];

// Default Seed Patients
const DEFAULT_PATIENTS = [
  {
    id: 'PT-2026-0001',
    name: 'Rajesh Sharma',
    age: 58,
    gender: 'Male',
    assessmentDate: '2026-11-19',
    assessmentTime: '18:15',
    symptoms: ['Chest pain', 'Difficulty breathing', 'Weakness'],
    vitals: { temperature: 37.1, heartRate: 122, systolicBP: 145, diastolicBP: 95, respiratoryRate: 26, spo2: 88 },
    history: { diabetes: true, hypertension: true, heartDisease: true, asthma: false, previousSurgeries: false, allergies: false, otherConditions: 'Hyperlipidemia' },
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
    vitals: { temperature: 36.6, heartRate: 134, systolicBP: 85, diastolicBP: 55, respiratoryRate: 22, spo2: 94 },
    history: { diabetes: false, hypertension: false, heartDisease: false, asthma: false, previousSurgeries: true, allergies: true, otherConditions: 'Penicillin allergy' },
    severity: 'severe',
    chiefComplaintNotes: 'Laceration injury with active severe arterial spurting.'
  },
  {
    id: 'PT-2026-0011',
    name: 'Arun Sundaram',
    age: 26,
    gender: 'Male',
    assessmentDate: '2026-11-19',
    assessmentTime: '21:10',
    symptoms: ['Weakness'],
    vitals: { temperature: 36.7, heartRate: 72, systolicBP: 118, diastolicBP: 74, respiratoryRate: 15, spo2: 99 },
    history: { diabetes: false, hypertension: false, heartDisease: false, asthma: false, previousSurgeries: false, allergies: false, otherConditions: '' },
    severity: 'mild',
    chiefComplaintNotes: 'General tiredness after sports session.'
  }
];

// Resilient In-Memory Storage Fallback
let inMemoryPatients = [...DEFAULT_PATIENTS];
let inMemoryRules = [...DEFAULT_RULES];
let isMongoConnected = false;

// MongoDB Mongoose Setup
let PatientModel, RuleModel;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
    .then(async () => {
      console.log('MongoDB Atlas Connected successfully');
      isMongoConnected = true;

      // Seed if empty
      const ruleCount = await RuleModel.countDocuments();
      if (ruleCount === 0) {
        await RuleModel.insertMany(DEFAULT_RULES);
        console.log('Default production rules seeded into MongoDB');
      }

      const patientCount = await PatientModel.countDocuments();
      if (patientCount === 0) {
        await PatientModel.insertMany(DEFAULT_PATIENTS);
        console.log('Default patients seeded into MongoDB');
      }
    })
    .catch(err => {
      console.warn('MongoDB connection failed, falling back to resilient in-memory store:', err.message);
      isMongoConnected = false;
    });

  const PatientSchema = new mongoose.Schema({}, { strict: false });
  const RuleSchema = new mongoose.Schema({}, { strict: false });
  PatientModel = mongoose.model('Patient', PatientSchema);
  RuleModel = mongoose.model('ProductionRule', RuleSchema);
}

// ------------------------------------------------------------------
// HEALTH CHECK
// ------------------------------------------------------------------
app.get(['/health', '/api/health'], (req, res) => {
  res.json({
    status: 'ok',
    service: 'Smart Emergency Triage System Backend',
    course: '22ITE61 - Knowledge Engineering',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    database: isMongoConnected ? 'MongoDB Atlas (Connected)' : 'In-Memory Resilient Store (Active)',
    patientsCount: isMongoConnected ? 'Dynamic DB' : inMemoryPatients.length,
    rulesCount: isMongoConnected ? 'Dynamic DB' : inMemoryRules.length
  });
});

// ------------------------------------------------------------------
// PATIENT ENDPOINTS
// ------------------------------------------------------------------
app.get('/api/patients', async (req, res) => {
  try {
    if (isMongoConnected && PatientModel) {
      const pts = await PatientModel.find({}).sort({ assessmentDate: -1 });
      return res.json(pts);
    }
    res.json(inMemoryPatients);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch patients', details: err.message });
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    const patientData = req.body;
    if (!patientData.id) {
      patientData.id = `PT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    if (!patientData.assessmentDate) {
      patientData.assessmentDate = new Date().toISOString().slice(0, 10);
    }
    if (!patientData.assessmentTime) {
      patientData.assessmentTime = new Date().toTimeString().slice(0, 5);
    }

    if (isMongoConnected && PatientModel) {
      const created = await PatientModel.create(patientData);
      return res.status(201).json(created);
    }

    inMemoryPatients.unshift(patientData);
    res.status(201).json(patientData);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create patient', details: err.message });
  }
});

app.get('/api/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected && PatientModel) {
      const pt = await PatientModel.findOne({ id });
      if (!pt) return res.status(404).json({ error: 'Patient not found' });
      return res.json(pt);
    }

    const pt = inMemoryPatients.find(p => p.id === id);
    if (!pt) return res.status(404).json({ error: 'Patient not found' });
    res.json(pt);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch patient', details: err.message });
  }
});

app.delete('/api/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected && PatientModel) {
      await PatientModel.deleteOne({ id });
      return res.json({ message: `Patient ${id} deleted successfully` });
    }

    inMemoryPatients = inMemoryPatients.filter(p => p.id !== id);
    res.json({ message: `Patient ${id} deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete patient', details: err.message });
  }
});

// ------------------------------------------------------------------
// PRODUCTION RULES ENDPOINTS
// ------------------------------------------------------------------
app.get('/api/rules', async (req, res) => {
  try {
    if (isMongoConnected && RuleModel) {
      const rules = await RuleModel.find({});
      return res.json(rules);
    }
    res.json(inMemoryRules);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rules', details: err.message });
  }
});

app.post('/api/rules', async (req, res) => {
  try {
    const ruleData = req.body;
    if (!ruleData.id) {
      ruleData.id = `RULE-USER-${Math.floor(100 + Math.random() * 900)}`;
    }

    if (isMongoConnected && RuleModel) {
      const created = await RuleModel.create(ruleData);
      return res.status(201).json(created);
    }

    inMemoryRules.unshift(ruleData);
    res.status(201).json(ruleData);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add rule', details: err.message });
  }
});

app.put('/api/rules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (isMongoConnected && RuleModel) {
      const updated = await RuleModel.findOneAndUpdate({ id }, updates, { new: true });
      return res.json(updated);
    }

    const idx = inMemoryRules.findIndex(r => r.id === id);
    if (idx !== -1) {
      inMemoryRules[idx] = { ...inMemoryRules[idx], ...updates };
      return res.json(inMemoryRules[idx]);
    }
    res.status(404).json({ error: 'Rule not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update rule', details: err.message });
  }
});

app.delete('/api/rules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected && RuleModel) {
      await RuleModel.deleteOne({ id });
      return res.json({ message: `Rule ${id} deleted` });
    }

    inMemoryRules = inMemoryRules.filter(r => r.id !== id);
    res.json({ message: `Rule ${id} deleted` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete rule', details: err.message });
  }
});

app.post('/api/rules/reset', async (req, res) => {
  try {
    if (isMongoConnected && RuleModel) {
      await RuleModel.deleteMany({});
      await RuleModel.insertMany(DEFAULT_RULES);
      return res.json({ message: 'Rules restored to defaults in MongoDB' });
    }

    inMemoryRules = [...DEFAULT_RULES];
    res.json({ message: 'Rules restored to default state' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset rules', details: err.message });
  }
});

// ------------------------------------------------------------------
// SERVER-SIDE INFERENCE EVALUATION ENDPOINT
// ------------------------------------------------------------------
app.post('/api/triage/assess', (req, res) => {
  try {
    const patient = req.body;
    if (!patient || !patient.vitals) {
      return res.status(400).json({ error: 'Invalid patient data: vitals are required' });
    }

    const v = patient.vitals;
    let priority = 'GREEN';
    let rationale = 'Baseline stable physiology: vital signs within normal parameters.';
    const triggeredRules = [];

    // Evaluate against active production rules
    const activeRules = inMemoryRules.filter(r => r.enabled);

    for (const rule of activeRules) {
      let matched = false;

      // Condition testing
      if (rule.id === 'RULE-01' && v.spo2 < 90) {
        matched = true;
      } else if (rule.id === 'RULE-02' && (patient.symptoms || []).includes('Difficulty breathing') && v.spo2 <= 92) {
        matched = true;
      } else if (rule.id === 'RULE-03' && (patient.symptoms || []).includes('Bleeding') && patient.severity === 'severe') {
        matched = true;
      } else if (rule.id === 'RULE-06' && (patient.symptoms || []).includes('Chest pain') && patient.history?.heartDisease) {
        matched = true;
      } else if (rule.id === 'RULE-15' && patient.severity === 'mild' && v.spo2 >= 96 && v.systolicBP < 140) {
        matched = true;
      }

      if (matched) {
        triggeredRules.push({
          ruleId: rule.id,
          ruleName: rule.name,
          priorityAssigned: rule.action.priority,
          rationale: rule.action.rationale
        });
      }
    }

    if (triggeredRules.some(r => r.priorityAssigned === 'RED')) {
      priority = 'RED';
      rationale = triggeredRules.find(r => r.priorityAssigned === 'RED').rationale;
    } else if (triggeredRules.some(r => r.priorityAssigned === 'ORANGE')) {
      priority = 'ORANGE';
      rationale = triggeredRules.find(r => r.priorityAssigned === 'ORANGE').rationale;
    } else if (triggeredRules.some(r => r.priorityAssigned === 'YELLOW')) {
      priority = 'YELLOW';
      rationale = triggeredRules.find(r => r.priorityAssigned === 'YELLOW').rationale;
    }

    const result = {
      patientId: patient.id,
      priority,
      clinicalRationale: rationale,
      assessedAt: new Date().toISOString(),
      triggeredRules
    };

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Inference execution failed', details: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Smart Emergency Triage Backend listening on port ${PORT}`);
  console.log(`Health check ready at http://localhost:${PORT}/api/health`);
});
