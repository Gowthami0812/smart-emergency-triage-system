import React, { useState, useMemo } from 'react';
import { ViewKey } from '../components/Sidebar';
import { StorageService } from '../services/storageService';
import { KnowledgeInferenceEngine } from '../engine/inferenceEngine';
import { Patient, PriorityLevel, SymptomSeverity } from '../types/patient';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import {
  Scale,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Layers,
  Activity,
  Workflow
} from 'lucide-react';

interface WhatIfAnalysisProps {
  onNavigate: (view: ViewKey) => void;
  onSelectPatient: (patientId: string) => void;
}

const AVAILABLE_SYMPTOMS = [
  'Chest pain',
  'Difficulty breathing',
  'Fever',
  'Headache',
  'Vomiting',
  'Abdominal pain',
  'Dizziness',
  'Bleeding',
  'Weakness'
];

export const WhatIfAnalysis: React.FC<WhatIfAnalysisProps> = ({
  onNavigate,
  onSelectPatient
}) => {
  const patients = StorageService.getPatients();
  const rules = StorageService.getRules();

  const initialId = StorageService.getActivePatientId() || patients[0]?.id || 'PT-2026-0001';
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialId);

  const originalPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  // Modified Scenario State (starts cloned from original)
  const [modSpO2, setModSpO2] = useState<number>(originalPatient.vitals.spo2);
  const [modHeartRate, setModHeartRate] = useState<number>(originalPatient.vitals.heartRate);
  const [modSystolicBP, setModSystolicBP] = useState<number>(originalPatient.vitals.systolicBP);
  const [modDiastolicBP, setModDiastolicBP] = useState<number>(originalPatient.vitals.diastolicBP);
  const [modRespRate, setModRespRate] = useState<number>(originalPatient.vitals.respiratoryRate);
  const [modTemp, setModTemp] = useState<number>(originalPatient.vitals.temperature);
  const [modSeverity, setModSeverity] = useState<SymptomSeverity>(originalPatient.severity);
  const [modSymptoms, setModSymptoms] = useState<string[]>([...originalPatient.symptoms]);
  const [modHeartDisease, setModHeartDisease] = useState<boolean>(originalPatient.history.heartDisease);
  const [modAsthma, setModAsthma] = useState<boolean>(originalPatient.history.asthma);

  // Sync state when original patient changes
  const handleSelectOriginal = (id: string) => {
    setSelectedPatientId(id);
    StorageService.setActivePatientId(id);
    const pt = patients.find(p => p.id === id);
    if (pt) {
      setModSpO2(pt.vitals.spo2);
      setModHeartRate(pt.vitals.heartRate);
      setModSystolicBP(pt.vitals.systolicBP);
      setModDiastolicBP(pt.vitals.diastolicBP);
      setModRespRate(pt.vitals.respiratoryRate);
      setModTemp(pt.vitals.temperature);
      setModSeverity(pt.severity);
      setModSymptoms([...pt.symptoms]);
      setModHeartDisease(pt.history.heartDisease);
      setModAsthma(pt.history.asthma);
    }
  };

  const resetModifications = () => {
    handleSelectOriginal(selectedPatientId);
  };

  // Construct modified patient object
  const modifiedPatient: Patient = useMemo(() => {
    return {
      ...originalPatient,
      severity: modSeverity,
      symptoms: modSymptoms,
      vitals: {
        ...originalPatient.vitals,
        spo2: modSpO2,
        heartRate: modHeartRate,
        systolicBP: modSystolicBP,
        diastolicBP: modDiastolicBP,
        respiratoryRate: modRespRate,
        temperature: modTemp
      },
      history: {
        ...originalPatient.history,
        heartDisease: modHeartDisease,
        asthma: modAsthma
      }
    };
  }, [
    originalPatient,
    modSeverity,
    modSymptoms,
    modSpO2,
    modHeartRate,
    modSystolicBP,
    modDiastolicBP,
    modRespRate,
    modTemp,
    modHeartDisease,
    modAsthma
  ]);

  // Run the EXACT same inference engine for both scenarios
  const originalInference = useMemo(() => {
    return KnowledgeInferenceEngine.runInference(originalPatient, rules);
  }, [originalPatient, rules]);

  const modifiedInference = useMemo(() => {
    return KnowledgeInferenceEngine.runInference(modifiedPatient, rules);
  }, [modifiedPatient, rules]);

  // Compute Comparative Differential
  const origPriority = originalInference.triageResult.priority;
  const modPriority = modifiedInference.triageResult.priority;

  const priorityRanks = { RED: 4, ORANGE: 3, YELLOW: 2, GREEN: 1 };
  const diffRank = priorityRanks[modPriority] - priorityRanks[origPriority];

  const origRuleIds = new Set(originalInference.triageResult.triggeredRules.map(r => r.ruleId));
  const modRuleIds = new Set(modifiedInference.triageResult.triggeredRules.map(r => r.ruleId));

  const newlyTriggeredRules = modifiedInference.triageResult.triggeredRules.filter(
    r => !origRuleIds.has(r.ruleId)
  );

  const extinguishedRules = originalInference.triageResult.triggeredRules.filter(
    r => !modRuleIds.has(r.ruleId)
  );

  const changedFeatures: string[] = [];
  if (modSpO2 !== originalPatient.vitals.spo2) {
    changedFeatures.push(`SpO2 changed from ${originalPatient.vitals.spo2}% to ${modSpO2}%`);
  }
  if (modHeartRate !== originalPatient.vitals.heartRate) {
    changedFeatures.push(`Heart Rate changed from ${originalPatient.vitals.heartRate} to ${modHeartRate} bpm`);
  }
  if (modSystolicBP !== originalPatient.vitals.systolicBP) {
    changedFeatures.push(`Systolic BP changed from ${originalPatient.vitals.systolicBP} to ${modSystolicBP} mmHg`);
  }
  if (modTemp !== originalPatient.vitals.temperature) {
    changedFeatures.push(`Temperature changed from ${originalPatient.vitals.temperature} to ${modTemp} °C`);
  }
  if (modRespRate !== originalPatient.vitals.respiratoryRate) {
    changedFeatures.push(`Respiratory Rate changed from ${originalPatient.vitals.respiratoryRate} to ${modRespRate} bpm`);
  }
  if (modSeverity !== originalPatient.severity) {
    changedFeatures.push(`Severity shifted from ${originalPatient.severity} to ${modSeverity}`);
  }
  if (modSymptoms.length !== originalPatient.symptoms.length || !modSymptoms.every(s => originalPatient.symptoms.includes(s))) {
    changedFeatures.push(`Symptoms changed (Count: ${modSymptoms.length} vs ${originalPatient.symptoms.length})`);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <DisclaimerBanner compact />

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-700 text-xs font-bold uppercase tracking-wider mb-1">
            <span className="px-2 py-0.5 rounded bg-sky-50 border border-sky-200">
              UNIT 2 • Methodology & Modeling: What-If Workbench
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Scale className="w-5 h-5 text-sky-600" />
            What-If Scenario Simulation & Sensitivity Analysis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactively perturb patient physiological parameters and observe real-time differential rule re-inference.
          </p>
        </div>

        {/* Case Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700 shrink-0">Base Case:</label>
          <select
            value={selectedPatientId}
            onChange={e => handleSelectOriginal(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-semibold text-slate-800 cursor-pointer"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.id} - {p.name}
              </option>
            ))}
          </select>

          <button
            onClick={resetModifications}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            title="Reset modifications to baseline"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* COMPARATIVE IMPACT HERO SUMMARY */}
      <div className={`rounded-2xl p-6 border shadow-md flex flex-col md:flex-row items-center justify-between gap-4 ${
        diffRank > 0
          ? 'bg-red-50/80 border-red-300 text-red-950'
          : diffRank < 0
          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
          : 'bg-slate-100 border-slate-200 text-slate-800'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${
            diffRank > 0 ? 'bg-red-600' : diffRank < 0 ? 'bg-emerald-600' : 'bg-slate-700'
          }`}>
            {diffRank > 0 ? <TrendingUp className="w-6 h-6" /> : diffRank < 0 ? <TrendingDown className="w-6 h-6" /> : <Minus className="w-6 h-6" />}
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider opacity-75">
              Differential Inference Impact
            </div>
            <div className="text-xl font-black tracking-tight">
              {diffRank > 0 ? 'ESCALATION: Priority Increased' :
               diffRank < 0 ? 'DE-ESCALATION: Priority Reduced' :
               'STABLE: Priority Category Unchanged'}
            </div>
            <p className="text-xs opacity-90 mt-0.5">
              Original: <strong>{origPriority}</strong> &rarr; Modified: <strong>{modPriority}</strong>
            </p>
          </div>
        </div>

        <div className="text-xs text-right space-y-1">
          <div>Newly Fired Rules: <strong>{newlyTriggeredRules.length}</strong></div>
          <div>Extinguished Rules: <strong>{extinguishedRules.length}</strong></div>
          <div>Modified Attributes: <strong>{changedFeatures.length}</strong></div>
        </div>
      </div>

      {/* DUAL WORKSPACE: ORIGINAL VS MODIFIED */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* --- PANEL 1: ORIGINAL SCENARIO (READ-ONLY) --- */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Scenario A</span>
              <h3 className="font-bold text-sm text-slate-900">Original Baseline Presentation</h3>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full text-white ${
              origPriority === 'RED' ? 'bg-red-600' :
              origPriority === 'ORANGE' ? 'bg-orange-500' :
              origPriority === 'YELLOW' ? 'bg-amber-500' : 'bg-emerald-600'
            }`}>
              {origPriority}
            </span>
          </div>

          {/* Vitals Snapshot */}
          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-400 font-sans block">SpO2</span>
              <strong>{originalPatient.vitals.spo2}%</strong>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-400 font-sans block">Heart Rate</span>
              <strong>{originalPatient.vitals.heartRate} bpm</strong>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-400 font-sans block">Blood Pressure</span>
              <strong>{originalPatient.vitals.systolicBP}/{originalPatient.vitals.diastolicBP}</strong>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-400 font-sans block">Resp Rate</span>
              <strong>{originalPatient.vitals.respiratoryRate} bpm</strong>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-400 font-sans block">Temperature</span>
              <strong>{originalPatient.vitals.temperature} °C</strong>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-400 font-sans block">Severity</span>
              <strong className="uppercase">{originalPatient.severity}</strong>
            </div>
          </div>

          {/* Baseline Triggered Rules */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Triggered Knowledge Rules ({originalInference.triageResult.triggeredRules.length}):
            </span>
            <div className="space-y-1.5">
              {originalInference.triageResult.triggeredRules.map(r => (
                <div key={r.ruleId} className="p-2 bg-slate-50 rounded-lg flex items-center justify-between font-mono">
                  <span className="font-bold text-sky-700">{r.ruleId}: {r.ruleName}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-sans">
                    {r.priorityAssigned}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- PANEL 2: MODIFIED SCENARIO (INTERACTIVE ADJUSTERS) --- */}
        <div className="bg-white rounded-2xl p-6 border-2 border-sky-400 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-mono font-bold text-sky-600 uppercase">Scenario B (Live Modifiers)</span>
              <h3 className="font-bold text-sm text-slate-900">Modified Hypothetical State</h3>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full text-white shadow-xs ${
              modPriority === 'RED' ? 'bg-red-600' :
              modPriority === 'ORANGE' ? 'bg-orange-500' :
              modPriority === 'YELLOW' ? 'bg-amber-500' : 'bg-emerald-600'
            }`}>
              {modPriority}
            </span>
          </div>

          {/* Interactive Sliders for Vitals */}
          <div className="space-y-3 text-xs">
            {/* SpO2 Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-700">Oxygen Saturation (SpO2)</span>
                <span className="font-mono font-bold text-sky-700">{modSpO2}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="100"
                value={modSpO2}
                onChange={e => setModSpO2(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>

            {/* Heart Rate Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-700">Heart Rate</span>
                <span className="font-mono font-bold text-sky-700">{modHeartRate} bpm</span>
              </div>
              <input
                type="range"
                min="40"
                max="180"
                value={modHeartRate}
                onChange={e => setModHeartRate(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>

            {/* Systolic BP Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-700">Systolic Blood Pressure</span>
                <span className="font-mono font-bold text-sky-700">{modSystolicBP} mmHg</span>
              </div>
              <input
                type="range"
                min="60"
                max="220"
                value={modSystolicBP}
                onChange={e => setModSystolicBP(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>

            {/* Severity Buttons */}
            <div>
              <span className="font-semibold text-slate-700 block mb-1">Severity:</span>
              <div className="grid grid-cols-4 gap-2">
                {(['mild', 'moderate', 'severe', 'unknown'] as SymptomSeverity[]).map(sev => (
                  <button
                    key={sev}
                    onClick={() => setModSeverity(sev)}
                    className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                      modSeverity === sev
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms Toggle */}
            <div className="pt-1">
              <span className="font-semibold text-slate-700 block mb-1">Symptoms in Scenario B:</span>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_SYMPTOMS.map(sym => {
                  const active = modSymptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      onClick={() => {
                        setModSymptoms(prev =>
                          active ? prev.filter(s => s !== sym) : [...prev, sym]
                        );
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                        active
                          ? 'bg-purple-600 text-white font-bold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Triggered Rules in Scenario B */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">
              Updated Triggered Rules ({modifiedInference.triageResult.triggeredRules.length}):
            </span>
            <div className="space-y-1.5">
              {modifiedInference.triageResult.triggeredRules.map(r => (
                <div key={r.ruleId} className="p-2 bg-sky-50 rounded-lg flex items-center justify-between font-mono">
                  <span className="font-bold text-sky-900">{r.ruleId}: {r.ruleName}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white font-sans ${
                    r.priorityAssigned === 'RED' ? 'bg-red-600' :
                    r.priorityAssigned === 'ORANGE' ? 'bg-orange-500' :
                    r.priorityAssigned === 'YELLOW' ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}>
                    {r.priorityAssigned}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DIFFERENTIAL EXPLANATION BREAKDOWN */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Workflow className="w-4 h-4 text-sky-600" />
          Comparative Differential Analysis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Newly Triggered */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
            <span className="font-bold text-emerald-950 uppercase text-[10px] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Newly Triggered Rules:
            </span>
            {newlyTriggeredRules.length === 0 ? (
              <p className="text-slate-400 italic">No new rules fired.</p>
            ) : (
              <ul className="space-y-1 font-mono text-[11px] text-emerald-900">
                {newlyTriggeredRules.map(r => (
                  <li key={r.ruleId}>&bull; {r.ruleId} ({r.priorityAssigned})</li>
                ))}
              </ul>
            )}
          </div>

          {/* Extinguished Rules */}
          <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 space-y-2">
            <span className="font-bold text-rose-950 uppercase text-[10px] flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              Extinguished (Previously Fired):
            </span>
            {extinguishedRules.length === 0 ? (
              <p className="text-slate-400 italic">None extinguished.</p>
            ) : (
              <ul className="space-y-1 font-mono text-[11px] text-rose-900">
                {extinguishedRules.map(r => (
                  <li key={r.ruleId}>&bull; {r.ruleId} ({r.priorityAssigned})</li>
                ))}
              </ul>
            )}
          </div>

          {/* Key Modified Features */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-700 uppercase text-[10px]">
              Altered Features Ledger:
            </span>
            {changedFeatures.length === 0 ? (
              <p className="text-slate-400 italic">Identical to baseline.</p>
            ) : (
              <ul className="space-y-1 text-[11px] text-slate-700">
                {changedFeatures.map((f, i) => (
                  <li key={i}>&bull; {f}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
