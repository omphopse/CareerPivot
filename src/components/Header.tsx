import React from 'react';
import {
  Compass,
  LayoutDashboard,
  FileSearch,
  CalendarCheck,
  Headphones,
  Briefcase,
  Settings,
  PlusCircle,
  Flame,
  CheckCircle2,
  Database
} from 'lucide-react';
import { hasGeminiApiKey } from '../services/gemini';
import { isSupabaseConnected } from '../services/supabase';

interface HeaderProps {
  activeTab: 'dashboard' | 'diagnosis' | 'sprint' | 'interview' | 'tracker';
  setActiveTab: (tab: 'dashboard' | 'diagnosis' | 'sprint' | 'interview' | 'tracker') => void;
  onOpenSettings: () => void;
  onStartNewAnalysis: () => void;
  streakCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onStartNewAnalysis,
  streakCount
}) => {
  const geminiActive = hasGeminiApiKey();
  const supabaseActive = isSupabaseConnected();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
                  Career Pilot
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded">
                  AI COACH
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">AI Career Pivot & Skill Gap Engine</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('diagnosis')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'diagnosis'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <FileSearch className="w-4 h-4" />
              <span>Skill Diagnosis</span>
            </button>

            <button
              onClick={() => setActiveTab('sprint')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'sprint'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Adaptive Sprint</span>
            </button>

            <button
              onClick={() => setActiveTab('interview')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'interview'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Headphones className="w-4 h-4" />
              <span>Mock Interview</span>
            </button>

            <button
              onClick={() => setActiveTab('tracker')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'tracker'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Job Tracker</span>
            </button>
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2.5">
            {/* New Career Pivot Intake Button */}
            <button
              onClick={onStartNewAnalysis}
              title="Upload a new resume & job description to begin a fresh pivot evaluation"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Pivot Analysis</span>
            </button>

            {/* Streak Counter */}
            <div
              title="Consecutive Days of Career Pivot Sprint"
              className="hidden lg:flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium"
            >
              <Flame className="w-3.5 h-3.5 fill-orange-400" />
              <span>{streakCount}d Streak</span>
            </div>

            {/* Status pills */}
            <div className="hidden xl:flex items-center space-x-2 text-[11px]">
              <span
                title={geminiActive ? 'Gemini 3.8 Flash Connected' : 'Running on High-Fidelity Gemini AI Simulation'}
                className={`flex items-center space-x-1 px-2 py-0.5 rounded border ${
                  geminiActive
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Gemini {geminiActive ? '3.8 Live' : 'Sim'}</span>
              </span>

              <span
                title={supabaseActive ? 'Supabase Database Connected' : 'Local Hybrid Storage Active'}
                className={`flex items-center space-x-1 px-2 py-0.5 rounded border ${
                  supabaseActive
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400'
                }`}
              >
                <Database className="w-3 h-3" />
                <span>{supabaseActive ? 'Supabase' : 'Local DB'}</span>
              </span>
            </div>

            {/* Settings Modal Toggle */}
            <button
              onClick={onOpenSettings}
              title="Configure API Keys & Database"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-800/70 overflow-x-auto space-x-1 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-2.5 py-1.5 rounded whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('diagnosis')}
            className={`px-2.5 py-1.5 rounded whitespace-nowrap ${
              activeTab === 'diagnosis' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Diagnosis
          </button>
          <button
            onClick={() => setActiveTab('sprint')}
            className={`px-2.5 py-1.5 rounded whitespace-nowrap ${
              activeTab === 'sprint' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Adaptive Sprint
          </button>
          <button
            onClick={() => setActiveTab('interview')}
            className={`px-2.5 py-1.5 rounded whitespace-nowrap ${
              activeTab === 'interview' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Interview
          </button>
          <button
            onClick={() => setActiveTab('tracker')}
            className={`px-2.5 py-1.5 rounded whitespace-nowrap ${
              activeTab === 'tracker' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Tracker
          </button>
        </div>
      </div>
    </header>
  );
};
