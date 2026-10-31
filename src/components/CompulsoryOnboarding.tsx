import React, { useState } from 'react';
import {
  Compass,
  Upload,
  FileText,
  Target,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileCheck
} from 'lucide-react';

interface CompulsoryOnboardingProps {
  onStartAnalysis: (resume: string, jd: string, targetRole?: string, targetCompany?: string) => Promise<void>;
  isAnalyzing: boolean;
  analyzingStep: string;
}

export const CompulsoryOnboarding: React.FC<CompulsoryOnboardingProps> = ({
  onStartAnalysis,
  isAnalyzing,
  analyzingStep
}) => {
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [jdFileName, setJdFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // File Upload Handlers
  const handleResumeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setResumeText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleJdFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setJdFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setJdText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) {
      setErrorMsg('Please paste or upload your resume before proceeding.');
      return;
    }
    if (!jdText.trim()) {
      setErrorMsg('Please paste or upload the target job description before proceeding.');
      return;
    }

    setErrorMsg(null);
    await onStartAnalysis(resumeText.trim(), jdText.trim(), targetRole.trim(), targetCompany.trim());
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full mx-auto space-y-8 animate-fadeIn">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-xl shadow-indigo-500/20 mb-2">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Compass className="w-7 h-7 text-indigo-400 animate-pulse" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">Career Pilot</span>
          </h1>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            AI-powered career pivot coach. Provide your current resume and your target job description to begin your live forensic audit and personalized learning sprint.
          </p>

          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Compulsory Onboarding • Live AI Intake</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/50 flex items-center space-x-3 text-xs text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Intake Form */}
        <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl space-y-8 border border-slate-800 shadow-2xl relative overflow-hidden">
          {/* Progress Overlay while analyzing */}
          {isAnalyzing && (
            <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 space-y-6 text-center animate-fadeIn">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <Sparkles className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto" />
              </div>
              <div className="space-y-2 max-w-md">
                <h3 className="text-lg font-bold text-white">Analyzing Your Career Pivot</h3>
                <p className="text-xs sm:text-sm text-indigo-300 font-medium animate-pulse">
                  {analyzingStep || 'Gemini 3.8 Flash is forensically auditing your profile...'}
                </p>
                <div className="w-64 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden mt-4">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 animate-pulse w-3/4" />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Step 1: Resume Upload / Paste */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[11px] font-mono">1</div>
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>Your Current Resume</span>
                </label>
                <span className="text-[11px] text-slate-500">{resumeText.length} characters</span>
              </div>

              {/* Upload file button / dropzone */}
              <label className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 bg-slate-900/60 hover:bg-slate-900 cursor-pointer transition-colors text-xs text-slate-300">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>{resumeFileName ? `Loaded: ${resumeFileName}` : 'Upload Resume (.pdf, .txt, .md)'}</span>
                <input
                  type="file"
                  accept=".pdf,.txt,.md,.doc,.docx"
                  onChange={handleResumeFileUpload}
                  className="hidden"
                />
              </label>

              <textarea
                rows={12}
                required
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Or paste your complete resume text here (experience, skills, education, projects)..."
                className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono leading-relaxed focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Step 2: Target Job Description */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[11px] font-mono">2</div>
                  <Target className="w-4 h-4 text-cyan-400" />
                  <span>Target Job Description (JD)</span>
                </label>
                <span className="text-[11px] text-slate-500">{jdText.length} characters</span>
              </div>

              {/* Upload JD file button */}
              <label className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border border-dashed border-slate-700 hover:border-cyan-500 bg-slate-900/60 hover:bg-slate-900 cursor-pointer transition-colors text-xs text-slate-300">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>{jdFileName ? `Loaded: ${jdFileName}` : 'Upload JD (.txt, .md, .pdf)'}</span>
                <input
                  type="file"
                  accept=".pdf,.txt,.md,.doc,.docx"
                  onChange={handleJdFileUpload}
                  className="hidden"
                />
              </label>

              <textarea
                rows={12}
                required
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the target job posting here (responsibilities, required qualifications, tech stack)..."
                className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono leading-relaxed focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* Optional Role & Company overrides */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-3">
              Target Position Details (Optional — AI will auto-extract if left blank)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Target Role (e.g. Senior Backend Engineer)"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                placeholder="Target Company (e.g. Stripe, Apex Fintech)"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>All evaluations are 100% live and generated fresh from your actual inputs</span>
            </div>

            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-xl shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Analyze & Generate Custom Pivot Coach</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
