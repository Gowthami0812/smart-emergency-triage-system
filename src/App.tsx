import React, { useState, useEffect } from 'react';
import { Sidebar, ViewKey } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { PatientAssessment } from './pages/PatientAssessment';
import { KnowledgeBase } from './pages/KnowledgeBase';
import { OntologyVisualizer } from './pages/OntologyVisualizer';
import { InferenceEngineView } from './pages/InferenceEngineView';
import { UncertaintyLab } from './pages/UncertaintyLab';
import { TriageResultView } from './pages/TriageResultView';
import { RuleManagement } from './pages/RuleManagement';
import { WhatIfAnalysis } from './pages/WhatIfAnalysis';
import { RuleLearning } from './pages/RuleLearning';
import { PatientHistory } from './pages/PatientHistory';
import { AboutProject } from './pages/AboutProject';
import { StorageService } from './services/storageService';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewKey>('landing');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(() => {
    return StorageService.getActivePatientId() || 'PT-2026-0001';
  });

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  const handleSelectPatient = (id: string) => {
    setSelectedPatientId(id);
    StorageService.setActivePatientId(id);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* Persistent Left Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
      />

      {/* Persistent Top Navigation Bar */}
      <TopNavbar
        currentView={currentView}
        onNavigate={setCurrentView}
        collapsed={sidebarCollapsed}
        onSelectPatient={handleSelectPatient}
      />

      {/* Main Content Area */}
      <main
        className={`flex-1 transition-all duration-300 pt-20 px-4 md:px-8 pb-12 ${
          sidebarCollapsed ? 'ml-20' : 'ml-72'
        }`}
      >
        {currentView === 'landing' && (
          <LandingPage onNavigate={setCurrentView} />
        )}
        {currentView === 'dashboard' && (
          <Dashboard onNavigate={setCurrentView} onSelectPatient={handleSelectPatient} />
        )}
        {currentView === 'assessment' && (
          <PatientAssessment onNavigate={setCurrentView} onSelectPatient={handleSelectPatient} />
        )}
        {currentView === 'knowledge-base' && (
          <KnowledgeBase onNavigate={setCurrentView} />
        )}
        {currentView === 'ontology-visualizer' && (
          <OntologyVisualizer onNavigate={setCurrentView} />
        )}
        {currentView === 'inference-engine' && (
          <InferenceEngineView onNavigate={setCurrentView} onSelectPatient={handleSelectPatient} />
        )}
        {currentView === 'uncertainty-lab' && (
          <UncertaintyLab onNavigate={setCurrentView} />
        )}
        {currentView === 'triage-results' && (
          <TriageResultView
            onNavigate={setCurrentView}
            onSelectPatient={handleSelectPatient}
            patientId={selectedPatientId}
          />
        )}
        {currentView === 'rule-management' && (
          <RuleManagement onNavigate={setCurrentView} />
        )}
        {currentView === 'what-if' && (
          <WhatIfAnalysis onNavigate={setCurrentView} onSelectPatient={handleSelectPatient} />
        )}
        {currentView === 'rule-learning' && (
          <RuleLearning onNavigate={setCurrentView} />
        )}
        {currentView === 'patient-history' && (
          <PatientHistory onNavigate={setCurrentView} onSelectPatient={handleSelectPatient} />
        )}
        {currentView === 'about' && (
          <AboutProject onNavigate={setCurrentView} />
        )}
      </main>
    </div>
  );
};

export default App;
