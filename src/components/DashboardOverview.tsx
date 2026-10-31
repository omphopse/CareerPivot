import React from 'react';
import {
  TrendingUp,
  Target,
  Calendar,
  Briefcase,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';
import { CareerDiagnosisResult, SprintPlan, JobApplication } from '../types';

interface DashboardOverviewProps {
  diagnosis: CareerDiagnosisResult;
  sprintPlan: SprintPlan;
  applications: JobApplication[];
  onNavigate: (tab: 'diagnosis' | 'sprint' | 'interview' | 'tracker') => void;
  onTriggerDemoStory: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  diagnosis,
  sprintPlan,
  applications,
  onNavigate,
  onTriggerDemoStory
}) => {
  // Calculations
  const totalTasks = sprintPlan.days.reduce((acc, d) => acc + d.tasks.length, 0);
  const completedTasks = sprintPlan.days.reduce(
    (acc, d) => acc + d.tasks.filter((t) => t.completed).length,
    0
  );
  const sprintProgress = Math.round((completedTasks / (totalTasks || 1)) * 100);

  const activeInterviews = applications.filter((a) => a.status === 'interviewing').length;

  const currentDayPlan = sprintPlan.days.find((d) => d.dayNumber === sprintPlan.currentDay) || sprintPlan.days[0];
  const nextPendingTask = currentDayPlan?.tasks.find((t) => !t.completed) || currentDayPlan?.tasks[0];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Pivot Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/70 via-slate-900/90 to-slate-950 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-32 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Career Pivot Roadmap Active</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Pivoting to <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-cyan-300 to-emerald-300">{diagnosis.targetRole}</span>
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Targeting <span className="text-white font-medium">{diagnosis.targetCompany}</span>. Career Pilot identified <span className="text-amber-400 font-semibold">{diagnosis.gapSkills.length} critical competency gaps</span> and calibrated a 7-day sprint to bridge your profile to senior production readiness.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                <span>Fit Score: <strong className="text-white">{diagnosis.roleFitScore}%</strong></span>
              </span>
              <span className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Day {sprintPlan.currentDay} of 7: <strong className="text-white">{currentDayPlan?.theme.split(':')[0]}</strong></span>
              </span>
              <span className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                <span>{activeInterviews} Live Interview Scheduled</span>
              </span>
            </div>
          </div>

          {/* Quick Demo CTA for Hackathon Judges */}
          <div className="w-full lg:w-auto p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex flex-col justify-between space-y-3 shrink-0 shadow-lg">
            <div className="flex items-center space-x-2 text-amber-300 text-xs font-semibold">
              <Zap className="w-4 h-4 fill-amber-400 text-amber-400 animate-bounce" />
              <span>Hackathon Judge Walkthrough</span>
            </div>
            <p className="text-xs text-slate-300 max-w-xs">
              Experience the end-to-end story: candidate fails a Kafka question, AI auto-updates the 7-day learning plan.
            </p>
            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={onTriggerDemoStory}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <span>Trigger Judge Story</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Role Fit Score */}
        <div
          onClick={() => onNavigate('diagnosis')}
          className="glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Role Fit Index</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{diagnosis.roleFitScore}%</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>+14% this week</span>
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${diagnosis.roleFitScore}%` }}
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Match: {diagnosis.matchPercentage}%</span>
            <span>Gap: {diagnosis.gapPercentage}%</span>
          </div>
        </div>

        {/* 7-Day Sprint Completion */}
        <div
          onClick={() => onNavigate('sprint')}
          className="glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">7-Day Sprint Pace</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{sprintProgress}%</span>
            <span className="text-xs font-semibold text-cyan-400">
              {completedTasks}/{totalTasks} Tasks
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${sprintProgress}%` }}
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Day {sprintPlan.currentDay} of 7 Active</span>
            <span className="text-indigo-300 font-medium group-hover:underline flex items-center">
              View Sprint <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Competency Bridging */}
        <div
          onClick={() => onNavigate('diagnosis')}
          className="glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Skills Forensic Audit</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition-colors">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">
              {diagnosis.matchedSkills.length}/{diagnosis.matchedSkills.length + diagnosis.gapSkills.length}
            </span>
            <span className="text-xs font-semibold text-amber-400">
              {diagnosis.gapSkills.length} Gaps to Bridge
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${Math.round(
                  (diagnosis.matchedSkills.length /
                    (diagnosis.matchedSkills.length + diagnosis.gapSkills.length || 1)) *
                    100
                )}%`
              }}
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
            <span>{diagnosis.weakEvidenceSkills.length} Weak Evidence Alerts</span>
            <span className="text-indigo-300 font-medium group-hover:underline flex items-center">
              Audit Matrix <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Application Pipeline */}
        <div
          onClick={() => onNavigate('tracker')}
          className="glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Job Pipeline CRM</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{applications.length}</span>
            <span className="text-xs font-semibold text-emerald-400">
              {activeInterviews} In Interviews
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, applications.length * 25)}%` }}
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Apex & Revolut Next</span>
            <span className="text-indigo-300 font-medium group-hover:underline flex items-center">
              Track Apps <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Skill Mastery vs Today's Priority Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Skill Mastery Index */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Award className="w-5 h-5 text-indigo-400" />
                <span>Target Skill Mastery & Adaptive Index</span>
              </h2>
              <p className="text-xs text-slate-400">
                Dynamically weighted based on your 7-day task completions and mock interview answers
              </p>
            </div>
            <button
              onClick={() => onNavigate('interview')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
            >
              <span>Test Knowledge</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4 pt-1">
            {Object.entries(sprintPlan.masteryScores).map(([skillName, score]) => {
              const isLow = score < 40;
              const isMedium = score >= 40 && score < 75;
              const isHigh = score >= 75;

              return (
                <div key={skillName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{skillName}</span>
                    <span
                      className={`font-bold ${
                        isLow ? 'text-rose-400' : isMedium ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {score}% {isLow ? '⚠️ Priority Gap' : isMedium ? 'In Progress' : '✓ Verified'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ${
                        isLow
                          ? 'bg-rose-500'
                          : isMedium
                          ? 'bg-amber-500'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Adaptive Engine Log Badge */}
          {sprintPlan.adaptiveLogs.length > 0 && (
            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-start space-x-3 text-xs">
              <Zap className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-indigo-200">Adaptive Engine Update:</span>
                  <span className="text-[10px] text-indigo-400">{sprintPlan.adaptiveLogs[0].timestamp}</span>
                </div>
                <p className="text-slate-300">{sprintPlan.adaptiveLogs[0].changeSummary}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Current Day Focus & Next High Impact Action */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                TODAY'S SPRINT FOCUS
              </span>
              <span className="text-xs text-slate-400 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Day {sprintPlan.currentDay}</span>
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">{currentDayPlan?.theme}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{currentDayPlan?.goal}</p>
            </div>

            {/* Next Action Task Box */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Recommended Next Step
              </span>
              <div className="flex items-start space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-100">{nextPendingTask?.title}</p>
                  <p className="text-[11px] text-slate-400">{nextPendingTask?.duration} • {nextPendingTask?.type}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => onNavigate('sprint')}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <span>Continue Day {sprintPlan.currentDay} Sprint</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('interview')}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <span>Practice AI Mock Interview</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
