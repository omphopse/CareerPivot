import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Target,
  AlertCircle,
  LogOut,
  ArrowRight
} from 'lucide-react';
import type { AuthUser } from '../types';
import { PicassoCareerCompass } from './ArtIllustrations';

interface CompulsoryOnboardingProps {
  onStartAnalysis: (resume: string, jd: string, targetRole?: string, targetCompany?: string) => Promise<void>;
  isAnalyzing: boolean;
  analyzingStep: string;
  currentUser?: AuthUser | null;
  onSignOut?: () => void;
}

export const CompulsoryOnboarding: React.FC<CompulsoryOnboardingProps> = ({
  onStartAnalysis,
  isAnalyzing,
  analyzingStep,
  currentUser,
  onSignOut
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
    <div className="min-h-screen bg-[#F5EBD6] text-[#293C3A] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full mx-auto space-y-6">
        {/* Clean, compact account header */}
        {currentUser && onSignOut && (
          <div className="flex items-center justify-between pb-3 border-b border-[#D9CFB9] text-xs text-[#6B7169]">
            <span>Signed in as <strong className="text-[#293C3A]">{currentUser.email}</strong></span>
            <button
              onClick={onSignOut}
              className="flex items-center space-x-1 text-[#6B7169] hover:text-[#C95F48] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        )}

        {/* Page Heading */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <PicassoCareerCompass size={40} />
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#293C3A] tracking-tight">
            Start Your Career Assessment
          </h1>
          <p className="text-sm text-[#6B7169] max-w-xl mx-auto leading-relaxed">
            Upload your resume and add a job description. We'll help you find the skills you need to improve.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-[#FAECE8] border border-[#E58B70] flex items-center space-x-2.5 text-xs text-[#B54E38]">
            <AlertCircle className="w-4 h-4 text-[#C95F48] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Intake Form Card */}
        <form
          onSubmit={handleSubmit}
          className="art-card p-6 sm:p-8 space-y-6 relative overflow-hidden"
        >
          {/* Progress Overlay while analyzing */}
          {isAnalyzing && (
            <div className="absolute inset-0 z-50 bg-[#FFF7E8]/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full border-3 border-[#C95F48]/20 border-t-[#C95F48] animate-spin" />
              <div className="space-y-1 max-w-sm">
                <h3 className="font-editorial text-lg font-bold text-[#293C3A]">
                  Analyzing Your Skills
                </h3>
                <p className="text-xs text-[#6B7169] leading-relaxed">
                  {analyzingStep || 'Comparing your experience with the job requirements...'}
                </p>
              </div>
            </div>
          )}

          {/* Dual Input Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Resume Input Card */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#293C3A] flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-[#C95F48]" />
                  <span>Your Resume</span>
                </label>
                {resumeFileName ? (
                  <span className="text-[11px] text-[#466E67] font-medium truncate max-w-[150px]">
                    {resumeFileName}
                  </span>
                ) : (
                  <span className="text-[11px] text-[#6B7169]">{resumeText.length} characters</span>
                )}
              </div>

              {/* Upload Button */}
              <label className="flex items-center justify-center space-x-2 py-2 px-3 border border-dashed border-[#D9CFB9] hover:border-[#C95F48] bg-[#F5EBD6]/50 rounded-xl cursor-pointer text-xs font-semibold text-[#6B7169] hover:text-[#293C3A] transition-colors">
                <Upload className="w-3.5 h-3.5 text-[#C95F48]" />
                <span>Upload resume (.pdf, .txt, .md)</span>
                <input
                  type="file"
                  accept=".pdf,.txt,.md"
                  onChange={handleResumeFileUpload}
                  className="hidden"
                />
              </label>

              <textarea
                rows={11}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Or paste your resume text here (experience, skills, projects)..."
                className="art-input w-full p-3 text-xs leading-relaxed"
              />
            </div>

            {/* 2. Job Description Input Card */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#293C3A] flex items-center space-x-1.5">
                  <Target className="w-4 h-4 text-[#D8B35F]" />
                  <span>Target Job Description</span>
                </label>
                {jdFileName ? (
                  <span className="text-[11px] text-[#466E67] font-medium truncate max-w-[150px]">
                    {jdFileName}
                  </span>
                ) : (
                  <span className="text-[11px] text-[#6B7169]">{jdText.length} characters</span>
                )}
              </div>

              {/* Upload Button */}
              <label className="flex items-center justify-center space-x-2 py-2 px-3 border border-dashed border-[#D9CFB9] hover:border-[#C95F48] bg-[#F5EBD6]/50 rounded-xl cursor-pointer text-xs font-semibold text-[#6B7169] hover:text-[#293C3A] transition-colors">
                <Upload className="w-3.5 h-3.5 text-[#D8B35F]" />
                <span>Upload job description (.txt, .md, .pdf)</span>
                <input
                  type="file"
                  accept=".txt,.md,.pdf"
                  onChange={handleJdFileUpload}
                  className="hidden"
                />
              </label>

              <textarea
                rows={11}
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the target job description here (responsibilities, requirements, qualifications)..."
                className="art-input w-full p-3 text-xs leading-relaxed"
              />
            </div>
          </div>

          {/* Optional Role & Company Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#D9CFB9]">
            <div>
              <label className="block text-xs font-semibold text-[#6B7169] mb-1">
                Target Role (optional)
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className="art-input w-full px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B7169] mb-1">
                Target Company (optional)
              </label>
              <input
                type="text"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder="e.g. Stripe, Acme Corp"
                className="art-input w-full px-3 py-2 text-xs"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-xs text-[#6B7169]">
              Your resume and job details are kept private to your account.
            </span>
            <button
              type="submit"
              disabled={isAnalyzing}
              className="art-btn-primary w-full sm:w-auto px-6 py-2.5 flex items-center justify-center space-x-2 text-sm cursor-pointer disabled:opacity-60"
            >
              <span>Start Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
