import React, { useState } from 'react';
import {
  FileSearch,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Upload,
  RefreshCw,
  FileText,
  Target,
  Layers,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { CareerDiagnosisResult, SkillItem, StrengthLevel } from '../types';
interface CareerDiagnosisProps {
  diagnosis: CareerDiagnosisResult;
  onAnalyze: (resume: string, jd: string, manualRole?: string, manualCompany?: string) => Promise<void>;
  onNavigateToSprint: () => void;
  isAnalyzing: boolean;
}

export const CareerDiagnosis: React.FC<CareerDiagnosisProps> = ({
  diagnosis,
  onAnalyze,
  onNavigateToSprint,
  isAnalyzing
}) => {
  const [activeTab, setActiveTab] = useState<'results' | 'input'>('results');
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'match' | 'gap' | 'weak'>('all');
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);

  const handleStartAnalysis = async () => {
    if (!resumeText.trim() || !jdText.trim()) {
      alert('Please provide both resume text and job description.');
      return;
    }
    await onAnalyze(
      resumeText,
      jdText,
      targetRole.trim() || undefined,
      targetCompany.trim() || undefined
    );
    setActiveTab('results');
  };

  const allSkills: (SkillItem & { type: 'match' | 'gap' | 'weak' })[] = [
    ...diagnosis.matchedSkills.map((s) => ({ ...s, type: 'match' as const })),
    ...diagnosis.gapSkills.map((s) => ({ ...s, type: 'gap' as const })),
    ...diagnosis.weakEvidenceSkills.map((s) => ({ ...s, type: 'weak' as const }))
  ];

  const filteredSkills = allSkills.filter((s) => {
    if (filterCategory === 'all') return true;
    return s.type === filterCategory;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Bar with Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <FileSearch className="w-5 h-5" />
            </div>
            <span>AI Career Diagnosis & Forensic Gap Audit</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gemini-powered evaluation comparing candidate resume evidence against employer job requirements
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('results')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'results'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            Audit Results
          </button>
          <button
            onClick={() => setActiveTab('input')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'input'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            Input / Edit Texts
          </button>
        </div>
      </div>

      {/* Input View */}
      {activeTab === 'input' && (
        <div className="glass-panel p-6 rounded-3xl space-y-6">
          <div className="pb-4 border-b border-slate-800">
            <h2 className="text-base font-bold text-white">Upload or Paste Resume & Target Job Description</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Input your current profile and target job description to run a live forensic gap audit.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resume Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>Candidate Resume (Text or Markdown)</span>
                </label>
                <span className="text-[11px] text-slate-500">{resumeText.length} chars</span>
              </div>
              <textarea
                rows={14}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste candidate resume text here..."
                className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono leading-relaxed focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Job Description Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <Target className="w-4 h-4 text-cyan-400" />
                  <span>Target Job Description (JD)</span>
                </label>
                <span className="text-[11px] text-slate-500">{jdText.length} chars</span>
              </div>
              <textarea
                rows={14}
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste full job description requirements here..."
                className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono leading-relaxed focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* Optional Role & Company overrides */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Target Position Details (Optional — AI will auto-extract if left blank)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Target Role (e.g. Senior Java Backend Engineer)"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                placeholder="Target Company (e.g. GoKwik, Stripe, Apex)"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleStartAnalysis}
              disabled={isAnalyzing}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-xl shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Running Forensic Gemini Audit...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Run Forensic AI Diagnosis</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Results View */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          {/* Header Summary Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              {/* Fit Dial & Breakdown */}
              <div className="flex items-center space-x-5 lg:border-r lg:border-slate-800 lg:pr-6">
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-indigo-500"
                      strokeDasharray={`${diagnosis.roleFitScore}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-extrabold text-white">{diagnosis.roleFitScore}%</span>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Fit Index</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs text-slate-400">Target Alignment:</div>
                  <div className="text-sm font-bold text-white">{diagnosis.targetRole}</div>
                  <div className="text-xs text-cyan-400 font-medium">@ {diagnosis.targetCompany}</div>
                  <div className="flex items-center space-x-2 text-[11px] pt-1">
                    <span className="text-emerald-400 font-semibold">{diagnosis.matchPercentage}% Match</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-amber-400 font-semibold">{diagnosis.gapPercentage}% Gap</span>
                  </div>
                  {(diagnosis.location || diagnosis.salary) && (
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1">
                      {diagnosis.location && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 font-medium">
                          📍 {diagnosis.location}
                        </span>
                      )}
                      {diagnosis.salary && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 font-semibold">
                          💰 {diagnosis.salary}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Parity & Executive Summary */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Executive Forensic Summary</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {diagnosis.summary}
                </p>
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
                  <strong className="text-amber-300">Evidence Audit Verdict: </strong>
                  {diagnosis.parityExplanation}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Filter Tabs for Skills Matrix */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center space-x-2 text-xs">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  filterCategory === 'all'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Skills ({allSkills.length})
              </button>
              <button
                onClick={() => setFilterCategory('match')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  filterCategory === 'match'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-emerald-300'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Matches ({diagnosis.matchedSkills.length})</span>
              </button>
              <button
                onClick={() => setFilterCategory('gap')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  filterCategory === 'gap'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'text-slate-400 hover:text-rose-300'
                }`}
              >
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Critical Gaps ({diagnosis.gapSkills.length})</span>
              </button>
              <button
                onClick={() => setFilterCategory('weak')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  filterCategory === 'weak'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Weak Evidence ({diagnosis.weakEvidenceSkills.length})</span>
              </button>
            </div>

            <button
              onClick={onNavigateToSprint}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <span>View Adaptive Sprint Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Forensic Skills Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSkills.map((item) => {
              const isExpanded = expandedSkillId === item.id;
              const isMatch = item.type === 'match';
              const isGap = item.type === 'gap';
              const isWeak = item.type === 'weak';

              return (
                <div
                  key={item.id}
                  className={`glass-panel p-5 rounded-2xl transition-all border ${
                    isMatch
                      ? 'border-emerald-500/20 hover:border-emerald-500/40'
                      : isGap
                      ? 'border-rose-500/30 hover:border-rose-500/50'
                      : 'border-amber-500/30 hover:border-amber-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          isMatch
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : isGap
                            ? 'bg-rose-500/10 text-rose-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {isMatch && <CheckCircle2 className="w-4 h-4" />}
                        {isGap && <XCircle className="w-4 h-4" />}
                        {isWeak && <AlertTriangle className="w-4 h-4" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{item.skill}</h3>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              isMatch
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : isGap
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {isMatch ? 'Match' : isGap ? 'Critical Gap' : 'Weak Evidence'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{item.category} • {item.importance}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedSkillId(isExpanded ? null : item.id)}
                      className="p-1 rounded text-slate-500 hover:text-slate-300"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Evidence vs Requirement */}
                  <div className="mt-4 space-y-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                        Job Description Requirement:
                      </div>
                      <p className="text-slate-300 leading-snug">{item.jdRequirement}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                        Candidate Resume Evidence:
                      </div>
                      <p className="text-slate-300 italic leading-snug">"{item.resumeEvidence}"</p>
                    </div>

                    {item.actionItem && (
                      <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-0.5">
                          Action to Bridge:
                        </div>
                        <p className="leading-snug">{item.actionItem}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interview Focus Areas */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Critical Interview Probing Areas</h3>
                <p className="text-xs text-slate-400">
                  Forensic audit indicates hiring managers will probe deeply into these 3 weak zones
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {diagnosis.interviewFocusAreas.map((area, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{area.category}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        area.priority === 'Critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {area.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{area.description}</p>
                  <div className="space-y-1 pt-1 border-t border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Sample Probe:</span>
                    <p className="text-xs text-indigo-300 italic">"{area.sampleQuestions[0]}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
