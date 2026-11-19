import React from 'react';
import { ViewKey } from '../components/Sidebar';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import {
  Activity,
  ArrowRight,
  Brain,
  Cpu,
  GitBranch,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Layers,
  Sparkles,
  Database,
  Workflow,
  Stethoscope,
  HeartPulse,
  BookOpen
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: ViewKey) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-16">
      {/* Disclaimer */}
      <DisclaimerBanner />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 rounded-2xl p-8 md:p-12 text-white shadow-xl border border-slate-700/60">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>B.Tech IT • 22ITE61 Knowledge Engineering Project</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              SMART EMERGENCY <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-300">
                TRIAGE SYSTEM
              </span>
            </h1>

            <p className="text-base md:text-lg text-slate-300 font-normal leading-relaxed">
              "Intelligent Patient Prioritization Through Knowledge Representation and Inference"
            </p>

            <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-xl">
              An intelligent knowledge-based system modeling clinical emergency prioritization. Demonstrates forward-chaining production rules, multi-axial medical ontologies, probabilistic Bayesian inference, Dempster-Shafer belief functions, and inductive rule refinement.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('dashboard')}
                className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-lg shadow-sky-900/50 hover:shadow-sky-800/60 transition-all group"
              >
                <span>Launch Clinical Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('assessment')}
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-600/80 font-medium text-sm px-5 py-3 rounded-xl transition-all"
              >
                <Stethoscope className="w-4 h-4 text-sky-400" />
                <span>New Patient Assessment</span>
              </button>

              <button
                onClick={() => onNavigate('about')}
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-xs font-medium px-3 py-2 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>View Syllabus Mapping</span>
              </button>
            </div>
          </div>

          {/* Interactive Hero Graphic */}
          <div className="lg:col-span-5">
            <div className="bg-slate-950/70 border border-slate-700/80 rounded-2xl p-5 shadow-2xl backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-rose-500 animate-pulse" />
                  Live Triage Pipeline
                </span>
                <span className="text-[10px] font-mono bg-sky-950 text-sky-400 px-2 py-0.5 rounded border border-sky-800">
                  READY
                </span>
              </div>

              {/* Triage Tier Indicators */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-800/60 text-red-200">
                  <div className="font-bold flex items-center gap-1.5 text-red-400">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    RED: Immediate
                  </div>
                  <p className="text-[10px] text-red-300/80 mt-0.5">Resuscitation • 0 min</p>
                </div>

                <div className="p-2.5 rounded-lg bg-orange-950/50 border border-orange-800/60 text-orange-200">
                  <div className="font-bold text-orange-400">ORANGE: Urgent</div>
                  <p className="text-[10px] text-orange-300/80 mt-0.5">Emergent • &le; 15 mins</p>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-950/50 border border-amber-800/60 text-amber-200">
                  <div className="font-bold text-amber-400">YELLOW: Prompt</div>
                  <p className="text-[10px] text-amber-300/80 mt-0.5">Subacute • &le; 60 mins</p>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-emerald-200">
                  <div className="font-bold text-emerald-400">GREEN: Lower Urgency</div>
                  <p className="text-[10px] text-emerald-300/80 mt-0.5">Ambulatory • &le; 120 mins</p>
                </div>
              </div>

              {/* Simulation Architecture Mini Flow */}
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5 font-mono">
                <div className="flex items-center justify-between">
                  <span>Knowledge Base:</span>
                  <span className="text-sky-300">16 Rules • 5 Ontologies</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Inference Paradigm:</span>
                  <span className="text-teal-300">Forward-Chaining ALC(D)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Uncertainty Model:</span>
                  <span className="text-amber-300">Bayes + Dempster-Shafer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement & Objectives Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Problem Statement</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            "An emergency department needs to prioritize patients based on symptoms, vital signs, medical history, and severity. How can knowledge representation and inference support this decision-making process?"
          </p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 space-y-1">
            <strong>Clinical Bottlenecks Addressed:</strong>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>High-volume emergency overcrowding leading to triage delays.</li>
              <li>Cognitive overload and inter-evaluator variability among triage staff.</li>
              <li>Need for explainable, rule-grounded justification for patient placement.</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Project Objectives</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            To design, construct, and evaluate an educational Knowledge-Based System that transforms clinical guidelines into formal production rules and taxonomic ontologies.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
            <div className="flex items-center gap-2 p-2 bg-sky-50/50 rounded-lg text-sky-950 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>Multi-Axial Ontologies</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-sky-50/50 rounded-lg text-sky-950 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>Forward-Chaining Engine</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-sky-50/50 rounded-lg text-sky-950 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>Uncertainty & Fuzzy Logic</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-sky-50/50 rounded-lg text-sky-950 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>What-If Simulation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Assessment Workflow */}
      <section className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            How The System Works: Knowledge Inference Workflow
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Step-by-step transformation from unstructured clinical presentation to explainable priority stratum.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {[
            {
              step: '01',
              title: 'Patient Intake & Vitals',
              desc: 'Structured multi-section capture of demographics, symptoms, physiological vitals, and medical history.',
              icon: Stethoscope,
              tag: 'Input'
            },
            {
              step: '02',
              title: 'Knowledge Representation',
              desc: 'Mapping raw patient inputs into ontology concepts, taxonomic relations, and working memory facts.',
              icon: GitBranch,
              tag: 'Ontology'
            },
            {
              step: '03',
              title: 'Rule Match & Conflict',
              desc: 'Forward-chaining production rules evaluated against facts with conflict resolution favoring highest urgency.',
              icon: Cpu,
              tag: 'Inference'
            },
            {
              step: '04',
              title: 'Explainable Triage',
              desc: 'Color-coded prioritization with triggered rule evidence, maximum wait envelopes, and vital warning flags.',
              icon: CheckCircle2,
              tag: 'Output'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-sky-300 transition-all space-y-2.5 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-sky-600">{item.step}</span>
                  <span className="text-[10px] font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                    {item.tag}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-sky-600" />
                  <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Key Knowledge Engineering Capabilities */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Key Knowledge Engineering Modules
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Fulfills all requirements across Units 1 through 5 of 22ITE61.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div 
            onClick={() => onNavigate('knowledge-base')}
            className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:scale-105 transition-transform">
                <GitBranch className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">
                UNIT 3
              </span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-sky-600 transition-colors">
              Ontology Design & Connected Graph
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Explore concepts, instances, generalization hierarchies, defining features, transitivity, and semantic matching with SNOMED-CT / ICD-10.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('inference-engine')}
            className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-sky-50 text-sky-600 rounded-lg group-hover:scale-105 transition-transform">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono bg-sky-50 text-sky-700 px-2 py-0.5 rounded font-bold">
                UNIT 4
              </span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-sky-600 transition-colors">
              Rule-Based Inference Engine
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Step-by-step forward-chaining production rules, execution tracer, conflict resolution, and dynamic rule management.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('uncertainty-lab')}
            className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:scale-105 transition-transform">
                <Brain className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold">
                UNIT 1 & 2
              </span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-sky-600 transition-colors">
              Uncertainty Reasoning Lab
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Abductive diagnostic search, Bayesian belief updating, Dempster-Shafer mass intervals, fuzzy physiological curves, and PEAS agent.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-slate-100 rounded-2xl p-6 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Ready to test emergency triage cases?</h3>
          <p className="text-xs text-slate-500">Explore real demonstration cases or register a custom simulated patient.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold shadow-xs"
          >
            View Dashboard
          </button>
          <button
            onClick={() => onNavigate('assessment')}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-sm"
          >
            Register Patient & Triage
          </button>
        </div>
      </section>
    </div>
  );
};
