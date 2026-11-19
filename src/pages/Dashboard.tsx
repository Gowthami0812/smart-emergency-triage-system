import React, { useState, useMemo, useEffect } from 'react';
import { ViewKey } from '../components/Sidebar';
import { StorageService } from '../services/storageService';
import { KnowledgeInferenceEngine } from '../engine/inferenceEngine';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { PatientRecord, PriorityLevel } from '../types/patient';
import {
  Users,
  AlertOctagon,
  AlertTriangle,
  Clock,
  CheckCircle,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Activity,
  PlusCircle,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';

interface DashboardProps {
  onNavigate: (view: ViewKey) => void;
  onSelectPatient: (patientId: string) => void;
}

const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  RED: '#dc2626',
  ORANGE: '#ea580c',
  YELLOW: '#d97706',
  GREEN: '#16a34a'
};

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onSelectPatient }) => {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [rules, setRules] = useState(StorageService.getRules());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'id' | 'name' | 'age' | 'priority' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load and subscribe to real-time storage
  useEffect(() => {
    const load = () => {
      const storedRules = StorageService.getRules();
      setRules(storedRules);
      const rawPatients = StorageService.getPatients();

      // Ensure every patient has calculated triage result from actual rules
      const evaluated = rawPatients.map(pt => {
        if (!pt.triageResult) {
          const { triageResult } = KnowledgeInferenceEngine.runInference(pt, storedRules);
          return { ...pt, triageResult };
        }
        return pt;
      });

      setPatients(evaluated);
    };

    load();
    const unsub = StorageService.subscribe(load);
    return unsub;
  }, []);

  // Calculate actual statistics from records
  const stats = useMemo(() => {
    const total = patients.length;
    const critical = patients.filter(p => p.triageResult?.priority === 'RED').length;
    const urgent = patients.filter(p => p.triageResult?.priority === 'ORANGE').length;
    const moderate = patients.filter(p => p.triageResult?.priority === 'YELLOW').length;
    const lower = patients.filter(p => p.triageResult?.priority === 'GREEN').length;

    return { total, critical, urgent, moderate, lower };
  }, [patients]);

  // Analytics data for charts
  const priorityDistributionData = useMemo(() => {
    return [
      { name: 'Critical (RED)', value: stats.critical, color: PRIORITY_COLORS.RED },
      { name: 'Urgent (ORANGE)', value: stats.urgent, color: PRIORITY_COLORS.ORANGE },
      { name: 'Prompt (YELLOW)', value: stats.moderate, color: PRIORITY_COLORS.YELLOW },
      { name: 'Lower Urgency (GREEN)', value: stats.lower, color: PRIORITY_COLORS.GREEN },
    ].filter(d => d.value > 0);
  }, [stats]);

  const symptomFrequencyData = useMemo(() => {
    const counts: Record<string, number> = {};
    patients.forEach(p => {
      (p.symptoms || []).forEach(sym => {
        counts[sym] = (counts[sym] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([symptom, count]) => ({ symptom, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
  }, [patients]);

  const assessmentTrendsData = useMemo(() => {
    // Group patients by hour / sequence
    const buckets: Record<string, { red: number; orange: number; yellow: number; green: number }> = {
      '18:00': { red: 1, orange: 0, yellow: 0, green: 0 },
      '19:00': { red: 2, orange: 1, yellow: 0, green: 0 },
      '20:00': { red: 0, orange: 2, yellow: 2, green: 0 },
      '21:00': { red: 0, orange: 0, yellow: 1, green: 2 }
    };

    patients.forEach(p => {
      const hour = p.assessmentTime ? p.assessmentTime.slice(0, 2) + ':00' : '20:00';
      if (!buckets[hour]) {
        buckets[hour] = { red: 0, orange: 0, yellow: 0, green: 0 };
      }
      const pr = p.triageResult?.priority;
      if (pr === 'RED') buckets[hour].red++;
      else if (pr === 'ORANGE') buckets[hour].orange++;
      else if (pr === 'YELLOW') buckets[hour].yellow++;
      else if (pr === 'GREEN') buckets[hour].green++;
    });

    return Object.entries(buckets).map(([time, counts]) => ({
      time,
      Critical: counts.red,
      Urgent: counts.orange,
      Prompt: counts.yellow,
      Lower: counts.green,
      Total: counts.red + counts.orange + counts.yellow + counts.green
    }));
  }, [patients]);

  // Filtered & Sorted Patients
  const filteredPatients = useMemo(() => {
    let result = [...patients];

    if (filterPriority !== 'ALL') {
      result = result.filter(p => p.triageResult?.priority === filterPriority);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.symptoms || []).some(s => s.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      let valA: any = a[sortField === 'date' ? 'assessmentDate' : sortField === 'priority' ? 'id' : sortField];
      let valB: any = b[sortField === 'date' ? 'assessmentDate' : sortField === 'priority' ? 'id' : sortField];

      if (sortField === 'priority') {
        const order = { RED: 4, ORANGE: 3, YELLOW: 2, GREEN: 1 };
        valA = order[a.triageResult?.priority || 'GREEN'];
        valB = order[b.triageResult?.priority || 'GREEN'];
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [patients, filterPriority, searchQuery, sortField, sortOrder]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Disclaimer */}
      <DisclaimerBanner compact />

      {/* Top Header & Fast Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-600" />
            Emergency Department Prioritization Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active patient caseload dynamically categorized via Knowledge Engineering production rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('assessment')}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Assess New Patient</span>
          </button>
        </div>
      </div>

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Total Patients */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Patients</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{stats.total}</span>
            <span className="text-[10px] text-slate-400 font-medium">Registry Active</span>
          </div>
        </div>

        {/* Critical Priority (RED) */}
        <div className="bg-red-50/60 rounded-xl p-4 border border-red-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-red-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Critical (RED)</span>
            <AlertOctagon className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-red-700">{stats.critical}</span>
            <span className="text-[10px] font-bold bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
              0 min wait
            </span>
          </div>
        </div>

        {/* Urgent Priority (ORANGE) */}
        <div className="bg-orange-50/60 rounded-xl p-4 border border-orange-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-orange-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Urgent (ORANGE)</span>
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-orange-700">{stats.urgent}</span>
            <span className="text-[10px] font-bold bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">
              &le; 15 mins
            </span>
          </div>
        </div>

        {/* Moderate Priority (YELLOW) */}
        <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Moderate (YELLOW)</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-800">{stats.moderate}</span>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
              &le; 60 mins
            </span>
          </div>
        </div>

        {/* Lower Urgency (GREEN) */}
        <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200/90 shadow-sm flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Lower Urgency</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-800">{stats.lower}</span>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
              &le; 120 mins
            </span>
          </div>
        </div>
      </div>

      {/* VISUAL ANALYTICS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Doughnut Chart: Priority Distribution */}
        <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-sky-600" />
              Priority Distribution
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Doughnut</span>
          </div>

          <div className="h-52 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {priorityDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: any, name: any) => [`${value} Patients`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px', border: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
            {priorityDistributionData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }}></span>
                <span className="truncate text-slate-600">{d.name.split(' ')[0]}:</span>
                <span className="font-bold text-slate-800">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart: Symptom Distribution */}
        <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-600" />
              Top Reported Symptoms
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Frequency</span>
          </div>

          <div className="h-52 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={symptomFrequencyData} layout="vertical" margin={{ left: 20, right: 10, top: 10, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="symptom" 
                  type="category" 
                  tick={{ fontSize: 10, fill: '#475569' }} 
                  width={90}
                />
                <RechartsTooltip 
                  formatter={(val: any) => [`${val} Cases`, 'Frequency']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px', border: 'none' }}
                />
                <Bar dataKey="count" fill="#0284c7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-slate-400 text-center pt-2 border-t border-slate-100">
            Knowledge representation maps symptoms to production rules.
          </p>
        </div>

        {/* Line Chart: Assessment Trends */}
        <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              Assessment Activity Trend
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Time Hourly</span>
          </div>

          <div className="h-52 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={assessmentTrendsData} margin={{ left: -20, right: 10, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px', border: 'none' }}
                />
                <Line type="monotone" dataKey="Total" stroke="#0284c7" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Critical" stroke="#dc2626" strokeWidth={1.5} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="Urgent" stroke="#ea580c" strokeWidth={1.5} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-600"></span> Total</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600"></span> Critical</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Urgent</span>
          </div>
        </div>
      </div>

      {/* RECENT PATIENTS TABLE */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Table Filter & Search Header */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <h3 className="font-bold text-sm text-slate-900">Registered Patient Caseload</h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
              {filteredPatients.length} shown
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search patient / symptom..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>

            {/* Filter by Priority */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
                className="bg-transparent text-xs text-slate-700 focus:outline-none font-medium cursor-pointer"
              >
                <option value="ALL">All Priorities</option>
                <option value="RED">RED (Critical)</option>
                <option value="ORANGE">ORANGE (Urgent)</option>
                <option value="YELLOW">YELLOW (Prompt)</option>
                <option value="GREEN">GREEN (Lower Urgency)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th onClick={() => toggleSort('id')} className="py-3 px-4 cursor-pointer hover:text-sky-600">
                  <div className="flex items-center gap-1">Patient ID <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th onClick={() => toggleSort('name')} className="py-3 px-4 cursor-pointer hover:text-sky-600">
                  <div className="flex items-center gap-1">Patient Name <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th onClick={() => toggleSort('age')} className="py-3 px-4 cursor-pointer hover:text-sky-600">
                  <div className="flex items-center gap-1">Age / Sex <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-3 px-4">Main Symptoms</th>
                <th className="py-3 px-4">Vital Signs Snapshot</th>
                <th onClick={() => toggleSort('priority')} className="py-3 px-4 cursor-pointer hover:text-sky-600">
                  <div className="flex items-center gap-1">Priority Recommendation <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No patients match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredPatients.map(patient => {
                  const priority = patient.triageResult?.priority || 'GREEN';
                  return (
                    <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {patient.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{patient.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {patient.assessmentDate} {patient.assessmentTime}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {patient.age}y • {patient.gender}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(patient.symptoms || []).map((s, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        <div className="flex items-center gap-2">
                          <span className={patient.vitals.spo2 < 92 ? 'text-red-600 font-bold' : ''}>
                            SpO2: {patient.vitals.spo2}%
                          </span>
                          <span>•</span>
                          <span className={patient.vitals.heartRate > 110 ? 'text-orange-600 font-bold' : ''}>
                            HR: {patient.vitals.heartRate}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-xs ${
                          priority === 'RED' ? 'bg-red-600' :
                          priority === 'ORANGE' ? 'bg-orange-500' :
                          priority === 'YELLOW' ? 'bg-amber-500' : 'bg-emerald-600'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                          {priority === 'RED' ? 'RED: Immediate' :
                           priority === 'ORANGE' ? 'ORANGE: Urgent' :
                           priority === 'YELLOW' ? 'YELLOW: Prompt' : 'GREEN: Lower Urgency'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            StorageService.setActivePatientId(patient.id);
                            onSelectPatient(patient.id);
                            onNavigate('triage-results');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-sky-600 hover:text-white hover:bg-sky-600 border border-sky-300 rounded-lg text-xs font-semibold transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
