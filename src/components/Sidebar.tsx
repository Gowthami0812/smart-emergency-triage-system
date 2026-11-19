import React from 'react';
import {
  LayoutDashboard,
  UserPlus,
  GitBranch,
  Network,
  Cpu,
  BrainCircuit,
  FileCheck2,
  Sliders,
  Scale,
  GraduationCap,
  History,
  Info,
  Activity,
  Home,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export type ViewKey =
  | 'landing'
  | 'dashboard'
  | 'assessment'
  | 'knowledge-base'
  | 'ontology-visualizer'
  | 'inference-engine'
  | 'uncertainty-lab'
  | 'triage-results'
  | 'rule-management'
  | 'what-if'
  | 'rule-learning'
  | 'patient-history'
  | 'about';

interface SidebarProps {
  currentView: ViewKey;
  onNavigate: (view: ViewKey) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  id: ViewKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  unitBadge?: string;
  category: 'Overview' | 'Clinical Triage' | 'Knowledge & Inference' | 'Reasoning & Modeling' | 'Academic & Records';
}

const NAV_ITEMS: NavItem[] = [
  // Overview
  { id: 'landing', label: 'Landing Page', icon: Home, category: 'Overview' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Overview' },
  
  // Clinical Triage
  { id: 'assessment', label: 'Patient Assessment', icon: UserPlus, category: 'Clinical Triage' },
  { id: 'triage-results', label: 'Triage Results', icon: FileCheck2, category: 'Clinical Triage' },
  { id: 'patient-history', label: 'Patient History', icon: History, category: 'Clinical Triage' },

  // Knowledge & Inference
  { id: 'knowledge-base', label: 'Knowledge Base', icon: GitBranch, unitBadge: 'Unit 3', category: 'Knowledge & Inference' },
  { id: 'ontology-visualizer', label: 'Ontology Graph', icon: Network, unitBadge: 'Unit 3', category: 'Knowledge & Inference' },
  { id: 'inference-engine', label: 'Inference Engine', icon: Cpu, unitBadge: 'Unit 4', category: 'Knowledge & Inference' },
  { id: 'rule-management', label: 'Rule Management', icon: Sliders, unitBadge: 'Unit 4', category: 'Knowledge & Inference' },

  // Reasoning & Modeling
  { id: 'uncertainty-lab', label: 'Uncertainty Lab', icon: BrainCircuit, unitBadge: 'Unit 1', category: 'Reasoning & Modeling' },
  { id: 'what-if', label: 'What-If Analysis', icon: Scale, unitBadge: 'Unit 2', category: 'Reasoning & Modeling' },
  { id: 'rule-learning', label: 'Rule Learning', icon: GraduationCap, unitBadge: 'Unit 5', category: 'Reasoning & Modeling' },

  // Academic & Records
  { id: 'about', label: 'About Project', icon: Info, category: 'Academic & Records' }
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  collapsed,
  onToggleCollapse
}) => {
  const categories = Array.from(new Set(NAV_ITEMS.map(item => item.category)));

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-slate-900 text-slate-300 flex flex-col z-30 transition-all duration-300 border-r border-slate-800 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-sky-900/50 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div>
              <div className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                TRIAGE-KBS
                <span className="text-[10px] font-semibold bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded border border-sky-500/30">
                  22ITE61
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[170px]">
                Smart Emergency System
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {categories.map(category => {
          const items = NAV_ITEMS.filter(i => i.category === category);
          return (
            <div key={category} className="space-y-1">
              {!collapsed && (
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  {category}
                </div>
              )}
              {items.map(item => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group relative ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-md shadow-sky-900/40 font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-400'}`} />
                    {!collapsed && (
                      <div className="flex-1 flex items-center justify-between text-left truncate">
                        <span className="truncate">{item.label}</span>
                        {item.unitBadge && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                            isActive
                              ? 'bg-sky-700 text-sky-100'
                              : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-sky-300'
                          }`}>
                            {item.unitBadge}
                          </span>
                        )}
                      </div>
                    )}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-sky-400 rounded-r" />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Inference Ready
              </span>
              <button
                onClick={onToggleCollapse}
                className="text-[10px] text-slate-500 hover:text-slate-300 px-1 py-0.5"
              >
                Collapse
              </button>
            </div>
            <div className="p-2 bg-slate-900 rounded border border-slate-800 text-[10px] text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate">Knowledge Base v1.2 Active</span>
            </div>
          </div>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="w-full py-2 flex items-center justify-center text-slate-400 hover:text-white"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
