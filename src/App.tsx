import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { CareerDiagnosis } from './components/CareerDiagnosis';
import { SprintPlanView } from './components/SprintPlanView';
import { InterviewCoach } from './components/InterviewCoach';
import { ApplicationTracker } from './components/ApplicationTracker';
import { SettingsModal } from './components/SettingsModal';
import {
  CareerDiagnosisResult,
  SprintPlan,
  JobApplication,
  InterviewEvaluation,
  InterviewQuestion
} from './types';
import {
  INITIAL_DIAGNOSIS,
  INITIAL_SPRINT_PLAN,
  INITIAL_JOB_APPLICATIONS,
  DEMO_WEAK_EVALUATION,
  DEMO_RESUME,
  DEMO_JOB_DESCRIPTION
} from './data/demoData';
import { storageService } from './services/supabase';
import { aiService } from './services/gemini';
import confetti from 'canvas-confetti';
import { Sparkles, CheckCircle2, Zap } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'diagnosis' | 'sprint' | 'interview' | 'tracker'>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Core Data States with Local/Supabase Persistence
  const [diagnosis, setDiagnosis] = useState<CareerDiagnosisResult>(() => {
    return storageService.getDiagnosis() || INITIAL_DIAGNOSIS;
  });

  const [sprintPlan, setSprintPlan] = useState<SprintPlan>(() => {
    return storageService.getSprintPlan() || INITIAL_SPRINT_PLAN;
  });

  const [applications, setApplications] = useState<JobApplication[]>(() => {
    const saved = storageService.getJobApplications();
    return saved.length > 0 ? saved : INITIAL_JOB_APPLICATIONS;
  });

  const [latestEvaluation, setLatestEvaluation] = useState<InterviewEvaluation | null>(() => {
    const list = storageService.getInterviewEvaluations();
    return list.length > 0 ? list[0] : DEMO_WEAK_EVALUATION;
  });

  const [streakCount, setStreakCount] = useState(4);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Handlers
  const handleAnalyze = async (resume: string, jd: string) => {
    setIsAnalyzing(true);
    try {
      const result = await aiService.analyzeRoleFit(resume, jd);
      setDiagnosis(result);
      await storageService.saveDiagnosis(result);
      showToast('Career Diagnosis generated successfully!');
    } catch (err: any) {
      alert(`Analysis error: ${err?.message || 'Failed to analyze'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdateSprintPlan = async (updated: SprintPlan) => {
    setSprintPlan(updated);
    await storageService.saveSprintPlan(updated);
  };

  const handleEvaluateAnswer = async (
    question: InterviewQuestion,
    answer: string
  ): Promise<InterviewEvaluation> => {
    setIsEvaluating(true);
    try {
      const evaluation = await aiService.evaluateInterviewAnswer(question, answer);
      setLatestEvaluation(evaluation);
      await storageService.saveInterviewEvaluation(evaluation);

      // If low score, offer or auto-recalibrate
      if (evaluation.score < 55) {
        showToast(`AI Graded: ${evaluation.score}/100. Critical Gap identified! Click 'Sync to 7-Day Sprint'`);
      } else {
        showToast(`AI Graded: ${evaluation.score}/100. Passed evaluation!`);
      }
      return evaluation;
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRecalibrateSprintPlan = async (evaluation: InterviewEvaluation) => {
    const recalibrated = aiService.recalibrateSprintPlan(sprintPlan, evaluation);
    setSprintPlan(recalibrated);
    await storageService.saveSprintPlan(recalibrated);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.5 }
    });
    showToast('⚡ 7-Day Sprint Plan recalibrated! Injected remedial Kafka deduplication build task into Day 4.');
  };

  const handleUpdateApplications = async (updatedApps: JobApplication[]) => {
    setApplications(updatedApps);
    await storageService.saveJobApplications(updatedApps);
  };

  // Hackathon Judge Demo Story Walkthrough
  const handleLoadDemoStory = () => {
    setDiagnosis(INITIAL_DIAGNOSIS);
    storageService.saveDiagnosis(INITIAL_DIAGNOSIS);

    setSprintPlan(INITIAL_SPRINT_PLAN);
    storageService.saveSprintPlan(INITIAL_SPRINT_PLAN);

    setApplications(INITIAL_JOB_APPLICATIONS);
    storageService.saveJobApplications(INITIAL_JOB_APPLICATIONS);

    setLatestEvaluation(DEMO_WEAK_EVALUATION);
    storageService.saveInterviewEvaluation(DEMO_WEAK_EVALUATION);

    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.4 }
    });

    setActiveTab('dashboard');
    showToast('⚡ Judge Demo Story Loaded: Alex Morgan (Node.js) → Senior Java Backend Engineer');
  };

  const handleResetData = () => {
    localStorage.clear();
    setDiagnosis(INITIAL_DIAGNOSIS);
    setSprintPlan(INITIAL_SPRINT_PLAN);
    setApplications(INITIAL_JOB_APPLICATIONS);
    setLatestEvaluation(DEMO_WEAK_EVALUATION);
    showToast('Data reset to fresh demonstration baseline.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce duration-300">
          <div className="flex items-center space-x-2.5 px-4 py-3 rounded-2xl bg-indigo-950/90 border border-indigo-500/50 text-white shadow-2xl backdrop-blur-md text-xs font-semibold">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLoadDemoStory={handleLoadDemoStory}
        streakCount={streakCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            diagnosis={diagnosis}
            sprintPlan={sprintPlan}
            applications={applications}
            onNavigate={(tab) => setActiveTab(tab)}
            onTriggerDemoStory={handleLoadDemoStory}
          />
        )}

        {activeTab === 'diagnosis' && (
          <CareerDiagnosis
            diagnosis={diagnosis}
            onAnalyze={handleAnalyze}
            onNavigateToSprint={() => setActiveTab('sprint')}
            isAnalyzing={isAnalyzing}
          />
        )}

        {activeTab === 'sprint' && (
          <SprintPlanView
            sprintPlan={sprintPlan}
            onUpdatePlan={handleUpdateSprintPlan}
            onNavigateToInterview={() => setActiveTab('interview')}
          />
        )}

        {activeTab === 'interview' && (
          <InterviewCoach
            sprintPlan={sprintPlan}
            onEvaluateAnswer={handleEvaluateAnswer}
            onRecalibrateSprintPlan={handleRecalibrateSprintPlan}
            onNavigateToSprint={() => setActiveTab('sprint')}
            isEvaluating={isEvaluating}
            latestEvaluation={latestEvaluation}
          />
        )}

        {activeTab === 'tracker' && (
          <ApplicationTracker
            applications={applications}
            onUpdateApplications={handleUpdateApplications}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/90 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white">Career Pilot</span>
            <span>•</span>
            <span>AI Career Pivot & Skill Gap Coach</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>Powered by Google Gemini 1.5/2.0 API</span>
            <span>•</span>
            <span>Supabase PostgreSQL Backend</span>
            <span>•</span>
            <span>React + Vite + Tailwind</span>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onResetData={handleResetData}
      />
    </div>
  );
}

export default App;
