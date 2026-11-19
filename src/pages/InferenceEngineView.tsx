import React, { useState, useMemo } from 'react';
import { ViewKey } from '../components/Sidebar';
import { StorageService } from '../services/storageService';
import { KnowledgeInferenceEngine } from '../engine/inferenceEngine';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { PatientRecord, PriorityLevel } from '../types/patient';
import { ProductionRule, RuleExecutionTrace } from '../types/rules';
import {
  Cpu,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Database,
  Workflow,
  Search,
  Eye,
  ShieldCheck
} from 'lucide-react';

interface InferenceEngineViewProps {
  onNavigate: (view: ViewKey) => void;
  onSelectPatient: (patientId: string) => void;
}

export const InferenceEngineView: React.FC<InferenceEngineViewProps> = ({
  onNavigate,
  onSelectPatient
}) => {
  const patients = StorageService.getPatients();
  const rules = StorageService.getRules();

  // Active patient for trace demonstration
  const initialPatientId = StorageService.getActivePatientId() || patients[0]?.id || 'PT-2026-0001';
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId);
  const [ruleSearch, setRuleSearch] = useState('');
  const [filterResult, setFilterResult] = useState<'ALL' | 'MATCHED' | 'UNMATCHED'>('ALL');

  const currentPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  // Run deterministic inference on selected patient
  const { triageResult, session } = useMemo(() => {
    if (!currentPatient) {
      return { triageResult: null, session: null };
    }
    return KnowledgeInferenceEngine.runInference(currentPatient, rules);
  }, [currentPatient, rules]);

  const facts = session?.extractedFacts || {};
  const traces = session?.traces || [];

  const filteredTraces = useMemo(() => {
    return traces.filter(t => {
      if (filterResult === 'MATCHED' && !t.matched) return false;
      if (filterResult === 'UNMATCHED' && t.matched) return false;
      if (ruleSearch.trim()) {
        const q = ruleSearch.toLowerCase();
        return t.ruleId.toLowerCase().includes(q) || t.ruleName.toLowerCase().includes(q) || t.ruleCategory.toLowerCase().includes(q);
      }
      return true;
    });
  }, [traces, filterResult, ruleSearch]);

  const activeRulesCount = rules.filter(r => r.enabled).length;
  const matchedRulesCount = traces.filter(t => t.matched).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <DisclaimerBanner compact />

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-700 text-xs font-bold uppercase tracking-wider mb-1">
            <span className="px-2 py-0.5 rounded bg-sky-50 border border-sky-200">
              UNIT 4 • Production System Architecture
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-600" />
            Rule-Based Inference Engine & Execution Tracer
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Forward-chaining matching cycle with working memory facts, condition evaluation, and conflict resolution.
          </p>
        </div>

        {/* Patient Selector */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-bold text-slate-700 shrink-0">Evaluate Case:</label>
          <select
            value={selectedPatientId}
            onChange={e => {
              setSelectedPatientId(e.target.value);
              StorageService.setActivePatientId(e.target.value);
            }}
            className="w-full md:w-64 bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.id} - {p.name} ({p.age}y, {p.gender})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* VISUAL INFERENCE PIPELINE (Section 7 Problem Statement Flow) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <Workflow className="w-4 h-4 text-sky-600" />
          Production System Lifecycle Workflow
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
          {[
            { step: '1', title: 'Patient Info', desc: `${currentPatient?.name} (${currentPatient?.id})`, color: 'bg-slate-100 text-slate-800' },
            { step: '2', title: 'Knowledge Rep', desc: `${Object.keys(facts).length} Working Memory Facts`, color: 'bg-indigo-50 text-indigo-800' },
            { step: '3', title: 'Knowledge Base', desc: `${activeRulesCount} Active Production Rules`, color: 'bg-sky-50 text-sky-800' },
            { step: '4', title: 'Rule Matching', desc: 'Forward-Chaining Evaluation', color: 'bg-amber-50 text-amber-800' },
            { step: '5', title: 'Conflict Res', desc: `${matchedRulesCount} Triggered • Urgency-Max`, color: 'bg-purple-50 text-purple-800' },
            { step: '6', title: 'Evidence Syn', desc: `${triageResult?.vitalFlags.length} Vitals Flags`, color: 'bg-cyan-50 text-cyan-800' },
            { step: '7', title: 'Recommendation', desc: `${triageResult?.priority} Priority`, color: triageResult?.priority === 'RED' ? 'bg-red-600 text-white font-bold' : triageResult?.priority === 'ORANGE' ? 'bg-orange-500 text-white font-bold' : triageResult?.priority === 'YELLOW' ? 'bg-amber-500 text-white font-bold' : 'bg-emerald-600 text-white font-bold' }
          ].map((node, i) => (
            <div key={i} className={`p-3 rounded-xl border border-slate-200/80 ${node.color} flex flex-col justify-between space-y-1`}>
              <div className="text-[10px] font-mono font-bold opacity-75">Phase {node.step}</div>
              <div className="font-bold tracking-tight text-xs">{node.title}</div>
              <div className="text-[10px] opacity-90 truncate">{node.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TWO-COLUMN INFERENCE WORKBENCH: FACTS VS TRACES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN: EXTRACTED WORKING MEMORY FACTS (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-sky-600" />
              Extracted Facts (Working Memory)
            </h3>
            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              Asserted WME
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Demographics */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Demographics</span>
              <div className="flex justify-between"><span className="text-slate-500">Name:</span> <span className="font-bold text-slate-800">{currentPatient.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Age / Gender:</span> <span className="font-bold text-slate-800">{currentPatient.age}y / {currentPatient.gender}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Subjective Severity:</span> <span className="font-bold uppercase text-slate-800">{currentPatient.severity}</span></div>
            </div>

            {/* Vital Signs Assertions */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 font-mono">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Vital Sign Values</span>
              <div className="flex justify-between"><span className="text-slate-500">spo2:</span> <span className={`font-bold ${currentPatient.vitals.spo2 < 90 ? 'text-red-600' : 'text-slate-800'}`}>{currentPatient.vitals.spo2}%</span></div>
              <div className="flex justify-between"><span className="text-slate-500">heartRate:</span> <span className={`font-bold ${currentPatient.vitals.heartRate > 100 ? 'text-orange-600' : 'text-slate-800'}`}>{currentPatient.vitals.heartRate} bpm</span></div>
              <div className="flex justify-between"><span className="text-slate-500">bloodPressure:</span> <span className="font-bold text-slate-800">{currentPatient.vitals.systolicBP}/{currentPatient.vitals.diastolicBP} mmHg</span></div>
              <div className="flex justify-between"><span className="text-slate-500">respiratoryRate:</span> <span className="font-bold text-slate-800">{currentPatient.vitals.respiratoryRate} bpm</span></div>
              <div className="flex justify-between"><span className="text-slate-500">temperature:</span> <span className="font-bold text-slate-800">{currentPatient.vitals.temperature} °C</span></div>
            </div>

            {/* Reported Symptoms */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reported Symptoms</span>
              <div className="flex flex-wrap gap-1">
                {(currentPatient.symptoms || []).map((s, idx) => (
                  <span key={idx} className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded font-semibold">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Medical History Flags */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-[11px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">History Antecedents</span>
              <div className="grid grid-cols-2 gap-1 text-slate-600">
                <span>Heart Disease: <strong>{currentPatient.history.heartDisease ? 'TRUE' : 'FALSE'}</strong></span>
                <span>Diabetes: <strong>{currentPatient.history.diabetes ? 'TRUE' : 'FALSE'}</strong></span>
                <span>Asthma: <strong>{currentPatient.history.asthma ? 'TRUE' : 'FALSE'}</strong></span>
                <span>Hypertension: <strong>{currentPatient.history.hypertension ? 'TRUE' : 'FALSE'}</strong></span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                onSelectPatient(currentPatient.id);
                onNavigate('what-if');
              }}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all text-center"
            >
              Simulate Modifications in What-If Workbench &rarr;
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: RULE EXECUTION TRACER & MATCHING LOG (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Controls: Search and Filter */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="font-bold text-slate-800">Rule Matching Filter:</span>
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                <button
                  onClick={() => setFilterResult('ALL')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    filterResult === 'ALL' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                  }`}
                >
                  All ({traces.length})
                </button>
                <button
                  onClick={() => setFilterResult('MATCHED')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    filterResult === 'MATCHED' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Triggered ({matchedRulesCount})
                </button>
                <button
                  onClick={() => setFilterResult('UNMATCHED')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    filterResult === 'UNMATCHED' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Unmatched ({traces.length - matchedRulesCount})
                </button>
              </div>
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search rule ID / category..."
                value={ruleSearch}
                onChange={e => setRuleSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* List of Evaluated Rule Traces */}
          <div className="space-y-3">
            {filteredTraces.map(trace => {
              const ruleObj = rules.find(r => r.id === trace.ruleId);
              return (
                <div
                  key={trace.ruleId}
                  className={`bg-white rounded-xl p-4 border transition-all ${
                    trace.matched
                      ? 'border-emerald-300 shadow-sm bg-gradient-to-r from-emerald-50/20 to-white'
                      : 'border-slate-200/80 opacity-80'
                  }`}
                >
                  {/* Trace Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`p-1 rounded-full ${trace.matched ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                        {trace.matched ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </span>
                      <div>
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                          <span className="font-mono text-sky-600">{trace.ruleId}</span>
                          <span>•</span>
                          <span>{trace.ruleName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Category: {trace.ruleCategory}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {trace.matched ? (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${
                          trace.resultingPriority === 'RED' ? 'bg-red-600' :
                          trace.resultingPriority === 'ORANGE' ? 'bg-orange-500' :
                          trace.resultingPriority === 'YELLOW' ? 'bg-amber-500' : 'bg-emerald-600'
                        }`}>
                          FIRED &rarr; {trace.resultingPriority}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          Conditions Not Met
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Condition Evaluation Table */}
                  <div className="mt-3 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Antecedents (IF Conditions):
                    </span>
                    <div className="space-y-1">
                      {trace.matchedConditions.map((cond, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded-lg text-xs flex items-center justify-between font-mono ${
                            cond.passed
                              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/60'
                              : 'bg-slate-50 text-slate-600 border border-slate-200/60'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {cond.passed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                            <span>{cond.condition}</span>
                          </div>

                          <span className="text-[10px] text-slate-500">
                            Actual: <strong className="text-slate-800">{JSON.stringify(cond.actualValue)}</strong>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fired Action & Consequent */}
                  {trace.matched && trace.actionTaken && (
                    <div className="mt-3 p-2.5 bg-sky-50/70 border border-sky-100 rounded-lg text-xs space-y-1">
                      <span className="text-[10px] font-bold text-sky-950 uppercase tracking-wider">
                        Production Action (THEN Consequent):
                      </span>
                      <p className="text-sky-900 font-medium">{trace.actionTaken}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* FINAL REASONING SUMMARY CARD */}
          {triageResult && (
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Final Forward-Chaining Inference Conclusion
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded text-white ${
                  triageResult.priority === 'RED' ? 'bg-red-600' :
                  triageResult.priority === 'ORANGE' ? 'bg-orange-500' :
                  triageResult.priority === 'YELLOW' ? 'bg-amber-500' : 'bg-emerald-600'
                }`}>
                  {triageResult.priority} PRIORITY
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {triageResult.clinicalRationale}
              </p>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
                <span>Deterministic forward-chaining evaluation complete.</span>
                <button
                  onClick={() => {
                    StorageService.setActivePatientId(currentPatient.id);
                    onSelectPatient(currentPatient.id);
                    onNavigate('triage-results');
                  }}
                  className="text-sky-400 hover:text-sky-300 font-semibold underline flex items-center gap-1"
                >
                  <span>Open Full Triage Report</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
