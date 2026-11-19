import React, { useState, useEffect, useMemo } from 'react';
import { ViewKey } from '../components/Sidebar';
import { StorageService } from '../services/storageService';
import { KnowledgeInferenceEngine } from '../engine/inferenceEngine';
import { PatientRecord, PriorityLevel } from '../types/patient';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import {
  History,
  Search,
  Filter,
  Eye,
  Trash2,
  RotateCcw,
  RefreshCw,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle
} from 'lucide-react';

interface PatientHistoryProps {
  onNavigate: (view: ViewKey) => void;
  onSelectPatient: (patientId: string) => void;
}

export const PatientHistory: React.FC<PatientHistoryProps> = ({
  onNavigate,
  onSelectPatient
}) => {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [rules, setRules] = useState(StorageService.getRules());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [reEvaluating, setReEvaluating] = useState(false);

  const loadData = () => {
    const r = StorageService.getRules();
    setRules(r);
    const pts = StorageService.getPatients();

    // Ensure all patients have triage results
    const evaluated = pts.map(p => {
      if (!p.triageResult) {
        const { triageResult } = KnowledgeInferenceEngine.runInference(p, r);
        return { ...p, triageResult };
      }
      return p;
    });

    setPatients(evaluated);
  };

  useEffect(() => {
    loadData();
    const unsub = StorageService.subscribe(loadData);
    return unsub;
  }, []);

  const handleReevaluateAll = () => {
    setReEvaluating(true);
    setTimeout(() => {
      const activeRules = StorageService.getRules();
      const updated = patients.map(p => {
        const { triageResult } = KnowledgeInferenceEngine.runInference(p, activeRules);
        return { ...p, triageResult };
      });
      StorageService.savePatients(updated);
      setPatients(updated);
      setReEvaluating(false);
    }, 400);
  };

  const handleDelete = (id: string) => {
    if (confirm(`Remove patient record ${id} from registry?`)) {
      StorageService.deletePatient(id);
    }
  };

  const filtered = useMemo(() => {
    return patients.filter(p => {
      if (filterPriority !== 'ALL' && p.triageResult?.priority !== filterPriority) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.id.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          (p.symptoms || []).some(s => s.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [patients, filterPriority, searchQuery]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <DisclaimerBanner compact />

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-700 text-xs font-bold uppercase tracking-wider mb-1">
            <span className="px-2 py-0.5 rounded bg-sky-50 border border-sky-200">
              Audit Registry • Longitudinal Simulation History
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-sky-600" />
            Patient Assessment Archive & Audit Trail
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete database of emergency intakes, historical rule triggers, and re-evaluation telemetry.
          </p>
        </div>

        <button
          onClick={handleReevaluateAll}
          disabled={reEvaluating}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${reEvaluating ? 'animate-spin' : ''}`} />
          <span>Re-Evaluate All with Active Rules</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by Patient ID or Name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-slate-800 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-600">Filter Urgency:</span>
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-700 font-bold cursor-pointer"
          >
            <option value="ALL">All Categories ({patients.length})</option>
            <option value="RED">RED: Immediate</option>
            <option value="ORANGE">ORANGE: Urgent</option>
            <option value="YELLOW">YELLOW: Prompt</option>
            <option value="GREEN">GREEN: Lower Urgency</option>
          </select>
        </div>
      </div>

      {/* Patient Archive Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No patient records match the specified filters.
          </div>
        ) : (
          filtered.map(patient => {
            const priority = patient.triageResult?.priority || 'GREEN';
            return (
              <div
                key={patient.id}
                className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {patient.id}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">{patient.name}</h3>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 font-medium">{patient.age} years, {patient.gender}</span>
                  </div>

                  {/* Vitals Snapshot */}
                  <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-slate-600">
                    <span>SpO2: <strong className={patient.vitals.spo2 < 92 ? 'text-red-600' : ''}>{patient.vitals.spo2}%</strong></span>
                    <span>•</span>
                    <span>HR: <strong className={patient.vitals.heartRate > 100 ? 'text-orange-600' : ''}>{patient.vitals.heartRate} bpm</strong></span>
                    <span>•</span>
                    <span>BP: <strong>{patient.vitals.systolicBP}/{patient.vitals.diastolicBP}</strong></span>
                    <span>•</span>
                    <span>Temp: <strong>{patient.vitals.temperature} °C</strong></span>
                  </div>

                  {/* Symptoms & Inferred Rules summary */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {(patient.symptoms || []).map((s, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">
                        {s}
                      </span>
                    ))}
                    {patient.triageResult?.triggeredRules && patient.triageResult.triggeredRules.length > 0 && (
                      <span className="text-[10px] text-sky-700 font-mono font-bold bg-sky-50 px-2 py-0.5 rounded">
                        Fired: {patient.triageResult.triggeredRules.map(r => r.ruleId).join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white shadow-2xs ${
                      priority === 'RED' ? 'bg-red-600' :
                      priority === 'ORANGE' ? 'bg-orange-500' :
                      priority === 'YELLOW' ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}>
                      {priority}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-end gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{patient.assessmentDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        StorageService.setActivePatientId(patient.id);
                        onSelectPatient(patient.id);
                        onNavigate('triage-results');
                      }}
                      className="p-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg font-bold flex items-center gap-1"
                      title="Inspect Triage Result"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">Details</span>
                    </button>

                    <button
                      onClick={() => handleDelete(patient.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
