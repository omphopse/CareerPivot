import { useState } from 'react';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { CareerDiagnosis } from './components/CareerDiagnosis';
import { SprintPlanView } from './components/SprintPlanView';
import { InterviewCoach } from './components/InterviewCoach';
import { ApplicationTracker } from './components/ApplicationTracker';
import { SettingsModal } from './components/SettingsModal';
import { CompulsoryOnboarding } from './components/CompulsoryOnboarding';
import type {
  CareerDiagnosisResult,
  SprintPlan,
  JobApplication,
  InterviewEvaluation,
  InterviewQuestion
} from './types';
import { storageService } from './services/supabase';
import { aiService } from './services/gemini';
import confetti from 'canvas-confetti';
import { Zap } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'diagnosis' | 'sprint' | 'interview' | 'tracker'>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Core Data States - initialized strictly from storage or null
  const [diagnosis, setDiagnosis] = useState<CareerDiagnosisResult | null>(() => {
    return storageService.getDiagnosis();
  });

  const [sprintPlan, setSprintPlan] = useState<SprintPlan | null>(() => {
    return storageService.getSprintPlan();
  });

  const [questions, setQuestions] = useState<InterviewQuestion[]>(() => {
    return storageService.getInterviewQuestions();
  });

  const [applications, setApplications] = useState<JobApplication[]>(() => {
    return storageService.getJobApplications();
  });

  const [latestEvaluation, setLatestEvaluation] = useState<InterviewEvaluation | null>(() => {
    const list = storageService.getInterviewEvaluations();
    return list.length > 0 ? list[0] : null;
  });

  const [streakCount] = useState(1);

  // Show Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Live Comprehensive AI Intake Pipeline
  const handleStartAnalysis = async (
    resume: string,
    jd: string,
    manualRole?: string,
    manualCompany?: string
  ) => {
    setIsAnalyzing(true);
    try {
      // Step 1: Forensic Career Diagnosis
      setAnalyzingStep('1/4: Gemini is forensically auditing resume evidence against JD...');
      const diagResult = await aiService.analyzeRoleFit(resume, jd);

      if (manualRole) diagResult.targetRole = manualRole;
      if (manualCompany) diagResult.targetCompany = manualCompany;

      // Step 2: Personalized 7-Day Sprint Plan
      setAnalyzingStep('2/4: Generating custom 7-day curriculum, daily tasks & quizzes...');
      const planResult = await aiService.generatePersonalizedSprintPlan(
        diagResult.targetRole,
        diagResult.targetCompany,
        diagResult.gapSkills,
        diagResult.matchedSkills
      );

      // Step 3: Role-Specific Technical Interview Questions
      setAnalyzingStep('3/4: Formulating targeted technical mock interview questions...');
      const generatedQuestions = await aiService.generateRoleInterviewQuestions(
        diagResult.targetRole,
        diagResult.gapSkills,
        diagResult.interviewFocusAreas
      );

      // Step 4: Application CRM Initialization
      setAnalyzingStep('4/4: Initializing your job application pipeline CRM...');
      const initialApp: JobApplication = {
        id: `app-${Date.now()}`,
        company: diagResult.targetCompany || 'Target Employer',
        role: diagResult.targetRole || 'Target Role',
        location: 'Remote / Hybrid',
        salary: '$150,000 - $185,000',
        status: 'applied',
        fitScore: diagResult.roleFitScore,
        jobUrl: '#',
        nextAction: `Complete Day 1 sprint milestones for ${diagResult.targetRole}`,
        followUpDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        notes: `AI Fit Score: ${diagResult.roleFitScore}%. Focus on closing ${diagResult.gapSkills.length} identified gaps.`,
        dateAdded: new Date().toISOString().split('T')[0]
      };

      // Persist to storage and Supabase
      await storageService.saveDiagnosis(diagResult);
      await storageService.saveSprintPlan(planResult);
      storageService.saveInterviewQuestions(generatedQuestions);
      await storageService.saveJobApplications([initialApp]);

      // Update state
      setDiagnosis(diagResult);
      setSprintPlan(planResult);
      setQuestions(generatedQuestions);
      setApplications([initialApp]);
      setLatestEvaluation(null);

      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 }
      });

      setActiveTab('dashboard');
      showToast(`⚡ Live analysis complete for ${diagResult.targetRole}!`);
    } catch (err: any) {
      alert(`AI Analysis error: ${err?.message || 'Failed to complete evaluation'}`);
    } finally {
      setIsAnalyzing(false);
      setAnalyzingStep('');
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

      if (evaluation.score < 60) {
        showToast(`AI Graded: ${evaluation.score}/100. Weakness flagged! Click 'Sync Weakness & Extend Sprint'`);
      } else {
        showToast(`AI Graded: ${evaluation.score}/100. Strong performance!`);
      }
      return evaluation;
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRecalibrateSprintPlan = async (evaluation: InterviewEvaluation) => {
    if (!sprintPlan) return;
    const recalibrated = aiService.recalibrateSprintPlan(sprintPlan, evaluation);
    setSprintPlan(recalibrated);
    await storageService.saveSprintPlan(recalibrated);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.5 }
    });
    showToast(`⚡ Sprint dynamically extended to ${recalibrated.totalDays} Days! Added Day ${recalibrated.totalDays} for remedial practice.`);
  };

  const handleUpdateApplications = async (updatedApps: JobApplication[]) => {
    setApplications(updatedApps);
    await storageService.saveJobApplications(updatedApps);
  };

  const handleStartNewAnalysis = () => {
    if (confirm('Start a fresh Career Pivot analysis? This will clear current session data.')) {
      storageService.clearPivotData();
      setDiagnosis(null);
      setSprintPlan(null);
      setQuestions([]);
      setApplications([]);
      setLatestEvaluation(null);
      showToast('Ready for new Resume & Job Description input.');
    }
  };

  const handleResetData = () => {
    storageService.clearPivotData();
    setDiagnosis(null);
    setSprintPlan(null);
    setQuestions([]);
    setApplications([]);
    setLatestEvaluation(null);
    showToast('All data reset.');
  };

  // Compulsory Onboarding Gate: If no active diagnosis exists, show intake screen!
  if (!diagnosis || !sprintPlan) {
    return (
      <CompulsoryOnboarding
        onStartAnalysis={handleStartAnalysis}
        isAnalyzing={isAnalyzing}
        analyzingStep={analyzingStep}
      />
    );
  }

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
        onStartNewAnalysis={handleStartNewAnalysis}
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
            onStartNewAnalysis={handleStartNewAnalysis}
          />
        )}

        {activeTab === 'diagnosis' && (
          <CareerDiagnosis
            diagnosis={diagnosis}
            onAnalyze={async (r, j) => handleStartAnalysis(r, j)}
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
            questions={questions}
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
            <span>Live AI Career Pivot Coach</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>Google Gemini 3.8 Flash</span>
            <span>•</span>
            <span>Supabase PostgreSQL</span>
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
