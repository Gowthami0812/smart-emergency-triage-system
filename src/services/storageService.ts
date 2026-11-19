import { Patient, PatientRecord, TriageResult } from '../types/patient';
import { ProductionRule } from '../types/rules';
import { DEFAULT_PATIENTS, DEFAULT_RULES } from '../data/seedData';

const STORAGE_KEYS = {
  RULES: 'kets_production_rules_v1',
  PATIENTS: 'kets_patients_records_v1',
  ACTIVE_PATIENT: 'kets_active_patient_id_v1',
  TRIAGE_RESULTS: 'kets_triage_results_map_v1',
};

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notify() {
  listeners.forEach(fn => {
    try {
      fn();
    } catch (e) {
      console.error('Listener notification error', e);
    }
  });
}

export const StorageService = {
  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  // RULES
  getRules(): ProductionRule[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RULES);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to parse rules from storage', e);
    }
    // Seed default rules
    this.saveRules(DEFAULT_RULES);
    return DEFAULT_RULES;
  },

  saveRules(rules: ProductionRule[]): void {
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
    notify();
  },

  addRule(rule: ProductionRule): void {
    const rules = this.getRules();
    rules.unshift(rule);
    this.saveRules(rules);
  },

  updateRule(ruleId: string, updated: Partial<ProductionRule>): void {
    const rules = this.getRules();
    const index = rules.findIndex(r => r.id === ruleId);
    if (index !== -1) {
      rules[index] = { ...rules[index], ...updated, updatedAt: new Date().toISOString() };
      this.saveRules(rules);
    }
  },

  toggleRule(ruleId: string): void {
    const rules = this.getRules();
    const target = rules.find(r => r.id === ruleId);
    if (target) {
      target.enabled = !target.enabled;
      this.saveRules(rules);
    }
  },

  deleteRule(ruleId: string): void {
    const rules = this.getRules().filter(r => r.id !== ruleId);
    this.saveRules(rules);
  },

  incrementRuleTrigger(ruleId: string): void {
    const rules = this.getRules();
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      rule.triggerCount = (rule.triggerCount || 0) + 1;
      localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
    }
  },

  // PATIENTS
  getPatients(): PatientRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to parse patients from storage', e);
    }
    this.savePatients(DEFAULT_PATIENTS as PatientRecord[]);
    return DEFAULT_PATIENTS as PatientRecord[];
  },

  savePatients(patients: PatientRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    notify();
  },

  getPatientById(id: string): PatientRecord | undefined {
    return this.getPatients().find(p => p.id === id);
  },

  addPatient(patient: Patient): PatientRecord {
    const patients = this.getPatients();
    const record: PatientRecord = { ...patient };
    patients.unshift(record);
    this.savePatients(patients);
    return record;
  },

  updatePatient(id: string, updated: Partial<PatientRecord>): void {
    const patients = this.getPatients();
    const idx = patients.findIndex(p => p.id === id);
    if (idx !== -1) {
      patients[idx] = { ...patients[idx], ...updated };
      this.savePatients(patients);
    }
  },

  deletePatient(id: string): void {
    const patients = this.getPatients().filter(p => p.id !== id);
    this.savePatients(patients);
  },

  // TRIAGE RESULTS
  saveTriageResult(patientId: string, result: TriageResult): void {
    const patients = this.getPatients();
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      patient.triageResult = result;
      if (!patient.historyLog) patient.historyLog = [];
      patient.historyLog.unshift({
        date: result.assessedAt,
        priority: result.priority,
        triggeredRulesCount: result.triggeredRules.length,
        notes: result.clinicalRationale
      });
      this.savePatients(patients);
    }
  },

  // ACTIVE PATIENT FOR ROUTING / WORKFLOW
  setActivePatientId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PATIENT, id);
    notify();
  },

  getActivePatientId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PATIENT);
  },

  // RESET & EXPORT
  resetToDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(DEFAULT_RULES));
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(DEFAULT_PATIENTS));
    notify();
  },

  exportDataJson(): string {
    return JSON.stringify({
      rules: this.getRules(),
      patients: this.getPatients(),
      exportedAt: new Date().toISOString(),
      course: '22ITE61 - Knowledge Engineering'
    }, null, 2);
  },

  importDataJson(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.rules)) {
        this.saveRules(parsed.rules);
      }
      if (Array.isArray(parsed.patients)) {
        this.savePatients(parsed.patients);
      }
      return true;
    } catch (e) {
      console.error('Import error', e);
      return false;
    }
  }
};
