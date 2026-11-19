import React, { useState } from 'react';
import { ViewKey } from './Sidebar';
import { 
  PlusCircle, 
  RotateCcw, 
  Download, 
  Upload, 
  Search, 
  Stethoscope,
  CheckCircle,
  FileText
} from 'lucide-react';
import { StorageService } from '../services/storageService';

interface TopNavbarProps {
  currentView: ViewKey;
  onNavigate: (view: ViewKey) => void;
  collapsed: boolean;
  onSelectPatient?: (patientId: string) => void;
}

const VIEW_TITLES: Record<ViewKey, { title: string; subtitle: string }> = {
  landing: { title: 'Smart Emergency Triage System', subtitle: 'Overview & Knowledge Engineering Architecture' },
  dashboard: { title: 'Clinical Triage Dashboard', subtitle: 'Real-Time Patient Prioritization & Department Analytics' },
  assessment: { title: 'Patient Registration & Assessment', subtitle: 'Multi-Section Input & Knowledge Feature Extraction' },
  'knowledge-base': { title: 'Knowledge Base & Representation', subtitle: 'Unit 3: Clinical Concepts, Features & Taxonomy' },
  'ontology-visualizer': { title: 'Ontology Graph Explorer', subtitle: 'Unit 3: Connected Nodes, Inheritance & Transitivity' },
  'inference-engine': { title: 'Knowledge-Based Inference Engine', subtitle: 'Unit 4: Production Rules, Conflict Resolution & Tracing' },
  'uncertainty-lab': { title: 'Reasoning Under Uncertainty', subtitle: 'Unit 1 & 2: Bayes, Dempster-Shafer, Fuzzy Logic & PEAS Agent' },
  'triage-results': { title: 'Patient Triage Results', subtitle: 'Explainable Clinical Prioritization & Matched Rules' },
  'rule-management': { title: 'Production Rule Management', subtitle: 'Unit 4: Rule Editor, Activation & Synthesis/Reduction Systems' },
  'what-if': { title: 'What-If Simulation Analysis', subtitle: 'Unit 2: Differential Modeling & Assumption-Based Reasoning' },
  'rule-learning': { title: 'Rule Learning & Refinement', subtitle: 'Unit 5: Generalization, Specialization & Anomaly Detection' },
  'patient-history': { title: 'Historical Patient Registry', subtitle: 'Archive of Simulation Cases & Re-Evaluation' },
  about: { title: 'Coursework & Academic Syllabus', subtitle: '22ITE61 – Knowledge Engineering Curriculum Integration' },
};

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentView,
  onNavigate,
  collapsed,
  onSelectPatient
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const patients = StorageService.getPatients();
  const filteredPatients = searchQuery.trim()
    ? patients.filter(p => 
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleExport = () => {
    const dataStr = StorageService.exportDataJson();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kets-triage-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (StorageService.importDataJson(text)) {
          alert('Data imported successfully!');
        } else {
          alert('Failed to parse valid JSON data.');
        }
      };
      reader.readAsText(file);
    }
  };

  const currentInfo = VIEW_TITLES[currentView] || { title: 'Triage KBS', subtitle: 'Knowledge Engineering' };

  return (
    <header 
      className={`fixed top-0 right-0 h-16 bg-white border-b border-slate-200/90 z-20 flex items-center justify-between px-6 transition-all duration-300 shadow-sm ${
        collapsed ? 'left-20' : 'left-72'
      }`}
    >
      {/* Title & Breadcrumb */}
      <div>
        <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
          {currentInfo.title}
        </h1>
        <p className="text-[11px] text-slate-500 hidden sm:block">
          {currentInfo.subtitle}
        </p>
      </div>

      {/* Action Controls & Search */}
      <div className="flex items-center gap-3">
        {/* Patient Quick Search */}
        <div className="relative hidden md:block">
          <div className="flex items-center bg-slate-100 rounded-lg px-2.5 py-1.5 border border-slate-200/80 focus-within:border-sky-500 focus-within:bg-white transition-all w-48 lg:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search patient / ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
            />
          </div>

          {/* Quick Search Dropdown */}
          {showSearchResults && filteredPatients.length > 0 && (
            <div className="absolute right-0 top-10 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                Matching Patients
              </div>
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {filteredPatients.map(pt => (
                  <button
                    key={pt.id}
                    onClick={() => {
                      StorageService.setActivePatientId(pt.id);
                      if (onSelectPatient) onSelectPatient(pt.id);
                      onNavigate('triage-results');
                      setShowSearchResults(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-2 hover:bg-slate-50 rounded-lg flex items-center justify-between text-xs group"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 group-hover:text-sky-600">
                        {pt.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {pt.id} • {pt.age}y {pt.gender}
                      </div>
                    </div>
                    {pt.triageResult?.priority && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${
                        pt.triageResult.priority === 'RED' ? 'bg-red-600' :
                        pt.triageResult.priority === 'ORANGE' ? 'bg-orange-500' :
                        pt.triageResult.priority === 'YELLOW' ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}>
                        {pt.triageResult.priority}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action: New Assessment */}
        <button
          onClick={() => onNavigate('assessment')}
          className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all hover:shadow"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Assessment</span>
        </button>

        {/* Data Tools Dropdown / Buttons */}
        <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
          <button
            onClick={handleExport}
            title="Export Simulation Records (JSON)"
            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          <label
            title="Import Simulation Records (JSON)"
            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-md cursor-pointer transition-colors"
          >
            <Upload className="w-4 h-4" />
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>

          <button
            onClick={() => setShowResetConfirm(true)}
            title="Reset All Data to Default Simulation State"
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Academic Status Badge */}
        <div className="hidden xl:flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full text-[11px] text-slate-600">
          <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
          <span className="font-semibold text-slate-800">22ITE61</span>
          <span className="text-slate-400">|</span>
          <span className="text-emerald-700 font-medium">KBS Simulation</span>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-slate-800 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-600" />
              Reset Demonstration Data?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              This will restore the 16 original production rules and 12 default patient records to their initial state.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  StorageService.resetToDefaults();
                  setShowResetConfirm(false);
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
