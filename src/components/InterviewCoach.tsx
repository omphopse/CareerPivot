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
  ChevronUp
} from 'lucide-react';
import type {
  InterviewQuestion,
  InterviewEvaluation,
  SprintPlan
} from '../types';

interface InterviewCoachProps {
  sprintPlan: SprintPlan;
  questions: InterviewQuestion[];
  onEvaluateAnswer: (
    question: InterviewQuestion,
    answer: string
  ) => Promise<InterviewEvaluation>;
  onRecalibrateSprintPlan: (evaluation: InterviewEvaluation) => void;
  onNavigateToSprint: () => void;
  isEvaluating: boolean;
  latestEvaluation: InterviewEvaluation | null;
}

export const InterviewCoach: React.FC<InterviewCoachProps> = ({
  sprintPlan,
  questions,
  onEvaluateAnswer,
  onRecalibrateSprintPlan,
  onNavigateToSprint,
  isEvaluating,
  latestEvaluation
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

  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion>(activeQuestions[0]);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [showExpectedPoints, setShowExpectedPoints] = useState<boolean>(false);
  const [recalibratedSuccess, setRecalibratedSuccess] = useState<boolean>(false);

  // Web Speech API dictation
  const handleToggleDictation = () => {
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
        setUserAnswer((prev) => (prev ? prev + ' ' + transcript : transcript));
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition error:', e);
      setIsRecording(false);
    }
  };

  const handleSubmit = async () => {
    if (!userAnswer.trim()) {
      alert('Please provide an answer before submitting.');
      return;
    }
    setRecalibratedSuccess(false);
    await onEvaluateAnswer(selectedQuestion, userAnswer);
  };

  const handleTriggerRecalibration = () => {
    if (!latestEvaluation) return;
    onRecalibrateSprintPlan(latestEvaluation);
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
            Live technical questions generated for {sprintPlan.targetRole}, evaluated with rigorous rubrics
          </p>
        </div>

        {/* Question Selector dropdown / pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          {activeQuestions.map((q, idx) => (
            <button
              key={q.id || idx}
              onClick={() => {
                setSelectedQuestion(q);
                setUserAnswer('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedQuestion.id === q.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Q{idx + 1}: {q.category.split('&')[0]}
            </button>
          ))}
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
                  {selectedQuestion.difficulty.toUpperCase()} LEVEL
                </span>
                <span className="text-xs text-slate-400 font-medium">{selectedQuestion.category}</span>
              </div>
              <span className="text-[11px] text-cyan-400 font-semibold">{selectedQuestion.role}</span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
              {selectedQuestion.question}
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <strong className="text-amber-400">Context & Scenario: </strong>
              {selectedQuestion.context}
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
                  {selectedQuestion.keyPointsExpected.map((point, idx) => (
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
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <span>Your Live Technical Response</span>
              </label>
              <span className="text-[11px] text-slate-500">{userAnswer.length} characters</span>
            </div>

            <textarea
              rows={8}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Explain your architectural approach, concurrency patterns, edge cases, and code structure..."
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-indigo-500 transition-colors"
            />

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleToggleDictation}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  isRecording
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isRecording ? 'Listening...' : 'Voice Dictate'}</span>
              </button>

              <button
                onClick={handleSubmit}
                disabled={isEvaluating || !userAnswer.trim()}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isEvaluating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Grading with Rubrics...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Evaluate with AI Rubrics</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right 6 Cols: AI Rubrics & Feedback Card */}
        <div className="lg:col-span-6 space-y-6">
          {latestEvaluation ? (
            <div className="glass-panel p-6 rounded-3xl space-y-6 border border-indigo-500/30 relative overflow-hidden">
              {/* Header with Score & Verdict */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Live AI Rubric Evaluation
                  </span>
                  <div className="flex items-baseline space-x-3 mt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white">
                      {latestEvaluation.score}
                      <span className="text-sm font-normal text-slate-400">/100</span>
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        latestEvaluation.verdict === 'Pass'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : latestEvaluation.verdict === 'Needs Improvement'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {latestEvaluation.verdict}
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
                  title="Dynamically modifies 7-day sprint plan based on this evaluation"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{recalibratedSuccess ? '✓ Sprint Extended & Synced!' : 'Sync Weakness & Extend Sprint'}</span>
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
                      <span className="font-bold text-white">{latestEvaluation.rubrics.technicalDepth}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-1.5 rounded-full"
                        style={{ width: `${latestEvaluation.rubrics.technicalDepth}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">System Architecture</span>
                      <span className="font-bold text-white">{latestEvaluation.rubrics.systemArchitecture}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-cyan-500 h-1.5 rounded-full"
                        style={{ width: `${latestEvaluation.rubrics.systemArchitecture}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Clarity & Structure</span>
                      <span className="font-bold text-white">{latestEvaluation.rubrics.clarity}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-500 h-1.5 rounded-full"
                        style={{ width: `${latestEvaluation.rubrics.clarity}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Evidence & Guarantees</span>
                      <span className="font-bold text-white">{latestEvaluation.rubrics.evidenceAndExamples}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full"
                        style={{ width: `${latestEvaluation.rubrics.evidenceAndExamples}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Identified Weak Topics Tagged */}
              {latestEvaluation.weakTopics.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-1">
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>Identified Weak Topics to Bridge</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {latestEvaluation.weakTopics.map((topic, i) => (
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
                  {latestEvaluation.improvementAreas.map((item, idx) => (
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
                <p className="text-slate-200 leading-relaxed italic">{latestEvaluation.suggestedAnswer}</p>
              </div>

              {recalibratedSuccess && (
                <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
                  <div className="space-y-0.5">
                    <span className="font-bold flex items-center space-x-1 text-amber-300">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Sprint Dynamically Extended!</span>
                    </span>
                    <p className="text-[11px] text-slate-300">
                      Added Day {sprintPlan.days.length} dedicated to remedial practice for {latestEvaluation.weakTopics[0] || 'this weakness'}.
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
            /* Empty State */
            <div className="glass-panel p-8 rounded-3xl h-full flex flex-col items-center justify-center text-center space-y-4 text-slate-400">
              <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400">
                <Award className="w-8 h-8" />
              </div>
              <div className="max-w-xs space-y-1.5">
                <h3 className="text-base font-bold text-white">AI Evaluation Ready</h3>
                <p className="text-xs text-slate-400">
                  Type your answer or use voice dictation and submit for immediate rubric grading and weakness tagging.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
