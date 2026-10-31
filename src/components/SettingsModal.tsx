import React, { useState } from 'react';
import { X, Key, Database, Check, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { getGeminiApiKey, setGeminiApiKey, hasGeminiApiKey } from '../services/gemini';
import { getSupabaseConfig, setSupabaseConfig, isSupabaseConnected } from '../services/supabase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onResetData }) => {
  const [geminiKey, setGeminiKeyState] = useState(getGeminiApiKey());
  const [supabaseUrl, setSupabaseUrlState] = useState(getSupabaseConfig().url);
  const [supabaseKey, setSupabaseKeyState] = useState(getSupabaseConfig().key);
  const [savedMessage, setSavedMessage] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiApiKey(geminiKey.trim());
    setSupabaseConfig(supabaseUrl.trim(), supabaseKey.trim());
    setSavedMessage(true);
    setTimeout(() => {
      setSavedMessage(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-amber-400" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">System & API Settings</h2>
              <p className="text-xs text-slate-400">Configure real AI services and Supabase database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5 pt-4">
          {/* Gemini API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                <span>Google Gemini API Key</span>
                {hasGeminiApiKey() ? (
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Active
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                    Simulation Mode
                  </span>
                )}
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
              >
                <span>Get free key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={(e) => setGeminiKeyState(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <p className="text-[11px] text-slate-400">
              When left blank, Career Pilot seamlessly uses the high-accuracy offline AI simulation engine designed for hackathon judging.
            </p>
          </div>

          {/* Supabase Settings */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>Supabase Configuration (Optional)</span>
              </label>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded border ${
                  isSupabaseConnected()
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {isSupabaseConnected() ? 'Connected' : 'Hybrid Local Storage'}
              </span>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Supabase Project URL (https://xyz.supabase.co)"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrlState(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <input
                type="password"
                placeholder="Supabase Anon Public API Key"
                value={supabaseKey}
                onChange={(e) => setSupabaseKeyState(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Schema script is located at <code className="text-cyan-300">supabase/schema.sql</code>. If not configured, local hybrid storage caches all sprint progress and job tracker CRM items.
            </p>
          </div>

          {/* Data Reset & Demo Actions */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset application state back to the fresh Java Backend demo story?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="flex items-center space-x-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors py-1 px-2 rounded hover:bg-rose-500/10"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Demo State</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
              >
                {savedMessage ? <Check className="w-4 h-4 text-emerald-300" /> : null}
                <span>{savedMessage ? 'Saved!' : 'Save Configurations'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
