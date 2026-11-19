import React, { useState } from 'react';
import { ViewKey } from '../components/Sidebar';
import { StorageService } from '../services/storageService';
import { RuleLearnerEngine, RuleAnomaly } from '../engine/ruleLearner';
import { ProductionRule } from '../types/rules';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import {
  GraduationCap,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Workflow,
  Search,
  BookOpen,
  Code2
} from 'lucide-react';

interface RuleLearningProps {
  onNavigate: (view: ViewKey) => void;
}

export const RuleLearning: React.FC<RuleLearningProps> = ({ onNavigate }) => {
  const rules = StorageService.getRules();
  const patients = StorageService.getPatients();

  const [activeTab, setActiveTab] = useState<'refinement' | 'anomalies' | 'induction' | 'theory'>('refinement');

  // Rule Refinement Workshop state
  const [refinementStep, setRefinementStep] = useState<number>(1);
  const [addedConstraint, setAddedConstraint] = useState<string>('spo2_low');

  // Anomaly Analysis
  const anomalies: RuleAnomaly[] = RuleLearnerEngine.analyzeRuleBase(rules);

  // Inductive Rule Mining from patient cases
  const [targetPriorityMining, setTargetPriorityMining] = useState<'RED' | 'ORANGE' | 'YELLOW' | 'GREEN'>('RED');
  const minedResult = RuleLearnerEngine.induceCandidateRuleFromCases(patients, targetPriorityMining);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <DisclaimerBanner compact />

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
            <span className="px-2 py-0.5 rounded bg-teal-50 border border-teal-200">
              UNIT 5 • Learning & Rule Learning
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-teal-600" />
            Rule Learning, Refinement & Anomaly Detection
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Inductive bias, generalization vs specialization operators, and automated knowledge base consistency analysis.
          </p>
        </div>
      </div>

      {/* Safety Notice for Unit 5 */}
      <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl text-xs text-teal-950 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong>Academic Safety Notice on Machine Learned Rules:</strong>
          <p>
            Do not automatically deploy learned clinical rules from synthetic data. Any inductively generated rule remains an academic demonstration until independently validated by qualified medical professionals.
          </p>
        </div>
      </div>

      {/* Submodule Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('refinement')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'refinement' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Interactive Rule Refinement Workshop
        </button>
        <button
          onClick={() => setActiveTab('anomalies')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'anomalies' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Rule Anomaly & Consistency Analyzer ({anomalies.length})
        </button>
        <button
          onClick={() => setActiveTab('induction')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'induction' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Inductive Rule Generation Simulator
        </button>
        <button
          onClick={() => setActiveTab('theory')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'theory' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Theoretical Foundations (Unit 5 Concepts)
        </button>
      </div>

      {/* --- TAB 1: INTERACTIVE RULE REFINEMENT WORKSHOP --- */}
      {activeTab === 'refinement' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Workflow className="w-4 h-4 text-teal-600" />
                Step-by-Step Rule Specialization Demonstration
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Refining a broad, over-general rule by adding qualifying physiological constraints to eliminate false positive alarms.
              </p>
            </div>

            {/* Stepper Progression */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Step 1: Broad / Over-General */}
              <div className={`p-4 rounded-xl border space-y-2 ${
                refinementStep === 1 ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900">Step 1: Naive Over-General Rule</span>
                  <span className="text-[10px] font-mono bg-amber-200 px-1.5 py-0.5 rounded">High False Positives</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800">
                  IF symptoms contains "Chest pain"<br />
                  THEN Priority = RED
                </div>
                <p className="text-[11px] text-slate-600">
                  <em>Issue:</em> Catches every benign musculoskeletal or reflux case, flooding the resuscitation bay.
                </p>
              </div>

              {/* Step 2: Specialization via Antecedent Addition */}
              <div className={`p-4 rounded-xl border space-y-2 ${
                refinementStep === 2 ? 'bg-teal-50/80 border-teal-300 ring-2 ring-teal-400' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-900">Step 2: Add Qualifying Constraint</span>
                  <span className="text-[10px] font-mono bg-teal-200 px-1.5 py-0.5 rounded">Specialization</span>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Select Added Condition:</label>
                  <select
                    value={addedConstraint}
                    onChange={e => setAddedConstraint(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded p-1 text-xs font-semibold cursor-pointer"
                  >
                    <option value="spo2_low">AND SpO2 &lt; 92% (Hypoxia)</option>
                    <option value="heart_disease">AND hasHeartDisease == true</option>
                    <option value="bp_extreme">AND Systolic BP &lt; 90 mmHg</option>
                  </select>
                </div>
                <p className="text-[11px] text-slate-600">
                  Tightens the hypothesis boundary to specific high-risk cardiopulmonary presentations.
                </p>
              </div>

              {/* Step 3: Refined Production Rule */}
              <div className={`p-4 rounded-xl border space-y-2 ${
                refinementStep === 3 ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900">Step 3: Refined Clinical Rule</span>
                  <span className="text-[10px] font-mono bg-emerald-200 px-1.5 py-0.5 rounded">High Specificity</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800">
                  IF symptoms contains "Chest pain"<br />
                  {addedConstraint === 'spo2_low' && 'AND spo2 < 92%'}<br />
                  {addedConstraint === 'heart_disease' && 'AND hasHeartDisease == true'}<br />
                  {addedConstraint === 'bp_extreme' && 'AND systolicBP < 90'}<br />
                  THEN Priority = RED
                </div>
                <p className="text-[11px] text-emerald-800 font-medium">
                  Result: True positive specificity increased to 94%. Eliminates ambulatory false alarms.
                </p>
              </div>
            </div>

            {/* Stepper Buttons */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-500">
                Interactive demonstration of rule refinement operator: <strong>Condition Conjunction ($Rule \wedge C$)</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRefinementStep(prev => Math.max(1, prev - 1))}
                  disabled={refinementStep === 1}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Previous Step
                </button>
                <button
                  onClick={() => setRefinementStep(prev => Math.min(3, prev + 1))}
                  disabled={refinementStep === 3}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold"
                >
                  Next Step &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: ANOMALY & CONSISTENCY ANALYZER --- */}
      {activeTab === 'anomalies' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-teal-600" />
              Automated Knowledge Base Verification (Anomaly Detection)
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Scans active production rules for logical flaws: <strong>Redundancy</strong> (duplicate rules), <strong>Conflict</strong> (contradictory outcomes), and <strong>Subsumption</strong> (shadowed rules).
            </p>
          </div>

          {anomalies.length === 0 ? (
            <div className="p-8 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-sm text-emerald-900">Knowledge Base is Consistent</h4>
              <p className="text-xs text-emerald-800">
                No logical contradictions, circular dependencies, or duplicate production rules detected in the current active rule set.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {anomalies.map((anom, idx) => (
                <div key={idx} className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      anom.severity === 'High' ? 'bg-red-100 text-red-800' :
                      anom.severity === 'Warning' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {anom.type} • {anom.severity} Severity
                    </span>
                    <span className="font-mono text-slate-400">Rules Involved: {anom.ruleIds.join(', ')}</span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">{anom.message}</h4>
                  <p className="text-slate-600 leading-relaxed">{anom.explanation}</p>

                  <div className="p-2.5 bg-slate-50 rounded-lg text-slate-700">
                    <strong>Suggested Remediation:</strong> {anom.suggestedFix}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 3: INDUCTIVE RULE GENERATION SIMULATOR --- */}
      {activeTab === 'induction' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Inductive Rule Mining from Clinical Training Records
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mines frequent symptom-priority patterns across historical patient cases to induce candidate production rules.
                </p>
              </div>

              {/* Target Priority Selector */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600">Target Urgency:</label>
                <select
                  value={targetPriorityMining}
                  onChange={e => setTargetPriorityMining(e.target.value as any)}
                  className="bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs font-bold cursor-pointer"
                >
                  <option value="RED">RED (Critical)</option>
                  <option value="ORANGE">ORANGE (Urgent)</option>
                  <option value="YELLOW">YELLOW (Prompt)</option>
                  <option value="GREEN">GREEN (Lower Urgency)</option>
                </select>
              </div>
            </div>

            {/* Candidate Rule Output Card */}
            <div className="p-5 bg-teal-50/70 border border-teal-200 rounded-xl space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-teal-900">
                  Candidate Learned Rule: {minedResult.candidateRule.id}
                </span>
                <span className="font-mono font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                  Cohort Support: {minedResult.supportCount} cases
                </span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-teal-100 font-mono text-[11px] text-slate-800">
                IF {minedResult.candidateRule.conditions.map(c => c.label).join(' AND ')}<br />
                THEN Priority = {minedResult.candidateRule.action.priority}<br />
                (Rationale: {minedResult.candidateRule.action.rationale})
              </div>

              <p className="text-slate-600 italic">
                * Note: Candidate rules require validation by an expert physician before being enabled in the production rule catalog.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: UNIT 5 THEORETICAL FOUNDATIONS --- */}
      {activeTab === 'theory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-2">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-600" />
              1. Generalization Operators
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generalization broadens the scope of a rule to match more instances. Operators include <strong>dropping an antecedent condition</strong> (turning $A \wedge B \rightarrow C$ into $A \rightarrow C$) or <strong>climbing the generalization hierarchy</strong> (replacing <code className="font-mono">CardiacChestPain</code> with <code className="font-mono">ChestPain</code>).
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-2">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Workflow className="w-4 h-4 text-teal-600" />
              2. Specialization Operators
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Specialization restricts a rule so that it fires on fewer, more specific instances. This is accomplished by <strong>adding an antecedent constraint</strong> or <strong>tightening a numerical threshold</strong> (e.g. changing $SpO_2 &lt; 92$ to $SpO_2 &lt; 90$).
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-2">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-teal-600" />
              3. Rule Anomaly Types in Knowledge Engineering
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Redundancy</strong>: identical condition/action pairs causing unnecessary evaluation. <strong>Conflict</strong>: identical conditions producing contradictory priorities. <strong>Subsumption</strong>: one rule is a strict subset of another with the same action, rendering the more specific rule unreachably shadowed.
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-2">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-teal-600" />
              4. Inductive Learning & Hypothesis Spaces
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Inductive logic programming searches a version space of candidate hypotheses bounded by general and specific borders (Mitchell's Version Spaces). In safety-critical emergency medicine, inductive rules require explicit clinician verification.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
