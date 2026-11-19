import React from 'react';
import { ViewKey } from '../components/Sidebar';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import {
  BookOpen,
  CheckCircle2,
  Cpu,
  GitBranch,
  BrainCircuit,
  Scale,
  GraduationCap,
  ShieldAlert,
  Code2,
  FileCode,
  Terminal,
  Layers,
  HeartPulse
} from 'lucide-react';

interface AboutProjectProps {
  onNavigate: (view: ViewKey) => void;
}

export const AboutProject: React.FC<AboutProjectProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <DisclaimerBanner />

      {/* Hero Card */}
      <div className="bg-gradient-to-br from-slate-900 to-sky-950 text-white rounded-2xl p-8 border border-slate-800 shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-semibold">
          <GraduationCap className="w-4 h-4 text-sky-400" />
          <span>B.Tech Information Technology • Coursework Demonstration</span>
        </div>

        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
          22ITE61 – KNOWLEDGE ENGINEERING
        </h1>
        <p className="text-sm md:text-base text-slate-300 max-w-3xl leading-relaxed">
          Smart Emergency Triage System: An Intelligent Knowledge-Based System for Emergency Patient Prioritization. Designed and developed to demonstrate theoretical and applied principles across all five units of the 22ITE61 syllabus.
        </p>

        <div className="flex flex-wrap gap-4 pt-2 text-xs font-mono text-slate-400">
          <div>Degree: <strong className="text-white">B.Tech IT</strong></div>
          <div>Subject Code: <strong className="text-sky-400">22ITE61</strong></div>
          <div>Domain: <strong className="text-emerald-400">Knowledge-Based Systems (KBS)</strong></div>
          <div>Architecture: <strong className="text-amber-400">Forward-Chaining ALC(D) + Bayes</strong></div>
        </div>
      </div>

      {/* SYLLABUS INTEGRATION MATRIX (All 5 Units) */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Comprehensive 22ITE61 Syllabus Integration Matrix
        </h2>

        <div className="space-y-4">
          {/* UNIT 1 */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                  U1
                </span>
                <h3 className="font-bold text-sm text-slate-900">
                  UNIT 1 – Reasoning Under Uncertainty
                </h3>
              </div>
              <button
                onClick={() => onNavigate('uncertainty-lab')}
                className="text-xs font-bold text-amber-600 hover:text-amber-700"
              >
                Open Module &rarr;
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Demonstrated Concepts:</strong> Probabilistic reasoning, Bayesian reasoning with sensitivity/specificity updating ($P(H|E)$), Dempster-Shafer belief functions (mass functions, conflict factor $k$, belief & plausibility intervals), fuzzy logic reasoning with continuous triangular/trapezoidal membership curves and defuzzification, evidence-based reasoning ledgers, PEAS intelligent agent model, and mixed-initiative clinician override.
            </p>
          </div>

          {/* UNIT 2 */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-xs">
                  U2
                </span>
                <h3 className="font-bold text-sm text-slate-900">
                  UNIT 2 – Methodology and Modeling
                </h3>
              </div>
              <button
                onClick={() => onNavigate('what-if')}
                className="text-xs font-bold text-sky-600 hover:text-sky-700"
              >
                Open Module &rarr;
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Demonstrated Concepts:</strong> Agent design, clinical problem analysis, inquiry-driven assessment, evidence-based believability assessment, drill-down differential analysis, assumption-based reasoning, and interactive What-If sensitivity modeling with real-time rule recalculation.
            </p>
          </div>

          {/* UNIT 3 */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-xs">
                  U3
                </span>
                <h3 className="font-bold text-sm text-slate-900">
                  UNIT 3 – Ontologies: Design and Development
                </h3>
              </div>
              <button
                onClick={() => onNavigate('ontology-visualizer')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                Open Module &rarr;
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Demonstrated Concepts:</strong> Concepts and instances, generalization taxonomies (<code className="font-mono text-indigo-600">is_a</code> subsumption), defining features vs object features (semantic roles), formal representation, transitivity of inheritance hierarchies, concepts as feature values, and cross-ontology matching with SNOMED-CT, LOINC, and ICD-10.
            </p>
          </div>

          {/* UNIT 4 */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-xs">
                  U4
                </span>
                <h3 className="font-bold text-sm text-slate-900">
                  UNIT 4 – Reasoning with Ontologies and Rules
                </h3>
              </div>
              <button
                onClick={() => onNavigate('inference-engine')}
                className="text-xs font-bold text-rose-600 hover:text-rose-700"
              >
                Open Module &rarr;
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Demonstrated Concepts:</strong> Production system architecture, working memory element assertions, forward-chaining matching cycle, Reduction rules and Synthesis rules, conflict resolution prioritization, and reasoning with partially learned knowledge.
            </p>
          </div>

          {/* UNIT 5 */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                  U5
                </span>
                <h3 className="font-bold text-sm text-slate-900">
                  UNIT 5 – Learning and Rule Learning
                </h3>
              </div>
              <button
                onClick={() => onNavigate('rule-learning')}
                className="text-xs font-bold text-teal-600 hover:text-teal-700"
              >
                Open Module &rarr;
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Demonstrated Concepts:</strong> Machine learning and inductive rule concepts, Generalization operators (condition removal, threshold relaxation), Specialization operators (constraint addition, threshold tightening), automated knowledge anomaly detection (redundancy, conflict, subsumption), and hypothesis learning.
            </p>
          </div>
        </div>
      </div>

      {/* TECHNICAL STACK & ARCHITECTURAL HIGHLIGHTS */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-sky-600" />
          Technical Stack & Architectural Principles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <strong className="text-slate-800">Frontend Technology:</strong>
            <p className="text-slate-600">React 19 + TypeScript + Tailwind CSS v4 + Vite + Lucide Icons + Recharts.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <strong className="text-slate-800">Separation of Concerns:</strong>
            <p className="text-slate-600">Knowledge Representation, Production Rules, and UI are fully decoupled into dedicated engine modules.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <strong className="text-slate-800">Zero Random Values:</strong>
            <p className="text-slate-600">Every priority recommendation, condition trace, and fuzzy index is 100% deterministic and explainable.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
