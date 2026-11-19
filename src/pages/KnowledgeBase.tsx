import React, { useState } from 'react';
import { ViewKey } from '../components/Sidebar';
import { ONTOLOGY_NODES, ONTOLOGY_EDGES, ONTOLOGY_MATCHINGS } from '../data/seedData';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import {
  GitBranch,
  Network,
  Share2,
  BookOpen,
  Layers,
  ArrowRight,
  Database,
  ExternalLink,
  Info,
  CheckCircle2,
  Boxes,
  Workflow
} from 'lucide-react';

interface KnowledgeBaseProps {
  onNavigate: (view: ViewKey) => void;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'concepts' | 'relations' | 'matching' | 'formalism'>('concepts');

  const categories = ['ALL', 'Patient', 'Symptom', 'VitalSign', 'History', 'Priority'];

  const filteredNodes = selectedCategory === 'ALL'
    ? ONTOLOGY_NODES
    : ONTOLOGY_NODES.filter(n => n.category === selectedCategory);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <DisclaimerBanner compact />

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-1">
            <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200">
              UNIT 3 • Ontologies: Design & Development
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-indigo-600" />
            Knowledge Base & Clinical Ontology Architecture
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Formal representation of emergency medical concepts, semantic relationships, and cross-ontology mappings.
          </p>
        </div>

        <button
          onClick={() => onNavigate('ontology-visualizer')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <Network className="w-4 h-4" />
          <span>Launch Interactive Visual Graph</span>
        </button>
      </div>

      {/* Syllabus Unit 3 Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('concepts')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'concepts'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Ontology Concepts & Instances ({ONTOLOGY_NODES.length})
        </button>
        <button
          onClick={() => setActiveTab('relations')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'relations'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Semantic Relationships ({ONTOLOGY_EDGES.length})
        </button>
        <button
          onClick={() => setActiveTab('matching')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'matching'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Ontology Matching & Crosswalks (SNOMED / ICD)
        </button>
        <button
          onClick={() => setActiveTab('formalism')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'formalism'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Theoretical Foundations (Unit 3 Topics)
        </button>
      </div>

      {/* TAB 1: CONCEPTS & INSTANCES */}
      {activeTab === 'concepts' && (
        <div className="space-y-4">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Filter Sub-Domain:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNodes.map(node => (
              <div
                key={node.id}
                className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase" style={{ backgroundColor: `${node.color}15`, color: node.color }}>
                    {node.type} • {node.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{node.id}</span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900">{node.label}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {node.description}
                  </p>
                </div>

                {/* Defining Features */}
                {node.definingFeatures && node.definingFeatures.length > 0 && (
                  <div className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                      Defining Features:
                    </span>
                    <ul className="list-disc pl-4 text-slate-600 text-[11px] space-y-0.5">
                      {node.definingFeatures.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Object Features / Roles */}
                {node.objectFeatures && (
                  <div className="p-2.5 bg-indigo-50/60 rounded-lg text-xs space-y-1">
                    <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wide">
                      Object Properties (Roles):
                    </span>
                    <div className="space-y-0.5 text-[11px]">
                      {Object.entries(node.objectFeatures).map(([role, target], i) => (
                        <div key={i} className="flex items-center justify-between font-mono text-indigo-950">
                          <span>{role}</span>
                          <span className="text-indigo-600">&rarr; {target}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transitive Ancestors & Inheritance */}
                {node.transitiveAncestors && (
                  <div className="text-[10px] text-slate-400 font-mono">
                    Inherits from: {node.transitiveAncestors.join(' &gt; ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SEMANTIC RELATIONSHIPS */}
      {activeTab === 'relations' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Taxonomic & Semantic Axioms in Triage Domain
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              ALC(D) Description Logic Representation
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {ONTOLOGY_EDGES.map(edge => {
              const src = ONTOLOGY_NODES.find(n => n.id === edge.source);
              const tgt = ONTOLOGY_NODES.find(n => n.id === edge.target);
              return (
                <div key={edge.id} className="p-3.5 hover:bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900">
                      {src?.label || edge.source}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800 font-mono">
                      -- {edge.label} --&gt;
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {tgt?.label || edge.target}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {edge.isTransitive && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                        Transitive (Inherited)
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">
                      Rel: {edge.relation}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ONTOLOGY MATCHING */}
      {activeTab === 'matching' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Workflow className="w-4 h-4 text-indigo-600" />
              Ontology Alignment & Cross-Vocabulary Matching
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Demonstrates semantic reconciliation between local emergency department triage terms and international biomedical terminologies (SNOMED-CT, LOINC, and ICD-10-CM).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ONTOLOGY_MATCHINGS.map((m, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    Match Type: {m.matchType}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600">
                    Similarity: {(m.similarityScore * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="space-y-2 p-3 bg-slate-50 rounded-lg text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Local Source Concept:</span>
                    <p className="font-mono font-semibold text-slate-800">{m.sourceTerm}</p>
                    <span className="text-[10px] text-slate-400 font-mono">({m.sourceOntology})</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2">
                    <span className="text-[10px] font-bold text-indigo-500 uppercase">Target Standard Ontology:</span>
                    <p className="font-mono font-semibold text-indigo-950">{m.targetTerm}</p>
                    <span className="text-[10px] text-indigo-600 font-mono">({m.targetOntology})</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 italic">
                  "{m.mappingRationale}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: THEORETICAL FOUNDATIONS (UNIT 3 SYLLABUS INTEGRATION) */}
      {activeTab === 'formalism' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-2.5">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-indigo-600" />
              1. Concepts and Instances
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Concepts</strong> (Classes) represent abstract categories of entities (e.g., <code className="text-indigo-600 font-mono">Symptom</code>, <code className="text-indigo-600 font-mono">VitalSign</code>). <strong>Instances</strong> are individual ground realizations (e.g., <code className="text-indigo-600 font-mono">Instance_RedPriority</code> or patient <code className="text-indigo-600 font-mono">PT-2026-0001</code>).
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-2.5">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-indigo-600" />
              2. Generalization Hierarchies & Inheritance
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Taxonomic <code className="font-mono text-indigo-600">is_a</code> links organize concepts from general to specific. Subconcepts inherit defining properties from ancestor nodes: e.g., <code className="font-mono">CardiacSymptom</code> inherits all features of <code className="font-mono">Symptom</code>.
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-2.5">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              3. Defining Features vs Object Features
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Defining features</strong> are necessary conditions that an entity must possess to be categorized under a concept (e.g. SpO2 &lt; 90% defines Critical Hypoxia). <strong>Object features</strong> relate concepts through semantic roles (<code className="font-mono">has_symptom</code>, <code className="font-mono">generates</code>).
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-2.5">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Workflow className="w-4 h-4 text-indigo-600" />
              4. Transitivity & Axiomatic Representation
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transitivity states that if <code className="font-mono">A is_a B</code> and <code className="font-mono">B is_a C</code>, then <code className="font-mono">A is_a C</code>. This allows the inference engine to deduce that <code className="font-mono">CardiacSymptom</code> is a constituent of <code className="font-mono">EmergencyTriageDomain</code>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
