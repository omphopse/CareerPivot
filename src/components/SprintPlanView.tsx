import React, { useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Layers
} from 'lucide-react';
import type { SprintPlan, DailyQuiz } from '../types';
import confetti from 'canvas-confetti';

interface SprintPlanViewProps {
  sprintPlan: SprintPlan;
  onUpdatePlan: (updated: SprintPlan) => void;
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
  const currentDay = sprintPlan.days.find((d) => d.dayNumber === selectedDayNum) || sprintPlan.days[0];

  // Progress metrics
  const totalTasks = sprintPlan.days.reduce((acc, d) => acc + d.tasks.length, 0);
  const completedTasks = sprintPlan.days.reduce(
    (acc, d) => acc + d.tasks.filter((t) => t.completed).length,
    0
  );
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const completedDaysCount = sprintPlan.days.filter((d) => d.completed).length;

  // Toggle Task Completion
  const handleToggleTask = (dayNumber: number, taskId: string) => {
    const updatedDays = sprintPlan.days.map((day) => {
      if (day.dayNumber === dayNumber) {
        let nextCompleted = false;
        const updatedTasks = day.tasks.map((t) => {
          if (t.id === taskId) {
            nextCompleted = !t.completed;
            if (nextCompleted) {
              confetti({
                particleCount: 50,
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

    onUpdatePlan({
      ...sprintPlan,
      days: updatedDays
    });
  };

  // Handle Quiz Submission
  const handleQuizSubmit = (quiz: DailyQuiz) => {
    if (quizSelectedOption === null) return;
    setQuizSubmitted(true);

    const isCorrect = quizSelectedOption === quiz.correctIndex;
    if (isCorrect) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Boost mastery
      const updatedMastery = { ...sprintPlan.masteryScores };
      const keys = Object.keys(updatedMastery);
      if (keys.length > 0) {
        const targetKey = keys[Math.min(selectedDayNum - 1, keys.length - 1)];
        updatedMastery[targetKey] = Math.min(100, (updatedMastery[targetKey] || 40) + 10);
      }

      onUpdatePlan({
        ...sprintPlan,
        masteryScores: updatedMastery
      });
    }
  };

  const handlePrevDay = () => {
    if (selectedDayNum > 1) {
      setSelectedDayNum(selectedDayNum - 1);
      setQuizSelectedOption(null);
      setQuizSubmitted(false);
    }
  };

  const handleNextDay = () => {
    if (selectedDayNum < totalDays) {
      setSelectedDayNum(selectedDayNum + 1);
      setQuizSelectedOption(null);
      setQuizSubmitted(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#D9CFB9]">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#293C3A] flex items-center space-x-2">
            <CalendarCheck className="w-6 h-6 text-[#C95F48]" />
            <span>Your Career Plan</span>
          </h1>
          <p className="text-xs text-[#6B7169] mt-0.5">
            A {totalDays}-day plan tailored to help you prepare for {sprintPlan.targetRole}.
          </p>
        </div>

        <button
          onClick={onNavigateToInterview}
          className="art-btn-primary px-4 py-2 text-xs font-bold flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
        >
          <span>Practice Interview</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress Summary Card */}
      <div className="art-card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
          <div>
            <span className="text-xs font-semibold text-[#6B7169]">Overall Plan Progress</span>
            <div className="font-editorial text-2xl font-bold text-[#293C3A]">
              {progressPercent}% Complete
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#6B7169]">
            <span>{completedTasks} of {totalTasks} tasks done</span>
            <span>•</span>
            <span>{completedDaysCount} of {totalDays} days finished</span>
          </div>
        </div>

        <div className="w-full bg-[#E8EBDD] rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-[#C95F48] h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Day Selector Navigation */}
      <div className="art-card p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handlePrevDay}
            disabled={selectedDayNum === 1}
            className="p-1.5 rounded-lg text-[#6B7169] hover:text-[#293C3A] hover:bg-[#E8EBDD] disabled:opacity-30 cursor-pointer"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Horizontal Day Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 px-1">
            {sprintPlan.days.map((day) => {
              const isSelected = day.dayNumber === selectedDayNum;
              const isDone = day.completed;

              return (
                <button
                  key={day.dayNumber}
                  onClick={() => {
                    setSelectedDayNum(day.dayNumber);
                    setQuizSelectedOption(null);
                    setQuizSubmitted(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 flex items-center space-x-1.5 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#C95F48] text-white shadow-xs'
                      : isDone
                      ? 'bg-[#E8EBDD] text-[#38564F] hover:bg-[#D9CFB9]'
                      : 'bg-[#FFF7E8] text-[#6B7169] hover:text-[#293C3A] border border-[#D9CFB9]'
                  }`}
                >
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-[#466E67]" />}
                  <span>Day {day.dayNumber}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNextDay}
            disabled={selectedDayNum === totalDays}
            className="p-1.5 rounded-lg text-[#6B7169] hover:text-[#293C3A] hover:bg-[#E8EBDD] disabled:opacity-30 cursor-pointer"
            aria-label="Next day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Selected Day Focus Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Day Tasks List (7 cols) */}
        <div className="lg:col-span-7 art-card p-6 space-y-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C95F48]">
              Day {currentDay.dayNumber} of {totalDays}
            </span>
            <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#293C3A]">
              {currentDay.theme}
            </h2>
            {currentDay.goal && (
              <p className="text-xs text-[#6B7169] mt-1 leading-relaxed">
                <strong className="text-[#293C3A]">Goal:</strong> {currentDay.goal}
              </p>
            )}
          </div>

          {/* Tasks Checklist */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7169]">
              Tasks to Complete ({currentDay.tasks.filter((t) => t.completed).length} / {currentDay.tasks.length})
            </h3>

            {currentDay.tasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all ${
                  task.completed
                    ? 'bg-[#E8EBDD]/50 border-[#C5D5BE]'
                    : 'bg-[#FFF7E8] border-[#D9CFB9]'
                }`}
              >
                {/* Top Row: Checkbox + Title + Duration */}
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => handleToggleTask(currentDay.dayNumber, task.id)}
                    className="flex items-start space-x-2.5 text-left cursor-pointer flex-1 group"
                  >
                    <div className="mt-0.5 shrink-0">
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-[#466E67]" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#D9CFB9] group-hover:text-[#C95F48]" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-bold leading-snug ${
                        task.completed ? 'line-through text-[#6B7169]' : 'text-[#293C3A]'
                      }`}
                    >
                      {task.title}
                    </span>
                  </button>

                  <span className="text-[11px] font-medium text-[#6B7169] flex items-center space-x-1 shrink-0 bg-[#F5EBD6] px-2 py-0.5 rounded-md border border-[#D9CFB9]/60">
                    <Clock className="w-3 h-3 text-[#C95F48]" />
                    <span>{task.duration}</span>
                  </span>
                </div>

                {/* Body: Description & Deliverable (Indented to align under title) */}
                <div className="pl-7 pt-1.5 space-y-2">
                  <p className="text-[11px] text-[#6B7169] leading-relaxed">
                    {task.description}
                  </p>

                  {task.deliverable && (
                    <div className="text-[11px] text-[#293C3A] bg-[#F5EBD6] p-2.5 rounded-lg border border-[#D9CFB9]/60">
                      <strong className="text-[#C95F48]">Deliverable:</strong> {task.deliverable}
                    </div>
                  )}

                  {/* Resource Link (Full width dedicated row) */}
                  {task.resource && (
                    <div className="pt-1 flex items-center">
                      <a
                        href={task.resource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 text-[11px] font-semibold text-[#466E67] hover:text-[#293C3A] hover:underline bg-[#E8EBDD]/60 hover:bg-[#E8EBDD] px-2.5 py-1 rounded-md border border-[#C5D5BE] transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[220px] sm:max-w-md">
                          {task.resource.title || 'Resource Guide'}
                        </span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Quiz & Mastery Tracking (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Daily Quiz */}
          {currentDay.quiz ? (
            <div className="art-card p-6 space-y-4">
              <div className="flex items-center space-x-2 text-xs font-semibold text-[#C95F48]">
                <HelpCircle className="w-4 h-4" />
                <span>Day {currentDay.dayNumber} Quick Check</span>
              </div>

              <h3 className="font-editorial text-sm font-bold text-[#293C3A] leading-snug">
                {currentDay.quiz.question}
              </h3>

              <div className="space-y-2">
                {currentDay.quiz.options.map((opt, idx) => {
                  const isSelected = quizSelectedOption === idx;
                  const isCorrect = idx === currentDay.quiz!.correctIndex;
                  const showResult = quizSubmitted;

                  let optionStyle = 'bg-[#FFF7E8] border-[#D9CFB9] text-[#293C3A] hover:bg-[#E8EBDD]';
                  if (isSelected && !showResult) {
                    optionStyle = 'bg-[#C95F48] text-white border-[#C95F48]';
                  } else if (showResult) {
                    if (isCorrect) {
                      optionStyle = 'bg-[#E8EBDD] border-[#466E67] text-[#293C3A] font-semibold';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'bg-[#FAECE8] border-[#E58B70] text-[#B54E38]';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={quizSubmitted}
                      onClick={() => setQuizSelectedOption(idx)}
                      className={`w-full p-3 rounded-xl border text-xs text-left transition-colors cursor-pointer disabled:cursor-default flex items-start space-x-2 ${optionStyle}`}
                    >
                      <span className="font-bold shrink-0">{String.fromCharCode(65 + idx)}.</span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {!quizSubmitted ? (
                <button
                  onClick={() => handleQuizSubmit(currentDay.quiz!)}
                  disabled={quizSelectedOption === null}
                  className="art-btn-primary w-full py-2.5 text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  Check Answer
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-[#E8EBDD] border border-[#C5D5BE] text-xs space-y-1">
                  <div className="font-bold text-[#38564F]">
                    {quizSelectedOption === currentDay.quiz.correctIndex ? 'Correct! Well done.' : 'Review this concept:'}
                  </div>
                  <p className="text-[#293C3A] leading-relaxed">
                    {currentDay.quiz.explanation}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="art-card p-6 text-center text-xs text-[#6B7169]">
              Complete the day's tasks to solidify your understanding.
            </div>
          )}

          {/* Skill Mastery Scores */}
          {sprintPlan.masteryScores && Object.keys(sprintPlan.masteryScores).length > 0 && (
            <div className="art-card p-6 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#D9CFB9]">
                <h4 className="text-xs font-bold text-[#293C3A] flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#466E67]" />
                  <span>Skill Progress</span>
                </h4>
                <span className="text-[11px] text-[#6B7169]">Updated live</span>
              </div>

              <div className="space-y-2.5">
                {Object.entries(sprintPlan.masteryScores).map(([skill, score]) => (
                  <div key={skill} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#293C3A] font-medium truncate max-w-[200px]">{skill}</span>
                      <span className="font-bold text-[#293C3A]">{score}%</span>
                    </div>
                    <div className="w-full bg-[#E8EBDD] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#C95F48] h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
