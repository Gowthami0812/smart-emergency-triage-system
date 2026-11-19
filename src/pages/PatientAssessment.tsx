import React, { useState } from 'react';
import { ViewKey } from '../components/Sidebar';
import { Patient, Gender, SymptomSeverity } from '../types/patient';
import { StorageService } from '../services/storageService';
import { KnowledgeInferenceEngine } from '../engine/inferenceEngine';
import { CLINICAL_PRESETS } from '../data/seedData';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import {
  UserPlus,
  Stethoscope,
  HeartPulse,
  Activity,
  AlertCircle,
  CheckCircle2,
  BookmarkPlus,
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface PatientAssessmentProps {
  onNavigate: (view: ViewKey) => void;
  onSelectPatient: (patientId: string) => void;
}

const AVAILABLE_SYMPTOMS = [
  'Chest pain',
  'Difficulty breathing',
  'Fever',
  'Headache',
  'Vomiting',
  'Abdominal pain',
  'Dizziness',
  'Bleeding',
  'Weakness',
  'Cough',
  'Palpitations',
  'Nausea'
];

export const PatientAssessment: React.FC<PatientAssessmentProps> = ({
  onNavigate,
  onSelectPatient
}) => {
  // Generate random new ID
  const generateNewId = () => `PT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const [patientId, setPatientId] = useState(generateNewId());
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState<number | ''>(45);
  const [gender, setGender] = useState<Gender>('Male');
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().slice(0, 10));
  const [assessmentTime, setAssessmentTime] = useState(
    new Date().toTimeString().slice(0, 5)
  );

  // Symptoms
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [otherSymptomInput, setOtherSymptomInput] = useState('');

  // Vitals (Never assume missing is normal)
  const [temperature, setTemperature] = useState<number | ''>(37.0);
  const [heartRate, setHeartRate] = useState<number | ''>(78);
  const [systolicBP, setSystolicBP] = useState<number | ''>(120);
  const [diastolicBP, setDiastolicBP] = useState<number | ''>(80);
  const [respiratoryRate, setRespiratoryRate] = useState<number | ''>(16);
  const [spo2, setSpo2] = useState<number | ''>(98);

  // Medical History
  const [diabetes, setDiabetes] = useState(false);
  const [hypertension, setHypertension] = useState(false);
  const [heartDisease, setHeartDisease] = useState(false);
  const [asthma, setAsthma] = useState(false);
  const [previousSurgeries, setPreviousSurgeries] = useState(false);
  const [allergies, setAllergies] = useState(false);
  const [otherConditions, setOtherConditions] = useState('');
  const [chiefComplaintNotes, setChiefComplaintNotes] = useState('');

  // Severity
  const [severity, setSeverity] = useState<SymptomSeverity>('moderate');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load Preset
  const handleLoadPreset = (preset: typeof CLINICAL_PRESETS[0]) => {
    const p = preset.patient;
    setPatientName(p.name);
    setAge(p.age);
    setGender(p.gender);
    setSelectedSymptoms([...p.symptoms]);
    setTemperature(p.vitals.temperature);
    setHeartRate(p.vitals.heartRate);
    setSystolicBP(p.vitals.systolicBP);
    setDiastolicBP(p.vitals.diastolicBP);
    setRespiratoryRate(p.vitals.respiratoryRate);
    setSpo2(p.vitals.spo2);

    setDiabetes(p.history.diabetes);
    setHypertension(p.history.hypertension);
    setHeartDisease(p.history.heartDisease);
    setAsthma(p.history.asthma);
    setPreviousSurgeries(p.history.previousSurgeries);
    setAllergies(p.history.allergies);
    setOtherConditions(p.history.otherConditions);
    setSeverity(p.severity);
    setChiefComplaintNotes(p.chiefComplaintNotes || '');
    setErrors({});
  };

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  const handleAddOtherSymptom = () => {
    if (otherSymptomInput.trim() && !selectedSymptoms.includes(otherSymptomInput.trim())) {
      setSelectedSymptoms(prev => [...prev, otherSymptomInput.trim()]);
      setOtherSymptomInput('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!patientName.trim()) newErrors.patientName = 'Patient Name is required';
    if (age === '' || Number(age) < 0 || Number(age) > 130) newErrors.age = 'Valid age (0-130) is required';
    
    // Explicit validation: never silently accept missing vitals
    if (temperature === '' || Number(temperature) < 30 || Number(temperature) > 45) {
      newErrors.temperature = 'Body temperature (30.0 - 45.0 °C) is required';
    }
    if (heartRate === '' || Number(heartRate) < 20 || Number(heartRate) > 250) {
      newErrors.heartRate = 'Heart rate (20 - 250 bpm) is required';
    }
    if (systolicBP === '' || Number(systolicBP) < 40 || Number(systolicBP) > 300) {
      newErrors.systolicBP = 'Systolic BP (40 - 300 mmHg) is required';
    }
    if (diastolicBP === '' || Number(diastolicBP) < 20 || Number(diastolicBP) > 200) {
      newErrors.diastolicBP = 'Diastolic BP (20 - 200 mmHg) is required';
    }
    if (respiratoryRate === '' || Number(respiratoryRate) < 4 || Number(respiratoryRate) > 80) {
      newErrors.respiratoryRate = 'Respiratory rate (4 - 80 bpm) is required';
    }
    if (spo2 === '' || Number(spo2) < 50 || Number(spo2) > 100) {
      newErrors.spo2 = 'Oxygen saturation SpO2 (50 - 100%) is required';
    }

    if (selectedSymptoms.length === 0) {
      newErrors.symptoms = 'Please select at least one symptom or chief complaint';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const constructPatientObject = (): Patient => {
    return {
      id: patientId,
      name: patientName.trim(),
      age: Number(age),
      gender,
      assessmentDate,
      assessmentTime,
      symptoms: selectedSymptoms,
      vitals: {
        temperature: Number(temperature),
        heartRate: Number(heartRate),
        systolicBP: Number(systolicBP),
        diastolicBP: Number(diastolicBP),
        respiratoryRate: Number(respiratoryRate),
        spo2: Number(spo2)
      },
      history: {
        diabetes,
        hypertension,
        heartDisease,
        asthma,
        previousSurgeries,
        allergies,
        otherConditions: otherConditions.trim()
      },
      severity,
      chiefComplaintNotes: chiefComplaintNotes.trim()
    };
  };

  const handleSaveOnly = () => {
    if (!validateForm()) return;
    const pt = constructPatientObject();
    const rules = StorageService.getRules();
    const { triageResult } = KnowledgeInferenceEngine.runInference(pt, rules);
    pt.vitals && (pt as any);
    StorageService.addPatient({ ...pt });
    StorageService.saveTriageResult(pt.id, triageResult);
    StorageService.setActivePatientId(pt.id);
    onSelectPatient(pt.id);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveAndRunTriage = () => {
    if (!validateForm()) return;
    const pt = constructPatientObject();
    const rules = StorageService.getRules();
    const { triageResult } = KnowledgeInferenceEngine.runInference(pt, rules);
    
    StorageService.addPatient(pt);
    StorageService.saveTriageResult(pt.id, triageResult);
    StorageService.setActivePatientId(pt.id);
    onSelectPatient(pt.id);
    
    // Navigate straight to explainable Triage Results view
    onNavigate('triage-results');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Disclaimer */}
      <DisclaimerBanner compact />

      {/* Header & Quick Preset Loaders */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-sky-600" />
              Patient Registration & Clinical Assessment
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Structured multi-axial knowledge extraction for inference engine rule evaluation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              ID: {patientId}
            </span>
          </div>
        </div>

        {/* Viva Quick Demonstration Presets */}
        <div className="p-3.5 bg-sky-50/70 border border-sky-100 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              Viva Demonstration Quick Presets (Click to autofill clinical case):
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CLINICAL_PRESETS.map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleLoadPreset(preset)}
                className="text-xs px-2.5 py-1.5 bg-white hover:bg-sky-100 text-sky-900 border border-sky-200 rounded-lg font-medium transition-all shadow-2xs hover:border-sky-300 flex items-center gap-1.5"
              >
                <span>{preset.title}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-100 text-sky-800">
                  {preset.badge.split(' - ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FORM SECTIONS */}
      <form onSubmit={(e) => { e.preventDefault(); handleSaveAndRunTriage(); }} className="space-y-6">
        
        {/* SECTION A – Personal Information */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs flex items-center justify-center font-bold">A</span>
              Personal Demographics
            </h3>
            <span className="text-[11px] text-slate-400">* Required fields</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Patient ID */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Patient ID
              </label>
              <input
                type="text"
                value={patientId}
                readOnly
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-500 font-mono font-medium cursor-not-allowed"
              />
            </div>

            {/* Patient Name */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Patient Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                className={`w-full bg-white border ${errors.patientName ? 'border-red-500' : 'border-slate-300'} rounded-lg p-2 text-slate-800 focus:outline-none focus:border-sky-500`}
              />
              {errors.patientName && <p className="text-red-500 text-[10px] mt-0.5">{errors.patientName}</p>}
            </div>

            {/* Age */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Age (Years) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="130"
                value={age}
                onChange={e => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                className={`w-full bg-white border ${errors.age ? 'border-red-500' : 'border-slate-300'} rounded-lg p-2 text-slate-800 focus:outline-none focus:border-sky-500`}
              />
              {errors.age && <p className="text-red-500 text-[10px] mt-0.5">{errors.age}</p>}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as Gender)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-sky-500 font-medium"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Assessment Date</label>
              <input
                type="date"
                value={assessmentDate}
                onChange={e => setAssessmentDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Assessment Time</label>
              <input
                type="time"
                value={assessmentTime}
                onChange={e => setAssessmentTime(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION B – Symptoms Selection */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-bold">B</span>
              Symptoms Presentation (Multiple Selection)
            </h3>
            <span className="text-[11px] text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded">
              {selectedSymptoms.length} selected
            </span>
          </div>

          {errors.symptoms && (
            <p className="text-red-600 text-xs bg-red-50 p-2 rounded-lg border border-red-200 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errors.symptoms}
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {AVAILABLE_SYMPTOMS.map(sym => {
              const isSelected = selectedSymptoms.includes(sym);
              return (
                <button
                  type="button"
                  key={sym}
                  onClick={() => toggleSymptom(sym)}
                  className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{sym}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Add custom other symptom */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="Add other symptom (e.g. Syncope, Stridor, Rash)..."
              value={otherSymptomInput}
              onChange={e => setOtherSymptomInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddOtherSymptom(); }}}
              className="flex-1 bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
            />
            <button
              type="button"
              onClick={handleAddOtherSymptom}
              className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-xs font-semibold"
            >
              Add Symptom
            </button>
          </div>
        </div>

        {/* SECTION C – Vital Signs (Validated with physiological normal cues) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 text-xs flex items-center justify-center font-bold">C</span>
              Physiological Vital Signs (Required)
            </h3>
            <span className="text-[11px] text-slate-400">Do not assume missing is normal</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* SpO2 */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-800">Oxygen Saturation (SpO2)</label>
                <span className="text-[10px] text-slate-400 font-mono">Norm: 95-100%</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="50"
                  max="100"
                  value={spo2}
                  onChange={e => setSpo2(e.target.value === '' ? '' : Number(e.target.value))}
                  className={`w-full bg-white border ${errors.spo2 ? 'border-red-500' : 'border-slate-300'} rounded-lg p-2 text-slate-900 font-bold focus:outline-none focus:border-rose-500`}
                />
                <span className="absolute right-3 top-2 text-slate-400 font-semibold">%</span>
              </div>
              {Number(spo2) < 90 && (
                <p className="text-red-600 text-[10px] font-bold mt-1">Critical Hypoxia Trigger (&lt;90%)</p>
              )}
              {errors.spo2 && <p className="text-red-500 text-[10px] mt-0.5">{errors.spo2}</p>}
            </div>

            {/* Heart Rate */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-800">Heart Rate (Pulse)</label>
                <span className="text-[10px] text-slate-400 font-mono">Norm: 60-100 bpm</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="20"
                  max="250"
                  value={heartRate}
                  onChange={e => setHeartRate(e.target.value === '' ? '' : Number(e.target.value))}
                  className={`w-full bg-white border ${errors.heartRate ? 'border-red-500' : 'border-slate-300'} rounded-lg p-2 text-slate-900 font-bold focus:outline-none focus:border-rose-500`}
                />
                <span className="absolute right-3 top-2 text-slate-400 font-semibold">bpm</span>
              </div>
              {Number(heartRate) > 120 && (
                <p className="text-orange-600 text-[10px] font-bold mt-1">Significant Tachycardia</p>
              )}
              {errors.heartRate && <p className="text-red-500 text-[10px] mt-0.5">{errors.heartRate}</p>}
            </div>

            {/* Blood Pressure (Systolic & Diastolic) */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-800">Blood Pressure (BP)</label>
                <span className="text-[10px] text-slate-400 font-mono">Norm: 120/80 mmHg</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Sys"
                  value={systolicBP}
                  onChange={e => setSystolicBP(e.target.value === '' ? '' : Number(e.target.value))}
                  className={`w-1/2 bg-white border ${errors.systolicBP ? 'border-red-500' : 'border-slate-300'} rounded-lg p-2 text-slate-900 font-bold focus:outline-none focus:border-rose-500`}
                />
                <span className="text-slate-400">/</span>
                <input
                  type="number"
                  placeholder="Dia"
                  value={diastolicBP}
                  onChange={e => setDiastolicBP(e.target.value === '' ? '' : Number(e.target.value))}
                  className={`w-1/2 bg-white border ${errors.diastolicBP ? 'border-red-500' : 'border-slate-300'} rounded-lg p-2 text-slate-900 font-bold focus:outline-none focus:border-rose-500`}
                />
              </div>
              {(Number(systolicBP) < 90 || Number(systolicBP) >= 180) && (
                <p className="text-red-600 text-[10px] font-bold mt-1">Hemodynamic Danger Threshold</p>
              )}
              {(errors.systolicBP || errors.diastolicBP) && (
                <p className="text-red-500 text-[10px] mt-0.5">{errors.systolicBP || errors.diastolicBP}</p>
              )}
            </div>

            {/* Respiratory Rate */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-800">Respiratory Rate</label>
                <span className="text-[10px] text-slate-400 font-mono">Norm: 12-20 bpm</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="4"
                  max="80"
                  value={respiratoryRate}
                  onChange={e => setRespiratoryRate(e.target.value === '' ? '' : Number(e.target.value))}
                  className={`w-full bg-white border ${errors.respiratoryRate ? 'border-red-500' : 'border-slate-300'} rounded-lg p-2 text-slate-900 font-bold focus:outline-none focus:border-rose-500`}
                />
                <span className="absolute right-3 top-2 text-slate-400 font-semibold">/min</span>
              </div>
              {Number(respiratoryRate) >= 30 && (
                <p className="text-red-600 text-[10px] font-bold mt-1">Critical Tachypnea (&gt;=30)</p>
              )}
              {errors.respiratoryRate && <p className="text-red-500 text-[10px] mt-0.5">{errors.respiratoryRate}</p>}
            </div>

            {/* Temperature */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-800">Body Temperature</label>
                <span className="text-[10px] text-slate-400 font-mono">Norm: 36.5-37.5 °C</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="45"
                  value={temperature}
                  onChange={e => setTemperature(e.target.value === '' ? '' : Number(e.target.value))}
                  className={`w-full bg-white border ${errors.temperature ? 'border-red-500' : 'border-slate-300'} rounded-lg p-2 text-slate-900 font-bold focus:outline-none focus:border-rose-500`}
                />
                <span className="absolute right-3 top-2 text-slate-400 font-semibold">°C</span>
              </div>
              {Number(temperature) >= 38.5 && (
                <p className="text-orange-600 text-[10px] font-bold mt-1">High Pyrexia / Sepsis Risk</p>
              )}
              {errors.temperature && <p className="text-red-500 text-[10px] mt-0.5">{errors.temperature}</p>}
            </div>
          </div>
        </div>

        {/* SECTION D – Medical History */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-bold">D</span>
              Pre-Existing Medical History & Comorbidities
            </h3>
            <span className="text-[11px] text-slate-400">Modulates risk stratification</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
            {[
              { label: 'Diabetes', checked: diabetes, setChecked: setDiabetes },
              { label: 'Hypertension', checked: hypertension, setChecked: setHypertension },
              { label: 'Heart Disease', checked: heartDisease, setChecked: setHeartDisease },
              { label: 'Asthma / COPD', checked: asthma, setChecked: setAsthma },
              { label: 'Prior Surgeries', checked: previousSurgeries, setChecked: setPreviousSurgeries },
              { label: 'Known Allergies', checked: allergies, setChecked: setAllergies }
            ].map((item, idx) => (
              <label
                key={idx}
                className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                  item.checked
                    ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{item.label}</span>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={e => item.setChecked(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                </div>
              </label>
            ))}
          </div>

          <div className="pt-2">
            <label className="block text-slate-700 font-semibold text-xs mb-1">
              Other Relevant Medical Conditions / Medications
            </label>
            <input
              type="text"
              placeholder="e.g. Chronic Kidney Disease, Anticoagulant use, Immunosuppressed..."
              value={otherConditions}
              onChange={e => setOtherConditions(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* SECTION E – Symptom Severity & Clinical Notes */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs flex items-center justify-center font-bold">E</span>
              Severity Classification & Triage Notes
            </h3>
            <span className="text-[11px] text-slate-400">Clinical judgment overlay</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[
              { val: 'mild', label: 'Mild', color: 'border-emerald-300 text-emerald-800 bg-emerald-50' },
              { val: 'moderate', label: 'Moderate', color: 'border-amber-300 text-amber-800 bg-amber-50' },
              { val: 'severe', label: 'Severe', color: 'border-red-300 text-red-800 bg-red-50' },
              { val: 'unknown', label: 'Unknown', color: 'border-slate-300 text-slate-800 bg-slate-50' }
            ].map(opt => (
              <button
                type="button"
                key={opt.val}
                onClick={() => setSeverity(opt.val as SymptomSeverity)}
                className={`p-3 rounded-xl border text-center font-bold transition-all ${
                  severity === opt.val
                    ? `${opt.color} ring-2 ring-sky-500 shadow-xs`
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="pt-2">
            <label className="block text-slate-700 font-semibold text-xs mb-1">
              Chief Complaint & Free-Text Clinical Observations
            </label>
            <textarea
              rows={2}
              placeholder="Enter brief presentation summary (e.g. onset, radiation, associated signs)..."
              value={chiefComplaintNotes}
              onChange={e => setChiefComplaintNotes(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-200">
          {savedSuccess && (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5 mr-auto">
              <CheckCircle2 className="w-4 h-4" />
              Patient record saved to local registry successfully!
            </span>
          )}

          <button
            type="button"
            onClick={handleSaveOnly}
            className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-xs transition-all"
          >
            Save Patient Record
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-900/30 flex items-center justify-center gap-2 transition-all"
          >
            <span>Submit for Knowledge Inference & Triage</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
