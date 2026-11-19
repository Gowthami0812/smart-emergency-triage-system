import React, { useState } from 'react';
import { ViewKey } from '../components/Sidebar';
import { AbductiveReasoningEngine } from '../engine/abductiveEngine';
import { BayesianEngine, PRESET_BAYESIAN_CASES } from '../engine/bayesianEngine';
import { DempsterShaferEngine, MassFunction } from '../engine/dempsterShafer';
import { FuzzyLogicEngine } from '../engine/fuzzyLogic';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import {
  BrainCircuit,
  Sliders,
  Scale,
  Activity,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  TrendingUp,
  UserCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface UncertaintyLabProps {
  onNavigate: (view: ViewKey) => void;
}

export const UncertaintyLab: React.FC<UncertaintyLabProps> = ({ onNavigate }) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'abductive' | 'bayesian' | 'dempster' | 'fuzzy' | 'agent' | 'mixed'
  >('abductive');

  // --- Abductive Simulator State ---
  const [abductiveSymptoms, setAbductiveSymptoms] = useState<string[]>([
    'Chest pain',
    'Difficulty breathing'
  ]);
  const [abductiveSeverity, setAbductiveSeverity] = useState<string>('severe');

  const abductiveResults = AbductiveReasoningEngine.inferExplanations(
    abductiveSymptoms,
    abductiveSeverity
  );

  // --- Bayesian Simulator State ---
  const [selectedBayesCase, setSelectedBayesCase] = useState(PRESET_BAYESIAN_CASES[0]);
  const [prior, setPrior] = useState<number>(selectedBayesCase.prior);
  const [sensitivity, setSensitivity] = useState<number>(selectedBayesCase.sensitivity);
  const [fpr, setFpr] = useState<number>(selectedBayesCase.falsePositiveRate);

  const bayesCalc = BayesianEngine.calculatePosterior(prior, sensitivity, fpr);

  // --- Dempster-Shafer Simulator State ---
  const [dsSource1Red, setDsSource1Red] = useState<number>(0.6);
  const [dsSource1Theta, setDsSource1Theta] = useState<number>(0.4);
  const [dsSource2Red, setDsSource2Red] = useState<number>(0.5);
  const [dsSource2Orange, setDsSource2Orange] = useState<number>(0.2);
  const [dsSource2Theta, setDsSource2Theta] = useState<number>(0.3);

  const m1: MassFunction = {
    sourceName: 'ECG Telemetry Evidence',
    assignments: [
      { set: ['RED'], mass: dsSource1Red, description: 'Direct ischemic ST-elevation' },
      { set: ['RED', 'ORANGE', 'YELLOW', 'GREEN'], mass: dsSource1Theta, description: 'Frame of Discernment Theta (Unassigned)' }
    ]
  };

  const m2: MassFunction = {
    sourceName: 'Troponin Point-of-Care Assay',
    assignments: [
      { set: ['RED'], mass: dsSource2Red, description: 'Markedly elevated biomarker' },
      { set: ['ORANGE'], mass: dsSource2Orange, description: 'Mild baseline rise' },
      { set: ['RED', 'ORANGE', 'YELLOW', 'GREEN'], mass: dsSource2Theta, description: 'Uncertainty mass' }
    ]
  };

  const dsCombined = DempsterShaferEngine.combine(m1, m2);
  const dsBelPl = DempsterShaferEngine.calculateBeliefPlausibility(['RED'], dsCombined.combinedAssignments);

  // --- Fuzzy Logic Simulator State ---
  const [fuzzySpO2, setFuzzySpO2] = useState<number>(91);
  const [fuzzyHR, setFuzzyHR] = useState<number>(115);
  const [fuzzyTemp, setFuzzyTemp] = useState<number>(38.4);

  const fuzzyEval = FuzzyLogicEngine.evaluateFuzzyUrgency(fuzzySpO2, fuzzyHR, fuzzyTemp);
  const fuzzyVars = FuzzyLogicEngine.getStandardFuzzyVariables({
    spo2: fuzzySpO2,
    heartRate: fuzzyHR,
    temperature: fuzzyTemp
  });

  // --- Mixed-Initiative State ---
  const [clinicianOverridePriority, setClinicianOverridePriority] = useState<string>('ORANGE');
  const [overrideReason, setOverrideReason] = useState<string>(
    'Patient has atypical diaphoresis and family history of sudden cardiac arrest despite normal initial SpO2.'
  );
  const [overrideSubmitted, setOverrideSubmitted] = useState<boolean>(false);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <DisclaimerBanner compact />

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
            <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
              UNIT 1 & 2 • Reasoning Under Uncertainty & Agent Modeling
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-amber-600" />
            Uncertainty Reasoning & Intelligent Agent Laboratory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive demonstrations of non-monotonic, probabilistic, evidential, and fuzzy reasoning paradigms.
          </p>
        </div>
      </div>

      {/* Interactive Sub-Module Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        {[
          { id: 'abductive', label: 'A. Abductive Reasoning' },
          { id: 'bayesian', label: 'B & C. Bayesian & Probabilistic' },
          { id: 'dempster', label: 'D. Belief Functions (Dempster-Shafer)' },
          { id: 'fuzzy', label: 'E. Fuzzy Logic & Linguistics' },
          { id: 'agent', label: 'G. Intelligent Agent (PEAS)' },
          { id: 'mixed', label: 'H. Mixed-Initiative Reasoning' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-lg transition-all ${
              activeSubTab === tab.id
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- SUBMODULE A: ABDUCTIVE REASONING --- */}
      {activeSubTab === 'abductive' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Inference to the Best Explanation (Peirce's Abduction)
              </h3>
              <span className="text-[10px] font-mono bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold">
                $Manifestation \rightarrow Etiology$
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Given observed clinical manifestations $M$, abductive reasoning infers the hypothesis $H$ that best explains $M$. Unlike deduction, abduction is defeasible and generates plausible candidate diagnoses ranked by coverage and prior likelihood.
            </p>

            {/* Interactive Symptom Selector */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Toggle Observed Patient Manifestations:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Chest pain',
                  'Difficulty breathing',
                  'Fever',
                  'Headache',
                  'Vomiting',
                  'Abdominal pain',
                  'Dizziness',
                  'Weakness'
                ].map(sym => {
                  const isChecked = abductiveSymptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      onClick={() => {
                        setAbductiveSymptoms(prev =>
                          isChecked ? prev.filter(s => s !== sym) : [...prev, sym]
                        );
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isChecked
                          ? 'bg-amber-600 text-white shadow-xs'
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

          {/* Abductive Ranked Hypotheses */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {abductiveResults.map((hypo, idx) => (
              <div
                key={hypo.id}
                className={`bg-white rounded-xl p-5 border shadow-sm space-y-3 ${
                  idx === 0 ? 'border-amber-400 ring-1 ring-amber-400 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    Rank #{idx + 1} • {hypo.category}
                  </span>
                  <span className="text-xs font-bold font-mono text-amber-700">
                    Plausibility: {(hypo.plausibilityScore * 100).toFixed(0)}%
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900">{hypo.conditionName}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {hypo.clinicalRationale}
                  </p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Explanatory Coverage:</span>
                    <strong className="text-slate-800">{(hypo.explanatoryPower * 100).toFixed(0)}% of symptoms</strong>
                  </div>
                  <div className="text-[11px] text-emerald-700">
                    &bull; Explains: {hypo.explainedSymptoms.join(', ') || 'None'}
                  </div>
                  {hypo.unexplainedSymptoms.length > 0 && (
                    <div className="text-[11px] text-slate-400">
                      &bull; Leaves unexplained: {hypo.unexplainedSymptoms.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SUBMODULE B & C: BAYESIAN REASONING --- */}
      {activeSubTab === 'bayesian' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Bayes' Theorem: Prior to Posterior Clinical Updating
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  P(H|E) = [P(E|H) &times; P(H)] / [P(E|H)&times;P(H) + P(E|~H)&times;P(~H)]
                </p>
              </div>

              {/* Case Preset Selector */}
              <select
                value={selectedBayesCase.id}
                onChange={e => {
                  const c = PRESET_BAYESIAN_CASES.find(cs => cs.id === e.target.value)!;
                  setSelectedBayesCase(c);
                  setPrior(c.prior);
                  setSensitivity(c.sensitivity);
                  setFpr(c.falsePositiveRate);
                }}
                className="bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-800 cursor-pointer"
              >
                {PRESET_BAYESIAN_CASES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedBayesCase.description}
            </p>

            {/* Sliders for Prior, Sensitivity, and FPR */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Prior Prevalence $P(H)$</span>
                  <span className="font-mono font-bold text-sky-600">{(prior * 100).toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.80"
                  step="0.01"
                  value={prior}
                  onChange={e => setPrior(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">Baseline probability of disease in presenting population</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Sensitivity $P(E|H)$</span>
                  <span className="font-mono font-bold text-emerald-600">{(sensitivity * 100).toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0.40"
                  max="0.99"
                  step="0.01"
                  value={sensitivity}
                  onChange={e => setSensitivity(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">True Positive rate of diagnostic test / evidence finding</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">False Positive Rate $P(E|\neg H)$</span>
                  <span className="font-mono font-bold text-rose-600">{(fpr * 100).toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.60"
                  step="0.01"
                  value={fpr}
                  onChange={e => setFpr(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">1 - Specificity (false positive findings in healthy cohort)</p>
              </div>
            </div>

            {/* Bayesian Computed Output Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-center space-y-1">
                <span className="text-[11px] font-bold text-sky-800 uppercase">Prior Probability P(H)</span>
                <div className="text-3xl font-black text-sky-900">{(prior * 100).toFixed(1)}%</div>
                <span className="text-[10px] text-sky-700">Before test observation</span>
              </div>

              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-center space-y-1">
                <span className="text-[11px] font-bold text-emerald-800 uppercase">Posterior P(H | Positive Evidence)</span>
                <div className="text-3xl font-black text-emerald-700">
                  {(bayesCalc.posteriorGivenPositive * 100).toFixed(1)}%
                </div>
                <span className="text-[10px] text-emerald-800 font-semibold">
                  Updated probability given positive finding
                </span>
              </div>

              <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-center space-y-1">
                <span className="text-[11px] font-bold text-slate-700 uppercase">Likelihood Ratio (LR+)</span>
                <div className="text-3xl font-black text-slate-800">{bayesCalc.likelihoodRatioPositive}x</div>
                <span className="text-[10px] text-slate-500">Diagnostic odds multiplier</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBMODULE D: DEMPSTER-SHAFER BELIEF FUNCTIONS --- */}
      {activeSubTab === 'dempster' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-600" />
                Dempster-Shafer Theory of Evidence & Belief Functions
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Explicit modeling of ignorance through mass functions $m(A)$, Belief $Bel(A)$, and Plausibility $Pl(A)$ intervals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Evidence Source 1 */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3 text-xs">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Source 1: ECG Telemetry</span>
                  <span className="font-mono text-amber-700 text-[10px]">Mass Sum = 1.0</span>
                </div>
                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Mass for RED: m_1({'{RED}'})</span>
                    <strong className="font-mono">{dsSource1Red.toFixed(2)}</strong>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={dsSource1Red}
                    onChange={e => {
                      const v = Number(e.target.value);
                      setDsSource1Red(v);
                      setDsSource1Theta(Number((1 - v).toFixed(2)));
                    }}
                    className="w-full accent-amber-600"
                  />
                </div>
                <div className="text-[11px] text-slate-500">
                  Uncommitted ignorance mass $m_1(\Theta) = {dsSource1Theta.toFixed(2)}$
                </div>
              </div>

              {/* Evidence Source 2 */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3 text-xs">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Source 2: Troponin Biomarker Assay</span>
                  <span className="font-mono text-amber-700 text-[10px]">Mass Sum = 1.0</span>
                </div>
                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Mass for RED: m_2({'{RED}'})</span>
                    <strong className="font-mono">{dsSource2Red.toFixed(2)}</strong>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.05"
                    value={dsSource2Red}
                    onChange={e => {
                      const v = Number(e.target.value);
                      setDsSource2Red(v);
                      setDsSource2Theta(Number(Math.max(0.05, 1 - v - dsSource2Orange).toFixed(2)));
                    }}
                    className="w-full accent-amber-600"
                  />
                </div>
                <div className="text-[11px] text-slate-500">
                  Mass for ORANGE: {dsSource2Orange.toFixed(2)} • Ignorance $m_2(\Theta) = {dsSource2Theta.toFixed(2)}$
                </div>
              </div>
            </div>

            {/* Dempster Rule Combination Output */}
            <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                  Dempster's Combination Result for Focal Set {'{RED}'}:
                </span>
                <span className="text-xs font-mono font-bold text-amber-800">
                  Conflict Coefficient k = {dsCombined.conflict}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Belief Bel({'{RED}'})</span>
                  <div className="text-2xl font-black text-amber-900">{dsBelPl.belief}</div>
                  <span className="text-[10px] text-slate-400">Strict lower bound of certainty</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Plausibility Pl({'{RED}'})</span>
                  <div className="text-2xl font-black text-amber-900">{dsBelPl.plausibility}</div>
                  <span className="text-[10px] text-slate-400">Upper bound of non-refuted mass</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Uncertainty Gap</span>
                  <div className="text-2xl font-black text-sky-700">[{dsBelPl.belief}, {dsBelPl.plausibility}]</div>
                  <span className="text-[10px] text-slate-400">Interval width = {dsBelPl.uncertainty}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBMODULE E: FUZZY LOGIC & LINGUISTICS --- */}
      {activeSubTab === 'fuzzy' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-600" />
                Fuzzy Logic: Physiological Membership Curves & Defuzzification
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Replaces sharp boolean cutoffs with continuous degrees of truth $\mu \in [0, 1]$ across linguistic partitions (Hypoxia, Tachycardia, Pyrexia).
              </p>
            </div>

            {/* Interactive Vital Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Oxygen Saturation (SpO2)</span>
                  <span className="font-mono font-bold text-rose-600">{fuzzySpO2}%</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="100"
                  step="1"
                  value={fuzzySpO2}
                  onChange={e => setFuzzySpO2(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Heart Rate</span>
                  <span className="font-mono font-bold text-amber-600">{fuzzyHR} bpm</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="160"
                  step="1"
                  value={fuzzyHR}
                  onChange={e => setFuzzyHR(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Body Temperature</span>
                  <span className="font-mono font-bold text-orange-600">{fuzzyTemp} °C</span>
                </div>
                <input
                  type="range"
                  min="35.0"
                  max="41.0"
                  step="0.1"
                  value={fuzzyTemp}
                  onChange={e => setFuzzyTemp(Number(e.target.value))}
                  className="w-full accent-orange-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Computed Memberships for Each Variable */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {fuzzyVars.map((v, i) => (
                <div key={i} className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                  <span className="text-xs font-bold text-slate-800">{v.name}</span>
                  <div className="space-y-1.5">
                    {v.sets.map((set, sIdx) => {
                      const mu = FuzzyLogicEngine.getMembership(v.currentValue, set);
                      return (
                        <div key={sIdx} className="space-y-0.5 text-xs">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-600">{set.name}</span>
                            <span className="font-mono font-bold" style={{ color: set.color }}>
                              &mu; = {mu.toFixed(2)}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{ width: `${mu * 100}%`, backgroundColor: set.color }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Defuzzification Output */}
            <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider">
                  Mamdani Fuzzy Inference Output (Defuzzified Centroid)
                </span>
                <div className="text-xl font-bold mt-0.5">
                  Composite Urgency Index: {fuzzyEval.urgencyIndex} / 100 ({fuzzyEval.linguisticResult} Category)
                </div>
              </div>
              <div className="text-right text-xs text-slate-300 font-mono">
                {fuzzyEval.activeRules[0]}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBMODULE G: INTELLIGENT AGENT ARCHITECTURE (PEAS) --- */}
      {activeSubTab === 'agent' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-sky-600" />
                Intelligent Agent Design: PEAS & Perception-Action Cycle
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Models the triage software as an autonomous knowledge agent operating under uncertainty.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-xs space-y-2">
                <span className="font-bold text-sky-950 uppercase tracking-wide">P - Performance Measure</span>
                <ul className="list-disc pl-4 text-sky-900 space-y-1 text-[11px]">
                  <li>Triage decision accuracy vs clinical gold standard.</li>
                  <li>Time to critical intervention (under-triage minimization).</li>
                  <li>Explainability & rule transparency score.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
                <span className="font-bold text-emerald-950 uppercase tracking-wide">E - Environment</span>
                <ul className="list-disc pl-4 text-emerald-900 space-y-1 text-[11px]">
                  <li>Emergency department waiting queue.</li>
                  <li>Partially observable patient physiological states.</li>
                  <li>Dynamic, stochastic incoming caseload.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs space-y-2">
                <span className="font-bold text-purple-950 uppercase tracking-wide">A - Actuators</span>
                <ul className="list-disc pl-4 text-purple-900 space-y-1 text-[11px]">
                  <li>Priority recommendations (RED/ORANGE/YELLOW/GREEN).</li>
                  <li>Critical clinical warning banners & audio cues.</li>
                  <li>Bedside allocation directives & target wait times.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-2">
                <span className="font-bold text-amber-950 uppercase tracking-wide">S - Sensors</span>
                <ul className="list-disc pl-4 text-amber-900 space-y-1 text-[11px]">
                  <li>Pulse oximeters (SpO2).</li>
                  <li>Sphygmomanometer (BP).</li>
                  <li>Digital clinical assessment input forms.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBMODULE H: MIXED-INITIATIVE REASONING --- */}
      {activeSubTab === 'mixed' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                Mixed-Initiative Reasoning: Human-Agent Collaboration
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Demonstrates how clinical experts and AI knowledge agents collaborate, resolve ambiguity, and log rationale when clinicians override automated recommendations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">System Recommendation</span>
                  <span className="font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    YELLOW (Prompt)
                  </span>
                </div>
                <div className="text-slate-600 space-y-1">
                  <p><strong>Computed Confidence:</strong> 72%</p>
                  <p><strong>Primary Rule Triggered:</strong> RULE-11: Tachycardic Dehydration</p>
                  <p><strong>Automated Max Wait Target:</strong> 60 minutes</p>
                </div>
              </div>

              <div className="p-5 bg-indigo-50/60 rounded-xl border border-indigo-200 space-y-3 text-xs">
                <span className="font-bold text-indigo-950 block">Clinician Override Interface:</span>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Adjust Priority Category:</label>
                  <select
                    value={clinicianOverridePriority}
                    onChange={e => setClinicianOverridePriority(e.target.value)}
                    className="w-full bg-white border border-indigo-300 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="RED">RED - Immediate Assessment (Escalate)</option>
                    <option value="ORANGE">ORANGE - Urgent Assessment (Escalate)</option>
                    <option value="YELLOW">YELLOW - Prompt Assessment (Accept)</option>
                    <option value="GREEN">GREEN - Lower Urgency (De-escalate)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Mandatory Clinical Rationale:</label>
                  <textarea
                    rows={2}
                    value={overrideReason}
                    onChange={e => setOverrideReason(e.target.value)}
                    className="w-full bg-white border border-indigo-300 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <button
                  onClick={() => setOverrideSubmitted(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all"
                >
                  Log Mixed-Initiative Decision
                </button>
              </div>
            </div>

            {overrideSubmitted && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Clinician override to <strong>{clinicianOverridePriority}</strong> registered in audit ledger with clinical note: <em>"{overrideReason}"</em>.
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                  LOGGED
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
