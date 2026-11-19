import React, { useState, useEffect } from 'react';
import { ViewKey } from '../components/Sidebar';
import { StorageService } from '../services/storageService';
import { ProductionRule, RuleCategory, ConditionField, ConditionOperator } from '../types/rules';
import { PriorityLevel } from '../types/patient';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import {
  Sliders,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Filter,
  Search,
  RotateCcw,
  BookOpen,
  Layers,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';

interface RuleManagementProps {
  onNavigate: (view: ViewKey) => void;
}

export const RuleManagement: React.FC<RuleManagementProps> = ({ onNavigate }) => {
  const [rules, setRules] = useState<ProductionRule[]>(StorageService.getRules());
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingRule, setEditingRule] = useState<ProductionRule | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'rules' | 'theory'>('rules');

  useEffect(() => {
    const unsub = StorageService.subscribe(() => {
      setRules(StorageService.getRules());
    });
    return unsub;
  }, []);

  const handleToggle = (id: string) => {
    StorageService.toggleRule(id);
  };

  const handleDelete = (id: string) => {
    if (confirm(`Are you sure you want to delete rule ${id}?`)) {
      StorageService.deleteRule(id);
    }
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    if (isCreatingNew) {
      StorageService.addRule(editingRule);
    } else {
      StorageService.updateRule(editingRule.id, editingRule);
    }

    setEditingRule(null);
    setIsCreatingNew(false);
  };

  const filteredRules = rules.filter(r => {
    if (selectedCategory !== 'ALL' && r.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return r.id.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleStartCreateNew = () => {
    const newRule: ProductionRule = {
      id: `RULE-USER-${Math.floor(100 + Math.random() * 900)}`,
      name: 'Custom Emergency Rule',
      category: 'Airway/Breathing',
      ruleType: 'production',
      description: 'Custom production rule created via Rule Manager to demonstrate real-time inference impact.',
      conditions: [
        {
          id: 'c1',
          field: 'spo2',
          operator: '<',
          value: 92,
          label: 'SpO2 < 92%'
        }
      ],
      logicOperator: 'AND',
      action: {
        priority: 'RED',
        rationale: 'User-defined emergency condition threshold triggered.',
        clinicalAlert: 'Evaluate bedside immediately.',
        weight: 90
      },
      enabled: true,
      isBuiltIn: false
    };

    setEditingRule(newRule);
    setIsCreatingNew(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <DisclaimerBanner compact />

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-1">
            <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200">
              UNIT 4 • Production Rules & Knowledge Management
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" />
            Knowledge Base Rule Management & Architecture
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure, enable, or construct production rules. Changes directly modulate the forward-chaining inference engine.
          </p>
        </div>

        <button
          onClick={handleStartCreateNew}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Production Rule</span>
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'rules' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Production Rule Catalog ({rules.length})
        </button>
        <button
          onClick={() => setActiveTab('theory')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'theory' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Unit 4 Foundations: Synthesis, Reduction & Working Memory
        </button>
      </div>

      {/* --- TAB 1: PRODUCTION RULES CATALOG --- */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-slate-400 font-semibold shrink-0">Category:</span>
              {[
                'ALL',
                'Airway/Breathing',
                'Circulation',
                'Neurological',
                'Symptom-Severity',
                'Multi-Factor',
                'Synthesis',
                'Reduction'
              ].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition-all ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search rule ID / text..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Rules List */}
          <div className="space-y-3">
            {filteredRules.map(rule => (
              <div
                key={rule.id}
                className={`bg-white rounded-xl p-5 border transition-all ${
                  rule.enabled
                    ? 'border-slate-200 shadow-sm'
                    : 'border-slate-200/60 opacity-60 bg-slate-50/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {rule.id}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{rule.name}</h3>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span>Category: {rule.category}</span>
                        <span>•</span>
                        <span>Type: {rule.ruleType.toUpperCase()}</span>
                        {rule.triggerCount !== undefined && (
                          <>
                            <span>•</span>
                            <span className="text-sky-600 font-bold">Fired: {rule.triggerCount} times</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Priority Badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${
                      rule.action.priority === 'RED' ? 'bg-red-600' :
                      rule.action.priority === 'ORANGE' ? 'bg-orange-500' :
                      rule.action.priority === 'YELLOW' ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}>
                      THEN &rarr; {rule.action.priority}
                    </span>

                    {/* Enable / Disable Switch */}
                    <button
                      onClick={() => handleToggle(rule.id)}
                      title={rule.enabled ? 'Click to disable rule' : 'Click to enable rule'}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                        rule.enabled
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {rule.enabled ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                      <span className="text-[10px]">{rule.enabled ? 'Active' : 'Disabled'}</span>
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => {
                        setEditingRule({ ...rule });
                        setIsCreatingNew(false);
                      }}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg"
                      title="Edit Rule"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete button (only custom or if confirmed) */}
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {rule.description}
                </p>

                {/* IF Conditions Breakdown */}
                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1.5 text-xs font-mono">
                  <div className="text-[10px] font-bold uppercase text-slate-500 font-sans">
                    Production Antecedents (IF):
                  </div>
                  <div className="flex flex-wrap gap-2 text-slate-800">
                    {rule.conditions.map((c, idx) => (
                      <span key={idx} className="bg-white px-2.5 py-1 rounded border border-slate-200 shadow-2xs">
                        {c.label || `${c.field} ${c.operator} ${c.value}`}
                      </span>
                    ))}
                  </div>
                </div>

                {/* THEN Action Rationale */}
                <div className="mt-2 text-xs text-indigo-950 p-2.5 bg-indigo-50/60 rounded-lg border border-indigo-100 flex items-start gap-2">
                  <span className="font-bold shrink-0">Action Directive:</span>
                  <span className="italic">{rule.action.rationale} ({rule.action.clinicalAlert})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 2: UNIT 4 THEORETICAL FOUNDATIONS --- */}
      {activeTab === 'theory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-2">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              1. Production System Architecture
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Consists of <strong>Working Memory</strong> (extracted patient facts), <strong>Rule Base</strong> (IF-THEN production axioms), and the <strong>Inference Engine</strong> executing Match-Resolve-Act forward-chaining cycles.
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-2">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              2. Reduction vs Synthesis Rules
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Reduction Rules</strong> simplify complex states into low-risk baselines when physiological stability is proven (e.g. RULE-15). <strong>Synthesis Rules</strong> integrate disparate evidence across multiple organ systems to escalate urgency (e.g. RULE-02, RULE-14).
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-2">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-600" />
              3. Conflict Resolution Strategies
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              When multiple rules fire simultaneously, conflict resolution selects the winning priority based on <strong>Priority Hierarchy Order</strong> (RED &gt; ORANGE &gt; YELLOW &gt; GREEN), followed by <strong>Rule Specificity Weight</strong>.
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-2">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600" />
              4. Reasoning with Partially Learned Knowledge
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              In clinical triage, observations are often incomplete. The system supports open-world assumption safeguards: missing vital signs or symptoms are never assumed to be normal, and default fallback mechanisms guard against premature discharge.
            </p>
          </div>
        </div>
      )}

      {/* EDIT / CREATE RULE MODAL */}
      {editingRule && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSaveRule}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">
                {isCreatingNew ? 'Create New Production Rule' : `Edit Rule: ${editingRule.id}`}
              </h3>
              <button
                type="button"
                onClick={() => setEditingRule(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Rule ID</label>
                <input
                  type="text"
                  value={editingRule.id}
                  onChange={e => setEditingRule({ ...editingRule, id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Rule Name</label>
                <input
                  type="text"
                  value={editingRule.name}
                  onChange={e => setEditingRule({ ...editingRule, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={editingRule.category}
                    onChange={e => setEditingRule({ ...editingRule, category: e.target.value as RuleCategory })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2"
                  >
                    <option value="Airway/Breathing">Airway/Breathing</option>
                    <option value="Circulation">Circulation</option>
                    <option value="Neurological">Neurological</option>
                    <option value="Symptom-Severity">Symptom-Severity</option>
                    <option value="Multi-Factor">Multi-Factor</option>
                    <option value="Synthesis">Synthesis</option>
                    <option value="Reduction">Reduction</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">THEN Priority</label>
                  <select
                    value={editingRule.action.priority}
                    onChange={e => setEditingRule({
                      ...editingRule,
                      action: { ...editingRule.action, priority: e.target.value as PriorityLevel }
                    })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold"
                  >
                    <option value="RED">RED (Immediate)</option>
                    <option value="ORANGE">ORANGE (Urgent)</option>
                    <option value="YELLOW">YELLOW (Prompt)</option>
                    <option value="GREEN">GREEN (Lower Urgency)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingRule.description}
                  onChange={e => setEditingRule({ ...editingRule, description: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Action Rationale</label>
                <textarea
                  rows={2}
                  value={editingRule.action.rationale}
                  onChange={e => setEditingRule({
                    ...editingRule,
                    action: { ...editingRule.action, rationale: e.target.value }
                  })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingRule(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm"
              >
                Save Production Rule
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
