import React, { useMemo } from 'react';
import { ViewKey } from '../components/Sidebar';
import { StorageService } from '../services/storageService';
import { KnowledgeInferenceEngine } from '../engine/inferenceEngine';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { PriorityLevel } from '../types/patient';
import {
  FileCheck2,
  AlertOctagon,
  AlertTriangle,
  Clock,
  CheckCircle,
  Activity,
  ShieldAlert,
  ArrowRight,
  Scale,
  Printer,
  ChevronRight,
  Cpu,
  History,
  Info
} from 'lucide-react';

interface TriageResultViewProps {
  onNavigate: (view: ViewKey) => void;
  onSelectPatient: (patientId: string) => void;
  patientId?: string;
}

export const TriageResultView: React.FC<TriageResultViewProps> = ({
  onNavigate,
  onSelectPatient,
  patientId
}) => {
  const activeId = patientId || StorageService.getActivePatientId() || 'PT-2026-0001';
  const patient = StorageService.getPatientById(activeId) || StorageService.getPatients()[0];
  const rules = StorageService.getRules();

  // Run dynamic inference
  const { triageResult, session } = useMemo(() => {
    if (!patient) return { triageResult: null, session: null };
    return KnowledgeInferenceEngine.runInference(patient, rules);
  }, [patient, rules]);

  if (!patient || !triageResult) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm text-slate-500">No patient selected for triage evaluation.</p>
        <button
          onClick={() => onNavigate('assessment')}
          className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold"
        >
          Go to Patient Assessment
        </button>
      </div>
    );
  }

  const priority = triageResult.priority;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <DisclaimerBanner />

      {/* Header with Print & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-mono font-bold text-sky-600">
            CASE IDENTIFIER: {patient.id}
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-sky-600" />
            Formal Emergency Triage Assessment Summary
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generated via deterministic knowledge-based production rule inference.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>

          <button
            onClick={() => {
              StorageService.setActivePatientId(patient.id);
              onSelectPatient(patient.id);
              onNavigate('what-if');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Launch What-If Simulation</span>
          </button>
        </div>
      </div>

      {/* PRIORITY OUTCOME HERO BANNER (Section 9 Red/Orange/Yellow/Green) */}
      <div className={`rounded-2xl p-6 border shadow-md space-y-4 ${
        priority === 'RED'
          ? 'bg-red-50/90 border-red-300 text-red-950'
          : priority === 'ORANGE'
          ? 'bg-orange-50/90 border-orange-300 text-orange-950'
          : priority === 'YELLOW'
          ? 'bg-amber-50/90 border-amber-300 text-amber-950'
          : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${
              priority === 'RED' ? 'bg-red-600 shadow-red-900/40' :
              priority === 'ORANGE' ? 'bg-orange-600 shadow-orange-900/40' :
              priority === 'YELLOW' ? 'bg-amber-500 shadow-amber-900/40' : 'bg-emerald-600 shadow-emerald-900/40'
            }`}>
              {priority === 'RED' ? <AlertOctagon className="w-8 h-8" /> :
               priority === 'ORANGE' ? <AlertTriangle className="w-8 h-8" /> :
               priority === 'YELLOW' ? <Clock className="w-8 h-8" /> : <CheckCircle className="w-8 h-8" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase text-white ${
                  priority === 'RED' ? 'bg-red-600' :
                  priority === 'ORANGE' ? 'bg-orange-600' :
                  priority === 'YELLOW' ? 'bg-amber-500' : 'bg-emerald-600'
                }`}>
                  {priority} PRIORITY
                </span>
                <span className="text-xs font-mono text-slate-500 font-semibold">
                  Target Wait: <strong>{triageResult.recommendedMaxWaitTime}</strong>
                </span>
              </div>
              <h3 className="text-2xl font-black tracking-tight mt-1">
                {triageResult.priorityTitle}
              </h3>
              <p className="text-xs opacity-90 max-w-2xl leading-relaxed mt-0.5">
                {triageResult.priorityDescription}
              </p>
            </div>
          </div>

          <div className="text-right border-t md:border-t-0 md:border-l border-slate-300/60 pt-2 md:pt-0 md:pl-4">
            <div className="text-[10px] uppercase font-bold text-slate-500">Evaluated At</div>
            <div className="text-xs font-mono font-bold">{new Date(triageResult.assessedAt).toLocaleTimeString()}</div>
            <div className="text-[10px] text-slate-500 mt-1">Confidence Rating:</div>
            <div className="text-xs font-bold font-mono">{(triageResult.beliefConfidence * 100).toFixed(0)}% Certainty</div>
          </div>
        </div>

        {/* Explainable Clinical Rationale */}
        <div className="p-4 bg-white/80 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-sky-600" />
            Explainable Inference Rationale (Why this category was generated):
          </span>
          <p className="text-xs text-slate-800 leading-relaxed font-medium">
            {triageResult.clinicalRationale}
          </p>
        </div>
      </div>

      {/* PATIENT METADATA & VITALS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Patient Profile & History */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 text-xs">
          <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider">Patient Clinical Profile</h4>
            <span className="font-mono text-slate-400 font-bold">{patient.id}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-slate-700">
            <div><span className="text-slate-400">Name:</span> <strong className="text-slate-900">{patient.name}</strong></div>
            <div><span className="text-slate-400">Age / Sex:</span> <strong className="text-slate-900">{patient.age}y / {patient.gender}</strong></div>
            <div><span className="text-slate-400">Severity:</span> <strong className="uppercase text-slate-900">{patient.severity}</strong></div>
            <div><span className="text-slate-400">Intake Date:</span> <strong className="text-slate-900">{patient.assessmentDate} {patient.assessmentTime}</strong></div>
          </div>

          <div className="pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Active Reported Symptoms:
            </span>
            <div className="flex flex-wrap gap-1">
              {(patient.symptoms || []).map((s, i) => (
                <span key={i} className="bg-purple-100 text-purple-800 text-[11px] px-2.5 py-0.5 rounded font-semibold">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Medical History Comorbidities:
            </span>
            <div className="flex flex-wrap gap-1 text-[11px]">
              {patient.history.heartDisease && <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">Heart Disease</span>}
              {patient.history.diabetes && <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">Diabetes</span>}
              {patient.history.asthma && <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">Asthma</span>}
              {patient.history.hypertension && <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">Hypertension</span>}
              {patient.history.otherConditions && <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{patient.history.otherConditions}</span>}
              {!patient.history.heartDisease && !patient.history.diabetes && !patient.history.asthma && !patient.history.hypertension && !patient.history.otherConditions && (
                <span className="text-slate-400 italic">No significant pre-existing history reported</span>
              )}
            </div>
          </div>

          {patient.chiefComplaintNotes && (
            <div className="p-2.5 bg-slate-50 rounded-lg text-slate-600 text-[11px] italic">
              "{patient.chiefComplaintNotes}"
            </div>
          )}
        </div>

        {/* Vital Signs Analysis & Flags */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 text-xs">
          <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider">Physiological Vital Signs Analysis</h4>
            <span className="text-[10px] font-mono text-slate-400">Normative Check</span>
          </div>

          <div className="space-y-2">
            {triageResult.vitalFlags.map((flag, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono ${
                  flag.status === 'critical'
                    ? 'bg-red-50 border-red-200 text-red-900'
                    : flag.status === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50/50 border-emerald-100 text-emerald-900'
                }`}
              >
                <div>
                  <span className="font-bold font-sans">{flag.param}:</span>{' '}
                  <strong className="text-slate-950 font-mono">{flag.value}</strong>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className={`w-2 h-2 rounded-full ${
                    flag.status === 'critical' ? 'bg-red-600 animate-pulse' :
                    flag.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}></span>
                  <span className="font-sans font-semibold">{flag.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TRIGGERED INFERENCE RULES BREAKDOWN */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-600" />
              Triggered Knowledge Rules ({triageResult.triggeredRules.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Production system rules whose antecedents matched the extracted patient working memory facts.
            </p>
          </div>
          <button
            onClick={() => onNavigate('inference-engine')}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            <span>View Full Execution Trace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {triageResult.triggeredRules.length === 0 ? (
          <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
            No specific production rules triggered. Baseline deduction applied based on normal physiological parameters.
          </div>
        ) : (
          <div className="space-y-3">
            {triageResult.triggeredRules.map(rule => (
              <div key={rule.ruleId} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {rule.ruleId}
                    </span>
                    <span className="font-bold text-slate-900">{rule.ruleName}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${
                    rule.priorityAssigned === 'RED' ? 'bg-red-600' :
                    rule.priorityAssigned === 'ORANGE' ? 'bg-orange-500' :
                    rule.priorityAssigned === 'YELLOW' ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}>
                    Assigned: {rule.priorityAssigned}
                  </span>
                </div>

                <p className="text-slate-600 leading-relaxed font-sans">
                  {rule.rationale}
                </p>

                <div className="p-2 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700">
                  <span className="text-slate-400 font-sans font-bold">Matched Antecedents:</span>{' '}
                  {rule.matchedConditions.join(' AND ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CLINICAL DIRECTIVES & PROTOCOLS */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-3">
        <h3 className="font-bold text-sm uppercase tracking-wider text-sky-400 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          Recommended Clinical Pathway & Directives
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
          {triageResult.actionRecommendations.map((act, idx) => (
            <div key={idx} className="flex items-start gap-2 p-2.5 bg-slate-800/80 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0"></span>
              <span>{act}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
