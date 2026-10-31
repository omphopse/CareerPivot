import React, { useState } from 'react';
import {
  FileSearch,
  CalendarCheck,
  Headphones,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Clock,
  Target,
  ChevronRight,
  ShieldCheck,
  Zap,
  ExternalLink,
  BookOpen,
  Award,
  BarChart3,
  HelpCircle,
  LogIn,
  LayoutDashboard
} from 'lucide-react';
import type { AuthUser } from '../types';
import { PicassoCareerCompass } from './ArtIllustrations';

interface HomePageProps {
  onGetStarted: () => void;
  currentUser?: AuthUser | null;
  onNavigateToDashboard?: () => void;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({
  onGetStarted,
  currentUser,
  onNavigateToDashboard,
  hideHeader = false,
  hideFooter = false
}) => {
  const [activePreviewTab, setActivePreviewTab] = useState<'diagnosis' | 'sprint' | 'interview' | 'tracker'>('diagnosis');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      q: 'What is Career Pivot and how does it help my job search?',
      a: 'Career Pivot is an AI-powered career transition coach. Unlike simple resume builders, it conducts a line-by-line forensic comparison between your actual resume and your target job description. It discovers concrete skill gaps, generates an adaptive 7-day learning sprint, conducts realistic technical mock interviews with instant rubrics, and organizes all your target applications on a visual Kanban pipeline.'
    },
    {
      q: 'How does the Forensic Skill Diagnosis work?',
      a: 'You paste any target job description and upload your resume. Gemini analyzes the requirements against your demonstrable background to identify: 1) Matched Strengths you can emphasize, 2) Critical Gap Skills requiring upskilling, and 3) Weak Evidence areas that need better framing. Each gap includes a concrete action item to address it.'
    },
    {
      q: 'What makes the Adaptive Sprint different from a generic study plan?',
      a: 'The sprint breaks your specific skill deficits into focused daily milestones (typically 30–60 minutes each). Every task comes with an actionable deliverable and curated industry resource link. At the end of each day, a mastery quiz tests your comprehension and can dynamically recalibrate subsequent sprint days.'
    },
    {
      q: 'How do the AI Mock Technical Interviews work?',
      a: 'Career Pivot formulates realistic scenario-based and architectural questions tailored directly to your target role and identified gap areas. When you answer, the AI delivers an immediate score (0–100), highlights your strong points and improvement areas, and provides a reference model answer. You can regenerate individual questions or practice fresh rounds anytime.'
    },
    {
      q: 'Is my resume and career information kept private?',
      a: 'Yes. All data, resumes, notes, and evaluations are securely isolated to your private account authenticated with Supabase. We do not sell your data or use it for public training sets.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5EBD6] text-[#293C3A] flex flex-col font-sans selection:bg-[#C95F48] selection:text-white">
      {/* ─── Top Navigation Bar ─── */}
      {!hideHeader && (
        <header className="sticky top-0 z-40 w-full border-b border-[#D9CFB9] bg-[#FFF7E8]/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Brand Logo & Name */}
              <div className="flex items-center space-x-2.5 cursor-pointer select-none" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <PicassoCareerCompass size={32} />
                <div className="flex flex-col">
                  <span className="font-editorial text-xl sm:text-2xl font-bold tracking-tight text-[#293C3A]">
                    Career Pivot
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-[#6B7169] -mt-1 hidden sm:inline">
                    Personal Career Coach
                  </span>
                </div>
              </div>

              {/* Desktop Navigation Links */}
              <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-[#6B7169]">
                <button
                  onClick={() => scrollToSection('features')}
                  className="hover:text-[#293C3A] transition-colors cursor-pointer"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection('preview')}
                  className="hover:text-[#293C3A] transition-colors cursor-pointer"
                >
                  Interactive Preview
                </button>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="hover:text-[#293C3A] transition-colors cursor-pointer"
                >
                  How It Works
                </button>
                <button
                  onClick={() => scrollToSection('faq')}
                  className="hover:text-[#293C3A] transition-colors cursor-pointer"
                >
                  FAQ
                </button>
              </nav>

              {/* Right Action Button */}
              <div className="flex items-center space-x-3">
                {currentUser ? (
                  <button
                    onClick={onNavigateToDashboard || onGetStarted}
                    className="art-btn-primary px-4 py-2 text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Go to Dashboard</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={onGetStarted}
                      className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#293C3A] hover:bg-[#E8EBDD] transition-colors cursor-pointer border border-[#D9CFB9]"
                    >
                      <LogIn className="w-3.5 h-3.5 text-[#466E67]" />
                      <span>Sign In</span>
                    </button>
                    <button
                      onClick={onGetStarted}
                      className="art-btn-primary px-4 py-2 text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-[#D9CFB9]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Editorial Tag Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#E8EBDD] border border-[#C5D5BE] text-[#38564F] text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#C95F48]" />
            <span>AI-Powered Career Transition & Skill Diagnosis</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-bold text-[#293C3A] tracking-tight leading-[1.15]">
            Bridge the gap between where you are and the role you want.
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-base lg:text-lg text-[#6B7169] max-w-2xl mx-auto leading-relaxed">
            Career Pivot analyzes your resume against any target job description, discovers concrete skill gaps, crafts an adaptive 7-day action sprint, and prepares you with role-specific technical mock interviews.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={currentUser && onNavigateToDashboard ? onNavigateToDashboard : onGetStarted}
              className="art-btn-primary w-full sm:w-auto px-6 py-3 text-sm flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
            >
              <span>{currentUser ? 'Continue to Dashboard' : 'Start Your Career Pivot'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="art-btn-secondary w-full sm:w-auto px-6 py-3 text-sm flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Explore How It Works</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Value Highlights Pills */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs text-[#6B7169]">
            <span className="flex items-center space-x-1.5 bg-[#FFF7E8] px-3 py-1 rounded-md border border-[#D9CFB9]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#466E67]" />
              <span>Evidence-based gap analysis</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-[#FFF7E8] px-3 py-1 rounded-md border border-[#D9CFB9]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#466E67]" />
              <span>Structured 7-day curriculum</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-[#FFF7E8] px-3 py-1 rounded-md border border-[#D9CFB9]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#466E67]" />
              <span>Realistic AI mock interviews</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-[#FFF7E8] px-3 py-1 rounded-md border border-[#D9CFB9]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#466E67]" />
              <span>Application Kanban pipeline</span>
            </span>
          </div>
        </div>
      </section>

      {/* ─── 4 Core Pillars Section ─── */}
      <section id="features" className="py-16 sm:py-24 border-b border-[#D9CFB9] bg-[#FFF7E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Heading */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C95F48]">
              Comprehensive Transition Suite
            </span>
            <h2 className="font-editorial text-2xl sm:text-4xl font-bold text-[#293C3A]">
              Everything you need to successfully pivot your career
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7169]">
              Four integrated modules designed to take you from initial skill gap analysis all the way to acing your technical rounds.
            </p>
          </div>

          {/* 4 Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1: Diagnosis */}
            <div className="art-card p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8EBDD] border border-[#C5D5BE] flex items-center justify-center text-[#466E67]">
                  <FileSearch className="w-5 h-5" />
                </div>
                <h3 className="font-editorial text-lg font-bold text-[#293C3A]">
                  Forensic Skill Diagnosis
                </h3>
                <p className="text-xs text-[#6B7169] leading-relaxed">
                  Compare your resume line-by-line with actual job postings. Clearly distinguishes between confirmed strengths, missing critical skills, and weak evidence areas.
                </p>
              </div>
              <div className="pt-3 border-t border-[#D9CFB9]/60 text-[11px] text-[#466E67] font-semibold flex items-center space-x-1">
                <Target className="w-3.5 h-3.5 text-[#C95F48]" />
                <span>Actionable closing advice for each gap</span>
              </div>
            </div>

            {/* Pillar 2: Sprint */}
            <div className="art-card p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAECE8] border border-[#E58B70] flex items-center justify-center text-[#C95F48]">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <h3 className="font-editorial text-lg font-bold text-[#293C3A]">
                  Adaptive Daily Sprints
                </h3>
                <p className="text-xs text-[#6B7169] leading-relaxed">
                  Converts your missing competencies into a 7-day, day-by-day learning plan. Features time estimates, clear deliverables, curated resources, and daily mastery quizzes.
                </p>
              </div>
              <div className="pt-3 border-t border-[#D9CFB9]/60 text-[11px] text-[#466E67] font-semibold flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-[#C95F48]" />
                <span>Manageable 30–60 min daily blocks</span>
              </div>
            </div>

            {/* Pillar 3: Mock Interview */}
            <div className="art-card p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8EBDD] border border-[#C5D5BE] flex items-center justify-center text-[#466E67]">
                  <Headphones className="w-5 h-5" />
                </div>
                <h3 className="font-editorial text-lg font-bold text-[#293C3A]">
                  Technical Mock Coach
                </h3>
                <p className="text-xs text-[#6B7169] leading-relaxed">
                  Rehearse role-specific architectural questions with voice or text input. Get instant scoring (0–100), key strengths, improvements, and gold-standard model answers.
                </p>
              </div>
              <div className="pt-3 border-t border-[#D9CFB9]/60 text-[11px] text-[#466E67] font-semibold flex items-center space-x-1">
                <Award className="w-3.5 h-3.5 text-[#C95F48]" />
                <span>Update questions individually on demand</span>
              </div>
            </div>

            {/* Pillar 4: Tracker */}
            <div className="art-card p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAECE8] border border-[#E58B70] flex items-center justify-center text-[#C95F48]">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="font-editorial text-lg font-bold text-[#293C3A]">
                  Job Application CRM
                </h3>
                <p className="text-xs text-[#6B7169] leading-relaxed">
                  Organize your target companies on a clean Kanban board and table list. Track fit scores, salaries, interview rounds, next actions, and follow-up deadlines with cloud sync.
                </p>
              </div>
              <div className="pt-3 border-t border-[#D9CFB9]/60 text-[11px] text-[#466E67] font-semibold flex items-center space-x-1">
                <BarChart3 className="w-3.5 h-3.5 text-[#C95F48]" />
                <span>Multi-stage Kanban & Table views</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Interactive Live Preview Section ─── */}
      <section id="preview" className="py-16 sm:py-24 border-b border-[#D9CFB9]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C95F48]">
              Experience the Interface
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#293C3A]">
              Designed like a handcrafted career journal
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7169] max-w-xl mx-auto">
              Click through the tabs below to preview the actual workflow and components inside Career Pivot.
            </p>
          </div>

          {/* Preview Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setActivePreviewTab('diagnosis')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                activePreviewTab === 'diagnosis'
                  ? 'bg-[#C95F48] text-white shadow-xs'
                  : 'bg-[#FFF7E8] text-[#6B7169] hover:bg-[#E8EBDD] border border-[#D9CFB9]'
              }`}
            >
              <FileSearch className="w-3.5 h-3.5" />
              <span>1. Skill Diagnosis</span>
            </button>
            <button
              onClick={() => setActivePreviewTab('sprint')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                activePreviewTab === 'sprint'
                  ? 'bg-[#C95F48] text-white shadow-xs'
                  : 'bg-[#FFF7E8] text-[#6B7169] hover:bg-[#E8EBDD] border border-[#D9CFB9]'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>2. Adaptive Sprint</span>
            </button>
            <button
              onClick={() => setActivePreviewTab('interview')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                activePreviewTab === 'interview'
                  ? 'bg-[#C95F48] text-white shadow-xs'
                  : 'bg-[#FFF7E8] text-[#6B7169] hover:bg-[#E8EBDD] border border-[#D9CFB9]'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>3. Mock Interview</span>
            </button>
            <button
              onClick={() => setActivePreviewTab('tracker')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                activePreviewTab === 'tracker'
                  ? 'bg-[#C95F48] text-white shadow-xs'
                  : 'bg-[#FFF7E8] text-[#6B7169] hover:bg-[#E8EBDD] border border-[#D9CFB9]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>4. Application Pipeline</span>
            </button>
          </div>

          {/* Live Preview Display Box */}
          <div className="art-card p-6 sm:p-8 space-y-6 bg-[#FFF7E8]">
            {activePreviewTab === 'diagnosis' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#D9CFB9] gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#C95F48]">Target Role Evaluated</span>
                    <h3 className="font-editorial text-xl font-bold text-[#293C3A]">Staff Backend Architect</h3>
                    <p className="text-xs text-[#6B7169]">Based on resume evidence vs requirements</p>
                  </div>
                  <div className="flex items-center space-x-3 bg-[#F5EBD6] px-4 py-2 rounded-xl border border-[#D9CFB9]">
                    <div className="font-editorial text-2xl font-bold text-[#466E67]">78%</div>
                    <div className="text-[11px] text-[#6B7169] leading-tight">
                      <strong>Overall Fit</strong><br />2 Critical Gaps
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Matched Skill Card */}
                  <div className="p-4 rounded-xl bg-[#F5EBD6]/80 border border-[#C5D5BE] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#293C3A]">Distributed Systems Architecture</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#E8EBDD] text-[#38564F] border border-[#C5D5BE]">
                        Strong Match
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7169]">
                      Demonstrated track record of designing high-throughput event-driven microservices handling 25k RPS.
                    </p>
                  </div>

                  {/* Gap Skill Card */}
                  <div className="p-4 rounded-xl bg-[#FAECE8] border border-[#E58B70] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#293C3A]">Transactional Outbox & Idempotency</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#C95F48] text-white">
                        Critical Gap
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7169]">
                      JD requires CDC outbox deduplication with Kafka Debezium. Resume shows basic event publishing without atomic transaction guarantees.
                    </p>
                    <div className="text-[11px] text-[#C95F48] font-medium pt-1">
                      Action Item: Build Docker environment demonstrating Postgres outbox table with idempotent consumer filter.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'sprint' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center justify-between pb-4 border-b border-[#D9CFB9]">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#C95F48]">Day 1 of 7</span>
                    <h3 className="font-editorial text-xl font-bold text-[#293C3A]">Distributed Concurrency & High-Scale Locking</h3>
                    <p className="text-xs text-[#6B7169]">Goal: Master optimistic locking and distributed primitives.</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E8EBDD] text-[#38564F] border border-[#C5D5BE]">
                    0 of 2 Tasks Done
                  </span>
                </div>

                {/* Sample Sprint Task */}
                <div className="p-4 rounded-xl bg-[#F5EBD6] border border-[#D9CFB9] space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-2.5">
                      <div className="w-4 h-4 rounded-full border-2 border-[#D9CFB9] mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-[#293C3A]">
                          Audit Core Tooling for Backend Engineer
                        </h4>
                        <p className="text-xs text-[#6B7169] mt-1">
                          Set up local environments, inspect specifications, and verify dependencies for Backend Engineer.
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#FFF7E8] border border-[#D9CFB9] text-[#6B7169] shrink-0 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>45 min</span>
                    </span>
                  </div>

                  {/* Full-width deliverable box */}
                  <div className="pl-6">
                    <div className="p-2.5 rounded-lg bg-[#FFF7E8] border border-[#D9CFB9] text-xs space-y-1">
                      <span className="font-semibold text-[#C95F48]">Deliverable:</span>
                      <span className="text-[#293C3A] ml-1.5">
                        Technical summary outlining standard developer workflows and architecture for Backend Engineer.
                      </span>
                    </div>

                    {/* Dedicated resource link row */}
                    <div className="pt-2 flex items-center">
                      <span className="inline-flex items-center space-x-1.5 text-xs text-[#466E67] font-medium bg-[#E8EBDD]/60 px-2.5 py-1 rounded-md border border-[#C5D5BE]">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Backend Engineer Industry Guide</span>
                        <ExternalLink className="w-3 h-3 ml-0.5 text-[#6B7169]" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'interview' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center justify-between pb-4 border-b border-[#D9CFB9]">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#C95F48]">Technical Coach</span>
                    <h3 className="font-editorial text-xl font-bold text-[#293C3A]">Role Question 1 of 3</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#E8EBDD] text-[#38564F] border border-[#C5D5BE]">
                    Score: 86 / 100
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#F5EBD6] border border-[#D9CFB9] space-y-3">
                  <p className="text-xs font-bold text-[#293C3A] leading-relaxed">
                    "Design a distributed ledger system for Stripe that handles concurrent debit/credit operations with zero double-spending."
                  </p>
                  <div className="p-3 rounded-lg bg-[#FFF7E8] border border-[#D9CFB9] text-xs text-[#6B7169] space-y-1.5">
                    <div className="font-semibold text-[#466E67]">AI Evaluation Feedback:</div>
                    <p className="text-[11px] leading-relaxed">
                      "Strong answer! You accurately cited double-entry schema constraints, monotonic balance checks, and idempotency keys with Redis TTL. Consider discussing pessimistic locking vs optimistic locking trade-offs under high contention."
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'tracker' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-[#D9CFB9]">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#C95F48]">Pipeline CRM</span>
                    <h3 className="font-editorial text-lg font-bold text-[#293C3A]">Application Stages (Kanban View)</h3>
                  </div>
                  <span className="text-xs text-[#6B7169]">3 Active Opportunities</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[#F5EBD6] border border-[#D9CFB9] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#293C3A]">Stripe</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF7E8] text-[#C95F48] border border-[#D9CFB9]">
                        88% Fit
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6B7169]">Staff Backend Architect</div>
                    <div className="text-[10px] text-[#466E67] font-medium">Applied • Follow-up in 3 days</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F5EBD6] border border-[#D9CFB9] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#293C3A]">Coinbase</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF7E8] text-[#466E67] border border-[#D9CFB9]">
                        81% Fit
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6B7169]">Senior Platform Engineer</div>
                    <div className="text-[10px] text-[#C95F48] font-medium">Interviewing • Recruiter Call</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F5EBD6] border border-[#D9CFB9] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#293C3A]">OpenAI</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF7E8] text-[#6B7169] border border-[#D9CFB9]">
                        74% Fit
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6B7169]">Compute Platform Engineer</div>
                    <div className="text-[10px] text-[#6B7169] font-medium">Wishlist • Review JD</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── How It Works (3 Steps) ─── */}
      <section id="how-it-works" className="py-16 sm:py-24 border-b border-[#D9CFB9] bg-[#FFF7E8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C95F48]">
              The 3-Step Journey
            </span>
            <h2 className="font-editorial text-2xl sm:text-4xl font-bold text-[#293C3A]">
              How to pivot your career with confidence
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7169]">
              A simple, methodical path from where you are to landing your target offer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="art-card p-6 space-y-4">
              <div className="w-8 h-8 rounded-full bg-[#C95F48] text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-editorial text-lg font-bold text-[#293C3A]">
                Upload & Diagnose
              </h3>
              <p className="text-xs text-[#6B7169] leading-relaxed">
                Paste the job description of the role you want and upload your existing resume. Within seconds, Career Pivot performs a forensic audit, revealing your matched skills and concrete competency deficits.
              </p>
            </div>

            <div className="art-card p-6 space-y-4">
              <div className="w-8 h-8 rounded-full bg-[#466E67] text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="font-editorial text-lg font-bold text-[#293C3A]">
                Sprint & Rehearse
              </h3>
              <p className="text-xs text-[#6B7169] leading-relaxed">
                Follow your structured 7-day sprint plan. Tackle bite-sized daily deliverables, complete daily mastery quizzes, and practice role-specific technical interview questions with live AI feedback.
              </p>
            </div>

            <div className="art-card p-6 space-y-4">
              <div className="w-8 h-8 rounded-full bg-[#D8B35F] text-[#293C3A] flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="font-editorial text-lg font-bold text-[#293C3A]">
                Track & Land
              </h3>
              <p className="text-xs text-[#6B7169] leading-relaxed">
                Organize all your job applications on an interactive pipeline board. Never miss follow-up dates, log interview rounds, and step into every interview equipped with proof of your skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Frequently Asked Questions ─── */}
      <section id="faq" className="py-16 sm:py-24 border-b border-[#D9CFB9]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C95F48]">
              Got Questions?
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#293C3A]">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7169]">
              Everything you need to know about Career Pivot.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="art-card overflow-hidden">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-[#293C3A] hover:bg-[#E8EBDD]/40 transition-colors cursor-pointer"
                  >
                    <span className="pr-4">{faq.q}</span>
                    <HelpCircle className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'text-[#C95F48] rotate-180' : 'text-[#6B7169]'}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-[#6B7169] leading-relaxed border-t border-[#D9CFB9]/50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA Banner ─── */}
      <section className="py-16 sm:py-20 bg-[#FFF7E8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="art-card p-8 sm:p-12 text-center space-y-6 border border-[#C5D5BE] bg-[#E8EBDD]/40">
            <div className="flex justify-center">
              <PicassoCareerCompass size={48} />
            </div>
            <h2 className="font-editorial text-2xl sm:text-4xl font-bold text-[#293C3A] tracking-tight">
              Ready to make your next career leap?
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7169] max-w-lg mx-auto leading-relaxed">
              Target your next engineering, architectural, or leadership role with forensic clarity and step-by-step guidance.
            </p>
            <div className="pt-2">
              <button
                onClick={currentUser && onNavigateToDashboard ? onNavigateToDashboard : onGetStarted}
                className="art-btn-primary px-8 py-3.5 text-sm font-bold flex items-center justify-center space-x-2 mx-auto cursor-pointer shadow-md"
              >
                <span>{currentUser ? 'Go to Your Dashboard' : 'Get Started with Career Pivot'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      {!hideFooter && (
        <footer className="w-full border-t border-[#D9CFB9] bg-[#FFF7E8] py-8 text-xs text-[#6B7169]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="font-editorial text-sm font-bold text-[#293C3A]">Career Pivot</span>
              <span>•</span>
              <span>Your Personal Career Coach</span>
            </div>
            <div className="text-[11px] text-[#6B7169] flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#466E67]" />
              <span>All career data and interview notes are saved locally and private to your account.</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
