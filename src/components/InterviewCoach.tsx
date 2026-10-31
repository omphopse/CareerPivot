import React, { useState } from 'react';
import {
  Headphones,
  Send,
  Sparkles,
  CheckCircle2,
  Mic,
  MicOff,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Award,
  Layers
} from 'lucide-react';
import type { InterviewQuestion, InterviewEvaluation, SprintPlan } from '../types';

interface InterviewCoachProps {
  sprintPlan: SprintPlan;
  questions: InterviewQuestion[];
  answersByQuestionId: Record<string, string>;
  evaluationsByQuestionId: Record<string, InterviewEvaluation>;
  evaluatingQuestionIds: string[];
  onUpdateAnswer: (questionId: string, answer: string) => void;
  onEvaluateAnswer: (question: InterviewQuestion, answer: string) => Promise<void>;
  onRecalibrateSprintPlan: (evaluation: InterviewEvaluation) => void;
  onNavigateToSprint: () => void;
  onUpdateQuestion: (questionId: string) => Promise<void>;
  onUpdateAllQuestions: () => Promise<void>;
}

export const InterviewCoach: React.FC<InterviewCoachProps> = ({
  sprintPlan,
  questions,
  answersByQuestionId,
  evaluationsByQuestionId,
  evaluatingQuestionIds,
  onUpdateAnswer,
  onEvaluateAnswer,
  onRecalibrateSprintPlan,
  onNavigateToSprint,
  onUpdateQuestion,
  onUpdateAllQuestions
}) => {
  const activeQuestions = questions && questions.length > 0 ? questions : [
    {
      id: 'iq-live-1',
      role: sprintPlan.targetRole || 'Target Role',
      category: 'Core System Architecture',
      difficulty: 'Senior' as const,
      question: `How do you architect high-scale, resilient microservices for ${sprintPlan.targetRole} handling concurrent data consistency?`,
      context: 'Tests understanding of distributed transactions, failure recovery, and concurrency.',
      keyPointsExpected: [
        'Idempotent processing and deduplication',
        'Database isolation levels and locking mechanisms',
        'Circuit breakers and rate limiting',
        'Transaction boundaries and event publishing'
      ]
    }
  ];

  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [showExpectedPoints, setShowExpectedPoints] = useState<boolean>(false);
  const [recalibratedSuccess, setRecalibratedSuccess] = useState<boolean>(false);
  const [isUpdatingQuestion, setIsUpdatingQuestion] = useState<boolean>(false);
  const [isUpdatingAll, setIsUpdatingAll] = useState<boolean>(false);

  const safeIndex = selectedSlotIndex < activeQuestions.length ? selectedSlotIndex : 0;
  const currentQ = activeQuestions[safeIndex];
  const isCurrentEvaluating = evaluatingQuestionIds.includes(currentQ.id);

  const currentEvaluation =
    evaluationsByQuestionId[currentQ.id] ||
    (currentQ.previousQuestion ? evaluationsByQuestionId[currentQ.previousQuestion.id] : null);

  const currentAnswer = answersByQuestionId[currentQ.id] || '';

  // Speech recognition dictation
  const handleToggleDictation = () => {
    if (isCurrentEvaluating) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your response.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        const updated = currentAnswer ? currentAnswer + ' ' + transcript : transcript;
        onUpdateAnswer(currentQ.id, updated);
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition error:', e);
      setIsRecording(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentAnswer.trim() || isCurrentEvaluating) return;
    setRecalibratedSuccess(false);
    await onEvaluateAnswer(currentQ, currentAnswer.trim());
  };

  const handleTriggerRecalibration = () => {
    if (!currentEvaluation) return;
    onRecalibrateSprintPlan(currentEvaluation);
    setRecalibratedSuccess(true);
  };

  const handleUpdateCurrentQ = async () => {
    setIsUpdatingQuestion(true);
    try {
      await onUpdateQuestion(currentQ.id);
    } finally {
      setIsUpdatingQuestion(false);
    }
  };

  const handleUpdateAll = async () => {
    setIsUpdatingAll(true);
    try {
      await onUpdateAllQuestions();
    } finally {
      setIsUpdatingAll(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#D9CFB9]">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#293C3A] flex items-center space-x-2">
            <Headphones className="w-6 h-6 text-[#C95F48]" />
            <span>Practice Interview</span>
          </h1>
          <p className="text-xs text-[#6B7169] mt-0.5">
            Answer questions tailored for {sprintPlan.targetRole} and get detailed feedback.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={handleUpdateCurrentQ}
            disabled={isUpdatingQuestion || isCurrentEvaluating}
            className="art-btn-secondary px-3 py-1.5 text-xs font-semibold flex items-center space-x-1 cursor-pointer disabled:opacity-50"
            title="Generate a fresh technical question for this slot"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingQuestion ? 'animate-spin' : ''}`} />
            <span>New Question</span>
          </button>

          <button
            onClick={handleUpdateAll}
            disabled={isUpdatingAll || isCurrentEvaluating}
            className="art-btn-secondary px-3 py-1.5 text-xs font-semibold flex items-center space-x-1 cursor-pointer disabled:opacity-50"
            title="Generate all 3 questions fresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingAll ? 'animate-spin' : ''}`} />
            <span>Regenerate All 3</span>
          </button>
        </div>
      </div>

      {/* Question Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {activeQuestions.map((q, idx) => {
          const isSelected = idx === safeIndex;
          const hasEvaluation = Boolean(evaluationsByQuestionId[q.id]);

          return (
            <button
              key={q.id || idx}
              onClick={() => setSelectedSlotIndex(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-[#C95F48] text-white shadow-xs'
                  : 'bg-[#FFF7E8] text-[#6B7169] hover:text-[#293C3A] border border-[#D9CFB9]'
              }`}
            >
              <span>Question {idx + 1}</span>
              {hasEvaluation && (
                <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#466E67]'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Two-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Question & Answer Editor (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Question Prompt Card */}
          <div className="art-card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#E8EBDD] text-[#38564F]">
                {currentQ.category}
              </span>
              <span className="text-[11px] text-[#6B7169] font-medium">
                {currentQ.difficulty} Level
              </span>
            </div>

            <h2 className="font-editorial text-lg sm:text-xl font-bold text-[#293C3A] leading-snug">
              {currentQ.question}
            </h2>

            {currentQ.context && (
              <p className="text-xs text-[#6B7169] leading-relaxed">
                <strong className="text-[#293C3A]">Scenario:</strong> {currentQ.context}
              </p>
            )}

            {/* Expected Points Toggle */}
            {currentQ.keyPointsExpected && currentQ.keyPointsExpected.length > 0 && (
              <div className="pt-2 border-t border-[#D9CFB9]">
                <button
                  type="button"
                  onClick={() => setShowExpectedPoints(!showExpectedPoints)}
                  className="flex items-center space-x-1 text-xs font-semibold text-[#466E67] hover:underline cursor-pointer"
                >
                  <span>What the interviewer expects</span>
                  {showExpectedPoints ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showExpectedPoints && (
                  <ul className="mt-2 space-y-1 text-xs text-[#6B7169] pl-4 list-disc">
                    {currentQ.keyPointsExpected.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Answer Editor */}
          <div className="art-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="answer-input" className="text-xs font-bold text-[#293C3A]">
                Your Response (Question {safeIndex + 1})
              </label>
              <span className="text-[11px] text-[#6B7169]">
                {currentAnswer.length} characters
              </span>
            </div>

            <textarea
              id="answer-input"
              rows={9}
              value={currentAnswer}
              onChange={(e) => onUpdateAnswer(currentQ.id, e.target.value)}
              placeholder="Type your response as you would speak it in an interview..."
              className="art-input w-full p-3.5 text-xs leading-relaxed"
            />

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleToggleDictation}
                disabled={isCurrentEvaluating}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border transition-colors cursor-pointer ${
                  isRecording
                    ? 'bg-[#FAECE8] border-[#E58B70] text-[#C95F48]'
                    : 'bg-[#FFF7E8] border-[#D9CFB9] text-[#6B7169] hover:text-[#293C3A]'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isRecording ? 'Stop Recording' : 'Voice Input'}</span>
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isCurrentEvaluating || !currentAnswer.trim()}
                className="art-btn-primary px-5 py-2 text-xs font-bold flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {isCurrentEvaluating ? (
                  <span>Evaluating...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Get AI Feedback</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Feedback & Model Answer (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {isCurrentEvaluating ? (
            <div className="art-card p-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-10 h-10 rounded-full border-3 border-[#C95F48]/20 border-t-[#C95F48] animate-spin" />
              <div className="font-editorial text-base font-bold text-[#293C3A]">
                Evaluating Your Answer
              </div>
              <p className="text-xs text-[#6B7169] max-w-xs">
                Reviewing technical depth, structure, and clarity...
              </p>
            </div>
          ) : currentEvaluation ? (
            <div className="art-card p-6 space-y-5">
              {/* Score Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#D9CFB9]">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-[#C95F48]" />
                  <span className="font-editorial text-xl font-bold text-[#293C3A]">
                    Feedback &amp; Scoring
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                    currentEvaluation.verdict === 'Pass'
                      ? 'bg-[#E8EBDD] text-[#38564F]'
                      : 'bg-[#FAECE8] text-[#C95F48]'
                  }`}>
                    {currentEvaluation.verdict}
                  </span>
                  <div className="text-sm font-bold px-3 py-1 rounded-lg bg-[#E8EBDD] text-[#38564F]">
                    Score: {currentEvaluation.score} / 100
                  </div>
                </div>
              </div>

              {/* Rubric Breakdown */}
              {currentEvaluation.rubrics && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-[#E8EBDD]/50 border border-[#D9CFB9]">
                    <span className="text-[10px] text-[#6B7169] block">Tech Depth</span>
                    <strong className="text-[#293C3A]">{currentEvaluation.rubrics.technicalDepth}%</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#E8EBDD]/50 border border-[#D9CFB9]">
                    <span className="text-[10px] text-[#6B7169] block">Architecture</span>
                    <strong className="text-[#293C3A]">{currentEvaluation.rubrics.systemArchitecture}%</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#E8EBDD]/50 border border-[#D9CFB9]">
                    <span className="text-[10px] text-[#6B7169] block">Clarity</span>
                    <strong className="text-[#293C3A]">{currentEvaluation.rubrics.clarity}%</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#E8EBDD]/50 border border-[#D9CFB9]">
                    <span className="text-[10px] text-[#6B7169] block">Evidence</span>
                    <strong className="text-[#293C3A]">{currentEvaluation.rubrics.evidenceAndExamples}%</strong>
                  </div>
                </div>
              )}

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {currentEvaluation.strongPoints && currentEvaluation.strongPoints.length > 0 && (
                  <div className="p-3 rounded-xl bg-[#E8EBDD]/60 border border-[#C5D5BE] space-y-1">
                    <span className="font-bold text-[#38564F] block">Strong Points:</span>
                    <ul className="space-y-1 text-[#293C3A] pl-3 list-disc">
                      {currentEvaluation.strongPoints.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentEvaluation.improvementAreas && currentEvaluation.improvementAreas.length > 0 && (
                  <div className="p-3 rounded-xl bg-[#FAECE8]/60 border border-[#E58B70]/50 space-y-1">
                    <span className="font-bold text-[#C95F48] block">Areas to Improve:</span>
                    <ul className="space-y-1 text-[#293C3A] pl-3 list-disc">
                      {currentEvaluation.improvementAreas.map((im, i) => (
                        <li key={i}>{im}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Model Answer */}
              {currentEvaluation.suggestedAnswer && (
                <div className="space-y-2 pt-2 border-t border-[#D9CFB9]">
                  <span className="text-xs font-bold text-[#293C3A] flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#D8B35F]" />
                    <span>Suggested Model Response</span>
                  </span>
                  <div className="p-3.5 rounded-xl bg-[#F5EBD6] border border-[#D9CFB9] text-xs text-[#293C3A] leading-relaxed">
                    {currentEvaluation.suggestedAnswer}
                  </div>
                </div>
              )}

              {/* Recalibrate Sprint Plan CTA */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleTriggerRecalibration}
                  className="art-btn-secondary px-3.5 py-2 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-[#C95F48]" />
                  <span>Update Learning Plan with this Feedback</span>
                </button>

                {recalibratedSuccess && (
                  <span className="text-xs text-[#466E67] font-semibold">
                    Plan updated!
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="art-card p-10 flex flex-col items-center justify-center text-center space-y-3">
              <Headphones className="w-8 h-8 text-[#D9CFB9]" />
              <h3 className="font-editorial text-base font-bold text-[#293C3A]">
                No Feedback Yet
              </h3>
              <p className="text-xs text-[#6B7169] max-w-xs leading-relaxed">
                Type your answer on the left and click <strong>Get AI Feedback</strong> to see detailed scoring and a model response.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
