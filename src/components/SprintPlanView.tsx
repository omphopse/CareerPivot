import React, { useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Circle,
  ExternalLink,
  Award,
  HelpCircle,
  Zap,
  Clock,
  Sparkles,
  BookOpen,
  Check,
  ArrowRight,
  TrendingUp,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { SprintPlan, DailyQuiz } from '../types';

interface SprintPlanViewProps {
  sprintPlan: SprintPlan;
  onUpdatePlan: (updatedPlan: SprintPlan) => void;
  onNavigateToInterview: () => void;
}

export const SprintPlanView: React.FC<SprintPlanViewProps> = ({
  sprintPlan,
  onUpdatePlan,
  onNavigateToInterview
}) => {
  const [selectedDayNum, setSelectedDayNum] = useState<number>(sprintPlan.currentDay || 1);
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  const totalDays = sprintPlan.days.length;
  const activeDay = sprintPlan.days.find((d) => d.dayNumber === selectedDayNum) || sprintPlan.days[0];

  // Toggle task completion
  const handleToggleTask = (taskId: string) => {
    const updatedDays = sprintPlan.days.map((day) => {
      if (day.dayNumber === selectedDayNum) {
        const updatedTasks = day.tasks.map((t) => {
          if (t.id === taskId) {
            const nextCompleted = !t.completed;
            if (nextCompleted) {
              confetti({
                particleCount: 40,
                spread: 60,
                origin: { y: 0.7 }
              });
            }
            return { ...t, completed: nextCompleted };
          }
          return t;
        });

        const allTasksDone = updatedTasks.every((t) => t.completed);
        return {
          ...day,
          tasks: updatedTasks,
          completed: allTasksDone
        };
      }
      return day;
    });

    const newPlan: SprintPlan = {
      ...sprintPlan,
      days: updatedDays
    };

    onUpdatePlan(newPlan);
  };

  // Handle Quiz Submission
  const handleQuizSubmit = (quiz: DailyQuiz) => {
    if (quizSelectedOption === null) return;
    setQuizSubmitted(true);

    const isCorrect = quizSelectedOption === quiz.correctIndex;
    if (isCorrect) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });

      // Boost mastery
      const updatedMastery = { ...sprintPlan.masteryScores };
      const keys = Object.keys(updatedMastery);
      if (keys.length > 0) {
        const targetKey = keys[Math.min(selectedDayNum - 1, keys.length - 1)];
        updatedMastery[targetKey] = Math.min(100, (updatedMastery[targetKey] || 40) + 12);
      }

      onUpdatePlan({
        ...sprintPlan,
        masteryScores: updatedMastery
      });
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Title & Stats Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <span>Adaptive Sprint Plan ({totalDays} Days) & Skill Mastery</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamically calibrated timeline for {sprintPlan.targetRole} based on candidate gap depth
          </p>
        </div>

        <button
          onClick={onNavigateToInterview}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <span>AI Mock Interview Round</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Duration Rationale Banner */}
      {sprintPlan.durationRationale && (
        <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-start space-x-3.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Calibrated Sprint Duration: {totalDays} Days
            </span>
            <p className="text-xs text-slate-200 leading-relaxed">{sprintPlan.durationRationale}</p>
          </div>
        </div>
      )}

      {/* Adaptive Recalibration Alert Banner (if any) */}
      {sprintPlan.adaptiveLogs.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-indigo-950/40 border border-amber-500/30 flex items-start space-x-3.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Adaptive Engine Active
              </span>
              <span className="text-[11px] text-amber-400/80">• {sprintPlan.adaptiveLogs[0].timestamp}</span>
            </div>
            <p className="text-xs text-slate-200">{sprintPlan.adaptiveLogs[0].reason}</p>
            <p className="text-xs text-slate-400 italic">{sprintPlan.adaptiveLogs[0].changeSummary}</p>
          </div>
        </div>
      )}

      {/* Variable-Day Timeline Pill Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Sprint Timeline: Select Day</span>
          <span>{sprintPlan.days.filter((d) => d.completed).length} of {totalDays} Days Completed</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2.5">
          {sprintPlan.days.map((day) => {
            const isSelected = day.dayNumber === selectedDayNum;
            const isDone = day.completed;
            const isRecalibrated = day.theme.includes('RECALIBRATED') || day.isNewlyAdded;

            return (
              <button
                key={day.dayNumber}
                onClick={() => {
                  setSelectedDayNum(day.dayNumber);
                  setQuizSelectedOption(null);
                  setQuizSubmitted(false);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-indigo-950/80 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                {isRecalibrated && (
                  <div
                    className="absolute top-0 right-0 px-1.5 py-0.5 rounded-bl text-[8px] font-bold bg-amber-400 text-slate-950"
                    title="Adaptive Day Added by AI Coach"
                  >
                    AI+
                  </div>
                )}
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className={`font-bold ${isSelected ? 'text-indigo-300' : 'text-slate-400'}`}>
                    Day {day.dayNumber}
                  </span>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </div>
                <p className="text-[11px] font-semibold text-white line-clamp-2 leading-snug">
                  {day.theme.replace('⚡ EXTENDED SPRINT: ', '').replace('⚡ RECALIBRATED: ', '')}
                </p>
                <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>{day.tasks.filter((t) => t.completed).length}/{day.tasks.length} tasks</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Day Theme & Tasks Checklist */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                  DAY {activeDay.dayNumber} OF {totalDays}
                </span>
                {activeDay.isNewlyAdded && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 animate-pulse">
                    ⚡ Extended Day from Mock Interview
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400">
                {activeDay.tasks.filter((t) => t.completed).length} of {activeDay.tasks.length} tasks completed
              </span>
            </div>

            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>{activeDay.theme}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              <strong className="text-cyan-400">Sprint Goal: </strong>
              {activeDay.goal}
            </p>
          </div>

          {/* Tasks List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 px-1">
              Deliverables & Action Items ({activeDay.tasks.length})
            </h3>

            {activeDay.tasks.map((task) => (
              <div
                key={task.id}
                className={`glass-panel p-5 rounded-2xl border transition-all ${
                  task.completed
                    ? 'border-emerald-500/30 bg-emerald-950/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className="mt-1 text-slate-500 hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
                  >
                    {task.completed ? (
                      <div className="w-5 h-5 rounded-md bg-emerald-500 text-slate-950 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-md border-2 border-slate-600 hover:border-emerald-400 transition-colors" />
                    )}
                  </button>

                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4
                        className={`text-sm font-bold ${
                          task.completed ? 'text-slate-400 line-through' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="flex items-center space-x-1 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          <span>{task.duration}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                          {task.type}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{task.description}</p>

                    {/* Deliverable Box */}
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs">
                      <strong className="text-amber-300">Deliverable: </strong>
                      <span className="text-slate-300">{task.deliverable}</span>
                    </div>

                    {/* Resource link */}
                    {task.resource && (
                      <div className="pt-1">
                        <a
                          href={task.resource.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 hover:underline"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>{task.resource.title}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Daily Conceptual Quiz & Mastery Widget */}
        <div className="space-y-6">
          {/* Daily Quiz Card */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>DAY {activeDay.dayNumber} MINI-QUIZ</span>
              </span>
              <span className="text-xs text-slate-400">+12% Mastery</span>
            </div>

            <h3 className="text-sm font-bold text-white leading-snug">{activeDay.quiz.question}</h3>

            {/* Quiz Options */}
            <div className="space-y-2 pt-1">
              {activeDay.quiz.options.map((option, idx) => {
                const isSelected = quizSelectedOption === idx;
                const isCorrect = idx === activeDay.quiz.correctIndex;

                let optionStyles = 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300';
                if (quizSubmitted) {
                  if (isCorrect) {
                    optionStyles = 'bg-emerald-950/60 border-emerald-500 text-emerald-200';
                  } else if (isSelected && !isCorrect) {
                    optionStyles = 'bg-rose-950/60 border-rose-500 text-rose-200';
                  }
                } else if (isSelected) {
                  optionStyles = 'bg-indigo-950 border-indigo-500 text-white';
                }

                return (
                  <button
                    key={idx}
                    disabled={quizSubmitted}
                    onClick={() => setQuizSelectedOption(idx)}
                    className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-start space-x-2.5 cursor-pointer ${optionStyles}`}
                  >
                    <span className="font-mono text-slate-500 text-[11px] mt-0.5">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span className="leading-snug">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Submit or Explanation */}
            {!quizSubmitted ? (
              <button
                onClick={() => handleQuizSubmit(activeDay.quiz)}
                disabled={quizSelectedOption === null}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white transition-all shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-40"
              >
                Submit Answer
              </button>
            ) : (
              <div
                className={`p-3.5 rounded-xl text-xs space-y-1.5 border ${
                  quizSelectedOption === activeDay.quiz.correctIndex
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="font-bold flex items-center space-x-1.5">
                  {quizSelectedOption === activeDay.quiz.correctIndex ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Correct! Mastery score updated.</span>
                    </>
                  ) : (
                    <>
                      <HelpCircle className="w-4 h-4 text-rose-400" />
                      <span>Review Concept:</span>
                    </>
                  )}
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">{activeDay.quiz.explanation}</p>
              </div>
            )}
          </div>

          {/* Mastery Progress Card */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-indigo-400" />
              <span>Skill Mastery Tracking</span>
            </h3>

            <div className="space-y-3">
              {Object.entries(sprintPlan.masteryScores).map(([skill, score]) => (
                <div key={skill} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 truncate max-w-[180px]">{skill}</span>
                    <span className="font-bold text-white">{score}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        score < 40 ? 'bg-rose-500' : score < 75 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
