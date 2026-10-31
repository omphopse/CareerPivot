import React from 'react';
import {
  Target,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Play
} from 'lucide-react';
import type { CareerDiagnosisResult, SprintPlan, JobApplication } from '../types';

interface DashboardOverviewProps {
  diagnosis: CareerDiagnosisResult;
  sprintPlan: SprintPlan;
  applications: JobApplication[];
  onNavigate: (tab: 'diagnosis' | 'sprint' | 'interview' | 'tracker') => void;
  onStartNewAnalysis: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  diagnosis,
  sprintPlan,
  applications,
  onNavigate,
  onStartNewAnalysis
}) => {
  // Compute Sprint Progress
  const totalTasks = sprintPlan.days.reduce((acc, day) => acc + day.tasks.length, 0);
  const completedTasks = sprintPlan.days.reduce(
    (acc, day) => acc + day.tasks.filter((t) => t.completed).length,
    0
  );
  const sprintProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Current Day Plan
  const currentDayPlan =
    sprintPlan.days.find((d) => d.dayNumber === sprintPlan.currentDay) || sprintPlan.days[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Main Welcome & Target Horizon Banner */}
      <div className="art-card p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C95F48]">
              Your Career Goal
            </span>
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#293C3A] tracking-tight">
              Preparing for <span className="text-[#C95F48]">{diagnosis.targetRole}</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7169] leading-relaxed">
              Target company: <strong className="text-[#293C3A]">{diagnosis.targetCompany}</strong>
              {diagnosis.location && ` • ${diagnosis.location}`}
              {diagnosis.salary && ` • ${diagnosis.salary}`}
            </p>
            <p className="text-xs text-[#293C3A] leading-relaxed pt-1">
              {diagnosis.summary}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('sprint')}
              className="art-btn-primary px-4 py-2.5 text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Continue Learning</span>
            </button>
            <button
              onClick={() => onNavigate('interview')}
              className="art-btn-secondary px-4 py-2.5 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Practice Interview</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Role Match */}
        <div
          onClick={() => onNavigate('diagnosis')}
          className="art-card p-5 hover:border-[#C95F48] transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[#6B7169]">
            <span>Role Match</span>
            <Target className="w-4 h-4 text-[#D8B35F]" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-editorial text-3xl font-bold text-[#293C3A]">
              {diagnosis.roleFitScore}%
            </span>
            <span className="text-xs text-[#466E67] font-semibold">
              {diagnosis.matchPercentage}% match
            </span>
          </div>
          <div className="mt-3 w-full bg-[#E8EBDD] rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#C95F48] h-2 rounded-full transition-all duration-500"
              style={{ width: `${diagnosis.roleFitScore}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-[#6B7169]">
            {diagnosis.gapSkills.length} skills need attention
          </p>
        </div>

        {/* Sprint Progress */}
        <div
          onClick={() => onNavigate('sprint')}
          className="art-card p-5 hover:border-[#C95F48] transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[#6B7169]">
            <span>Learning Plan</span>
            <Calendar className="w-4 h-4 text-[#C95F48]" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-editorial text-3xl font-bold text-[#293C3A]">
              {sprintProgress}%
            </span>
            <span className="text-xs text-[#C95F48] font-semibold">
              Day {sprintPlan.currentDay} of {sprintPlan.days.length}
            </span>
          </div>
          <div className="mt-3 w-full bg-[#E8EBDD] rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#466E67] h-2 rounded-full transition-all duration-500"
              style={{ width: `${sprintProgress}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-[#6B7169]">
            {completedTasks} of {totalTasks} tasks completed
          </p>
        </div>

        {/* Skills Breakdown */}
        <div
          onClick={() => onNavigate('diagnosis')}
          className="art-card p-5 hover:border-[#C95F48] transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[#6B7169]">
            <span>Skills Audit</span>
            <Layers className="w-4 h-4 text-[#466E67]" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-editorial text-3xl font-bold text-[#293C3A]">
              {diagnosis.matchedSkills.length} / {diagnosis.matchedSkills.length + diagnosis.gapSkills.length}
            </span>
            <span className="text-xs text-[#466E67] font-semibold">Verified</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-[#6B7169]">
            <span className="px-2 py-0.5 rounded-md bg-[#E8EBDD] text-[#38564F] text-[11px] font-semibold">
              {diagnosis.matchedSkills.length} Matched
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#FAECE8] text-[#C95F48] text-[11px] font-semibold">
              {diagnosis.gapSkills.length} Gaps
            </span>
          </div>
          <p className="mt-2 text-[11px] text-[#6B7169]">Click to view full diagnosis</p>
        </div>

        {/* Job Applications */}
        <div
          onClick={() => onNavigate('tracker')}
          className="art-card p-5 hover:border-[#C95F48] transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[#6B7169]">
            <span>Job Tracker</span>
            <Briefcase className="w-4 h-4 text-[#D8B35F]" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-editorial text-3xl font-bold text-[#293C3A]">
              {applications.length}
            </span>
            <span className="text-xs text-[#6B7169]">Applications</span>
          </div>
          <div className="mt-3 text-xs text-[#6B7169]">
            <span>
              {applications.filter((a) => a.status === 'interviewing').length} currently interviewing
            </span>
          </div>
          <p className="mt-2 text-[11px] text-[#6B7169]">Click to view tracker</p>
        </div>
      </div>

      {/* 3. Two Main Workspace Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Skills Progress & Gaps (7 cols) */}
        <div className="lg:col-span-7 art-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#D9CFB9]">
            <div>
              <h2 className="font-editorial text-lg font-bold text-[#293C3A]">
                Key Skills for This Role
              </h2>
              <p className="text-xs text-[#6B7169]">
                Based on your resume and {diagnosis.targetRole} requirements
              </p>
            </div>
            <button
              onClick={() => onNavigate('diagnosis')}
              className="text-xs font-semibold text-[#C95F48] hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>Full audit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Matched Skills */}
            {diagnosis.matchedSkills.slice(0, 3).map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-xl bg-[#FFF7E8] border border-[#D9CFB9] flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#466E67] shrink-0" />
                    <span className="text-xs font-bold text-[#293C3A]">{s.skill}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#E8EBDD] text-[#38564F] font-semibold">
                      Matched
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B7169] line-clamp-1 pl-6">
                    {s.resumeEvidence}
                  </p>
                </div>
              </div>
            ))}

            {/* Gap Skills */}
            {diagnosis.gapSkills.slice(0, 3).map((g) => (
              <div
                key={g.id}
                className="p-3 rounded-xl bg-[#FFF7E8] border border-[#E58B70]/60 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-[#C95F48] shrink-0" />
                    <span className="text-xs font-bold text-[#293C3A]">{g.skill}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#FAECE8] text-[#C95F48] font-semibold">
                      Skills to Learn
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B7169] line-clamp-1 pl-6">
                    {g.actionItem || g.jdRequirement}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Today's Learning Tasks (5 cols) */}
        <div className="lg:col-span-5 art-card p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#D9CFB9]">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C95F48]">
                  Today's Tasks
                </span>
                <h3 className="font-editorial text-lg font-bold text-[#293C3A]">
                  Day {sprintPlan.currentDay}: {currentDayPlan?.theme}
                </h3>
              </div>
              <span className="text-xs text-[#6B7169] font-medium">
                {currentDayPlan?.tasks.filter((t) => t.completed).length} / {currentDayPlan?.tasks.length} done
              </span>
            </div>

            {currentDayPlan?.goal && (
              <p className="text-xs text-[#6B7169] leading-relaxed">
                <strong className="text-[#293C3A]">Goal:</strong> {currentDayPlan.goal}
              </p>
            )}

            {/* Tasks list */}
            <div className="space-y-2 pt-1">
              {currentDayPlan?.tasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="p-2.5 rounded-lg bg-[#E8EBDD]/60 border border-[#D9CFB9] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <div className={`w-2 h-2 rounded-full ${task.completed ? 'bg-[#466E67]' : 'bg-[#D8B35F]'}`} />
                    <span className={`truncate ${task.completed ? 'line-through text-[#6B7169]' : 'text-[#293C3A] font-medium'}`}>
                      {task.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#6B7169] shrink-0 pl-2">
                    {task.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('sprint')}
            className="art-btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer mt-4"
          >
            <span>Open Today's Learning Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
