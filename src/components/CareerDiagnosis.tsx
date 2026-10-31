import React, { useState } from 'react';
import {
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Target,
  FileText,
  Building,
  MapPin,
  DollarSign
} from 'lucide-react';
import type { CareerDiagnosisResult, SkillItem } from '../types';

interface CareerDiagnosisProps {
  diagnosis: CareerDiagnosisResult;
  onAnalyze: (resume: string, jd: string, targetRole?: string, targetCompany?: string) => Promise<void>;
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
  const [filterCategory, setFilterCategory] = useState<'all' | 'match' | 'gap' | 'weak'>('all');

  const handleReanalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim() || !jdText.trim()) return;
    await onAnalyze(resumeText, jdText);
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
    <div className="space-y-6 animate-fadeIn">
      {/* Top Bar with Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-[#D9CFB9]">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#293C3A] flex items-center space-x-2">
            <FileSearch className="w-6 h-6 text-[#C95F48]" />
            <span>Skill Check</span>
          </h1>
          <p className="text-xs text-[#6B7169] mt-0.5">
            See how your skills match {diagnosis.targetRole} and what you need to learn.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('results')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'results'
                ? 'bg-[#C95F48] text-white'
                : 'text-[#6B7169] hover:text-[#293C3A] bg-[#FFF7E8] border border-[#D9CFB9]'
            }`}
          >
            Audit Results
          </button>
          <button
            onClick={() => setActiveTab('input')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'input'
                ? 'bg-[#C95F48] text-white'
                : 'text-[#6B7169] hover:text-[#293C3A] bg-[#FFF7E8] border border-[#D9CFB9]'
            }`}
          >
            Edit Resume &amp; Job
          </button>
        </div>
      </div>

      {/* Edit Resume & JD Tab */}
      {activeTab === 'input' && (
        <div className="art-card p-6 sm:p-8 space-y-6">
          <div className="pb-3 border-b border-[#D9CFB9]">
            <h2 className="font-editorial text-xl font-bold text-[#293C3A]">
              Update Your Information
            </h2>
            <p className="text-xs text-[#6B7169] mt-0.5">
              Paste updated resume or job details to rerun the skill match assessment.
            </p>
          </div>

          <form onSubmit={handleReanalyze} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#293C3A] flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-[#C95F48]" />
                  <span>Resume Text</span>
                </label>
                <textarea
                  rows={10}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your updated resume text..."
                  className="art-input w-full p-3 text-xs leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#293C3A] flex items-center space-x-1.5">
                  <Target className="w-4 h-4 text-[#D8B35F]" />
                  <span>Target Job Description</span>
                </label>
                <textarea
                  rows={10}
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste the target job description..."
                  className="art-input w-full p-3 text-xs leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isAnalyzing || !resumeText.trim() || !jdText.trim()}
                className="art-btn-primary px-6 py-2.5 text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {isAnalyzing ? 'Updating Assessment...' : 'Rerun Assessment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Results View */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          {/* Top Target Overview Card */}
          <div className="art-card p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Fit Dial (4 cols) */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 rounded-2xl bg-[#E8EBDD]/60 border border-[#D9CFB9]">
                <div className="relative flex items-center justify-center w-32 h-32">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="text-[#D9CFB9]"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="text-[#C95F48]"
                      strokeWidth="8"
                      strokeDasharray={`${diagnosis.roleFitScore * 2.51} 251.2`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="font-editorial text-3xl font-bold text-[#293C3A]">
                      {diagnosis.roleFitScore}%
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-[#6B7169]">
                      Match Score
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs text-[#6B7169]">
                  <span>{diagnosis.matchPercentage}% Matched</span>
                  <span>•</span>
                  <span>{diagnosis.gapPercentage}% To Learn</span>
                </div>
              </div>

              {/* Target Details & Summary (8 cols) */}
              <div className="lg:col-span-8 space-y-3">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#C95F48]">
                    Target Position
                  </span>
                  <h2 className="font-editorial text-2xl font-bold text-[#293C3A]">
                    {diagnosis.targetRole}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B7169]">
                  {diagnosis.targetCompany && (
                    <span className="flex items-center space-x-1">
                      <Building className="w-3.5 h-3.5 text-[#466E67]" />
                      <span>{diagnosis.targetCompany}</span>
                    </span>
                  )}
                  {diagnosis.location && (
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-[#D8B35F]" />
                      <span>{diagnosis.location}</span>
                    </span>
                  )}
                  {diagnosis.salary && (
                    <span className="flex items-center space-x-1">
                      <DollarSign className="w-3.5 h-3.5 text-[#C95F48]" />
                      <span>{diagnosis.salary}</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#293C3A] leading-relaxed pt-1">
                  {diagnosis.summary}
                </p>

                {diagnosis.parityExplanation && (
                  <div className="p-3 rounded-xl bg-[#E8EBDD] text-xs text-[#38564F] leading-relaxed">
                    <strong>Summary:</strong> {diagnosis.parityExplanation}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filter Pills & Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  filterCategory === 'all'
                    ? 'bg-[#C95F48] text-white'
                    : 'bg-[#FFF7E8] text-[#6B7169] hover:text-[#293C3A] border border-[#D9CFB9]'
                }`}
              >
                All Skills ({allSkills.length})
              </button>
              <button
                onClick={() => setFilterCategory('match')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1 ${
                  filterCategory === 'match'
                    ? 'bg-[#466E67] text-white'
                    : 'bg-[#FFF7E8] text-[#466E67] hover:bg-[#E8EBDD] border border-[#D9CFB9]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Matches ({diagnosis.matchedSkills.length})</span>
              </button>
              <button
                onClick={() => setFilterCategory('gap')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1 ${
                  filterCategory === 'gap'
                    ? 'bg-[#C95F48] text-white'
                    : 'bg-[#FFF7E8] text-[#C95F48] hover:bg-[#FAECE8] border border-[#D9CFB9]'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Skills to Learn ({diagnosis.gapSkills.length})</span>
              </button>
              {diagnosis.weakEvidenceSkills.length > 0 && (
                <button
                  onClick={() => setFilterCategory('weak')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1 ${
                    filterCategory === 'weak'
                      ? 'bg-[#D8B35F] text-white'
                      : 'bg-[#FFF7E8] text-[#7A5B1D] hover:bg-[#FBF4E4] border border-[#D9CFB9]'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Weak Evidence ({diagnosis.weakEvidenceSkills.length})</span>
                </button>
              )}
            </div>

            <button
              onClick={onNavigateToSprint}
              className="art-btn-primary px-4 py-2 text-xs font-bold flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
            >
              <span>View Learning Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSkills.map((item) => {
              const isMatch = item.type === 'match';
              const isGap = item.type === 'gap';

              return (
                <div
                  key={item.id}
                  className={`art-card p-5 space-y-3 ${
                    isMatch
                      ? 'border-[#C5D5BE]'
                      : isGap
                      ? 'border-[#E58B70]/70'
                      : 'border-[#D9CFB9]'
                  }`}
                >
                  {/* Skill Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      {isMatch ? (
                        <CheckCircle2 className="w-4 h-4 text-[#466E67] shrink-0" />
                      ) : isGap ? (
                        <AlertTriangle className="w-4 h-4 text-[#C95F48] shrink-0" />
                      ) : (
                        <HelpCircle className="w-4 h-4 text-[#D8B35F] shrink-0" />
                      )}
                      <h3 className="text-sm font-bold text-[#293C3A]">{item.skill}</h3>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        isMatch
                          ? 'bg-[#E8EBDD] text-[#38564F]'
                          : isGap
                          ? 'bg-[#FAECE8] text-[#C95F48]'
                          : 'bg-[#FBF4E4] text-[#7A5B1D]'
                      }`}
                    >
                      {isMatch ? 'Match' : isGap ? 'Needs Practice' : 'Weak Evidence'}
                    </span>
                  </div>

                  {/* Category & Importance */}
                  <div className="text-[11px] text-[#6B7169] flex items-center space-x-2">
                    <span>{item.category}</span>
                    {item.importance && (
                      <>
                        <span>•</span>
                        <span>{item.importance}</span>
                      </>
                    )}
                  </div>

                  {/* Requirements & Evidence */}
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-[#F5EBD6]/60 border border-[#D9CFB9]">
                      <span className="text-[10px] font-semibold uppercase text-[#6B7169] block mb-0.5">
                        Job Requirement:
                      </span>
                      <p className="text-[#293C3A]">{item.jdRequirement}</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#FFF7E8] border border-[#D9CFB9]">
                      <span className="text-[10px] font-semibold uppercase text-[#6B7169] block mb-0.5">
                        Resume Evidence:
                      </span>
                      <p className="text-[#293C3A]">{item.resumeEvidence || 'No direct evidence found.'}</p>
                    </div>

                    {item.actionItem && (
                      <div className="p-2.5 rounded-lg bg-[#FAECE8]/70 border border-[#E58B70]/40">
                        <span className="text-[10px] font-semibold uppercase text-[#C95F48] block mb-0.5">
                          How to Improve:
                        </span>
                        <p className="text-[#293C3A]">{item.actionItem}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interview Focus Areas */}
          {diagnosis.interviewFocusAreas && diagnosis.interviewFocusAreas.length > 0 && (
            <div className="art-card p-6 space-y-4">
              <div>
                <h3 className="font-editorial text-lg font-bold text-[#293C3A]">
                  Interview Focus Areas
                </h3>
                <p className="text-xs text-[#6B7169]">
                  Expect interviewers to ask deeply about these topics
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {diagnosis.interviewFocusAreas.map((area, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#E8EBDD]/50 border border-[#D9CFB9] space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#293C3A]">{area.category}</h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#FAECE8] text-[#C95F48]">
                        {area.priority}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7169] leading-relaxed">{area.description}</p>
                    {area.sampleQuestions && area.sampleQuestions.length > 0 && (
                      <div className="pt-1 text-[11px] text-[#293C3A] italic border-t border-[#D9CFB9]">
                        &ldquo;{area.sampleQuestions[0]}&rdquo;
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
