import React, { useState } from 'react';
import {
  Headphones,
  Mic,
  MicOff,
  Sparkles,
  Send,
  AlertOctagon,
  Award,
  Zap,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Lock,
  CheckCircle2,
  Clock
} from 'lucide-react';
import type {
  InterviewQuestion,
  InterviewEvaluation,
  SprintPlan
} from '../types';

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
  onNavigateToSprint
}) => {
  const activeQuestions = questions && questions.length > 0 ? questions : [
    {
      id: 'iq-live-1',
      role: sprintPlan.targetRole || 'Target Role',
      category: 'Core System Architecture',
      difficulty: 'Senior' as const,
      question: `How do you architect high-scale, resilient microservices for ${sprintPlan.targetRole} handling concurrent data consistency?`,
      context: 'Tests deep architectural knowledge of distributed transactions, failure recovery, and concurrency.',
      keyPointsExpected: [
        'Idempotent processing and deduplication',
        'Database isolation levels and locking mechanisms',
        'Circuit breakers and rate limiting',
        'Transaction boundaries and event publishing'
      ]
    }
  ];

  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(activeQuestions[0].id);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [showExpectedPoints, setShowExpectedPoints] = useState<boolean>(false);
  const [recalibratedSuccess, setRecalibratedSuccess] = useState<boolean>(false);

  const currentQ = activeQuestions.find((q) => q.id === selectedQuestionId) || activeQuestions[0];
  const isCurrentEvaluating = evaluatingQuestionIds.includes(currentQ.id);
  const currentEvaluation = evaluationsByQuestionId[currentQ.id] || null;
  const currentAnswer = answersByQuestionId[currentQ.id] || '';

  // Web Speech API dictation
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
    if (!currentAnswer.trim() || isCurrentEvaluating) {
      return;
    }
    setRecalibratedSuccess(false);
    await onEvaluateAnswer(currentQ, currentAnswer.trim());
  };

  const handleTriggerRecalibration = () => {
    if (!currentEvaluation) return;
    onRecalibrateSprintPlan(currentEvaluation);
    setRecalibratedSuccess(true);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Headphones className="w-5 h-5" />
            </div>
            <span>AI Technical Interview Coach & Rubric Evaluator</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Questions generated for {sprintPlan.targetRole}. Each question maintains its own independent evaluation.
          </p>
        </div>

        {/* Question Selector dropdown / pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          {activeQuestions.map((q, idx) => {
            const isEvaluatingThis = evaluatingQuestionIds.includes(q.id);
            const hasEval = Boolean(evaluationsByQuestionId[q.id]);
            const evalScore = evaluationsByQuestionId[q.id]?.score;

            return (
              <button
                key={q.id || idx}
                onClick={() => {
                  setSelectedQuestionId(q.id);
                  setRecalibratedSuccess(false);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedQuestionId === q.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>Q{idx + 1}</span>
                {isEvaluatingThis && (
                  <RefreshCw className="w-3 h-3 text-amber-300 animate-spin" />
                )}
                {!isEvaluatingThis && hasEval && (
                  <span
                    className={`px-1 rounded text-[10px] font-bold ${
                      evalScore! >= 75
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : evalScore! >= 50
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {evalScore}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Cols: Question Card & Answer Input */}
        <div className="lg:col-span-6 space-y-6">
          {/* Question Prompt Card */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                  {currentQ.difficulty.toUpperCase()} LEVEL
                </span>
                <span className="text-xs text-slate-400 font-medium">{currentQ.category}</span>
              </div>
              <span className="text-[11px] text-cyan-400 font-semibold">{currentQ.role}</span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
              {currentQ.question}
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <strong className="text-amber-400">Context & Scenario: </strong>
              {currentQ.context}
            </p>

            {/* Collapsible Key Concepts Hint */}
            <div className="pt-1">
              <button
                onClick={() => setShowExpectedPoints(!showExpectedPoints)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center space-x-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                <span>{showExpectedPoints ? 'Hide Expected Key Concepts' : 'Show Expected Key Concepts'}</span>
                {showExpectedPoints ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showExpectedPoints && (
                <ul className="mt-2.5 space-y-1.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
                  {currentQ.keyPointsExpected.map((point, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Answer Input Box */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 relative">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <span>Your Technical Response (Q{activeQuestions.findIndex((q) => q.id === currentQ.id) + 1})</span>
              </label>
              <span className="text-[11px] text-slate-500">{currentAnswer.length} characters</span>
            </div>

            {/* Locked alert if evaluating */}
            {isCurrentEvaluating && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center space-x-2 text-xs text-amber-200">
                <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Evaluation in progress. Answer is locked while Gemini grades your response.</span>
              </div>
            )}

            <textarea
              rows={8}
              disabled={isCurrentEvaluating}
              value={currentAnswer}
              onChange={(e) => onUpdateAnswer(currentQ.id, e.target.value)}
              placeholder="Explain your architectural approach, concurrency patterns, edge cases, and code structure..."
              className={`w-full p-4 rounded-xl bg-slate-950 border text-slate-200 text-xs sm:text-sm leading-relaxed focus:outline-none transition-colors ${
                isCurrentEvaluating
                  ? 'border-amber-500/40 opacity-70 cursor-not-allowed'
                  : 'border-slate-800 focus:border-indigo-500'
              }`}
            />

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                disabled={isCurrentEvaluating}
                onClick={handleToggleDictation}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  isRecording
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                    : isCurrentEvaluating
                    ? 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isRecording ? 'Listening...' : 'Voice Dictate'}</span>
              </button>

              <button
                onClick={handleSubmit}
                disabled={isCurrentEvaluating || !currentAnswer.trim()}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isCurrentEvaluating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Grading Q{activeQuestions.findIndex((q) => q.id === currentQ.id) + 1}...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{currentEvaluation ? 'Re-Evaluate with AI Rubrics' : 'Evaluate with AI Rubrics'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Evaluation Section Strictly for Current Question */}
        <div className="lg:col-span-6 space-y-6">
          {/* Active In-Progress Evaluating State */}
          {isCurrentEvaluating ? (
            <div className="glass-panel p-8 rounded-3xl h-full flex flex-col items-center justify-center text-center space-y-4 border border-amber-500/30 animate-pulse">
              <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
              <div className="max-w-xs space-y-2">
                <h3 className="text-base font-bold text-white">Grading Question {activeQuestions.findIndex((q) => q.id === currentQ.id) + 1}</h3>
                <p className="text-xs text-amber-200">
                  Gemini is evaluating your answer against technical depth, system architecture, clarity, and evidence rubrics.
                </p>
                <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  💡 You can freely navigate to other questions or tabs—this evaluation will complete in the background and update automatically.
                </p>
              </div>
            </div>
          ) : currentEvaluation ? (
            /* Evaluated Result Specifically for This Question */
            <div className="glass-panel p-6 rounded-3xl space-y-6 border border-indigo-500/30 relative overflow-hidden animate-fadeIn">
              {/* Header with Score & Verdict */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    AI Rubric Evaluation for Question {activeQuestions.findIndex((q) => q.id === currentQ.id) + 1}
                  </span>
                  <div className="flex items-baseline space-x-3 mt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white">
                      {currentEvaluation.score}
                      <span className="text-sm font-normal text-slate-400">/100</span>
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        currentEvaluation.verdict === 'Pass'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : currentEvaluation.verdict === 'Needs Improvement'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {currentEvaluation.verdict}
                    </span>
                  </div>
                </div>

                {/* Recalibrate Sprint CTA button */}
                <button
                  onClick={handleTriggerRecalibration}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    recalibratedSuccess
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-md shadow-amber-500/20'
                  }`}
                  title="Dynamically modifies sprint plan based on this evaluation"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{recalibratedSuccess ? '✓ Sprint Extended!' : 'Sync Weakness & Extend Sprint'}</span>
                </button>
              </div>

              {/* 4 Rubric Category Bars */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Scoring Rubric Breakdown
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Technical Depth</span>
                      <span className="font-bold text-white">{currentEvaluation.rubrics.technicalDepth}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-1.5 rounded-full"
                        style={{ width: `${currentEvaluation.rubrics.technicalDepth}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">System Architecture</span>
                      <span className="font-bold text-white">{currentEvaluation.rubrics.systemArchitecture}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-cyan-500 h-1.5 rounded-full"
                        style={{ width: `${currentEvaluation.rubrics.systemArchitecture}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Clarity & Structure</span>
                      <span className="font-bold text-white">{currentEvaluation.rubrics.clarity}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-500 h-1.5 rounded-full"
                        style={{ width: `${currentEvaluation.rubrics.clarity}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Evidence & Guarantees</span>
                      <span className="font-bold text-white">{currentEvaluation.rubrics.evidenceAndExamples}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full"
                        style={{ width: `${currentEvaluation.rubrics.evidenceAndExamples}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Identified Weak Topics Tagged */}
              {currentEvaluation.weakTopics.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-1">
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>Identified Weak Topics to Bridge</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentEvaluation.weakTopics.map((topic, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/15 border border-rose-500/30 text-rose-300"
                      >
                        ⚠️ {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Critical Improvement Areas */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Improvement Areas & Gaps
                </h3>
                <ul className="space-y-1.5 text-xs">
                  {currentEvaluation.improvementAreas.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-slate-300">
                      <span className="text-rose-400 font-bold shrink-0 mt-0.5">✕</span>
                      <span className="leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suggested Senior Answer Box */}
              <div className="space-y-2 p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs">
                <div className="text-xs font-bold text-indigo-300 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Gold-Standard Senior Answer</span>
                </div>
                <p className="text-slate-200 leading-relaxed italic">{currentEvaluation.suggestedAnswer}</p>
              </div>

              {recalibratedSuccess && (
                <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
                  <div className="space-y-0.5">
                    <span className="font-bold flex items-center space-x-1 text-amber-300">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Sprint Dynamically Extended!</span>
                    </span>
                    <p className="text-[11px] text-slate-300">
                      Added Day {sprintPlan.days.length} dedicated to remedial practice for {currentEvaluation.weakTopics[0] || 'this weakness'}.
                    </p>
                  </div>
                  <button
                    onClick={onNavigateToSprint}
                    className="font-bold underline text-amber-300 hover:text-white flex items-center space-x-1 cursor-pointer shrink-0 ml-3"
                  >
                    <span>View Day {sprintPlan.days.length}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Empty State: Shown when this specific question has NOT been evaluated yet */
            <div className="glass-panel p-8 rounded-3xl h-full flex flex-col items-center justify-center text-center space-y-4 text-slate-400 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400">
                <Award className="w-8 h-8" />
              </div>
              <div className="max-w-xs space-y-1.5">
                <h3 className="text-base font-bold text-white">No Evaluation for Question {activeQuestions.findIndex((q) => q.id === currentQ.id) + 1} Yet</h3>
                <p className="text-xs text-slate-400">
                  Type your technical answer on the left or use voice dictation and click <strong className="text-indigo-300">Evaluate with AI Rubrics</strong> to grade this question.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
