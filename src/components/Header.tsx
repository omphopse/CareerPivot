import React, { useState, useRef, useEffect } from 'react';
import {
  Home,
  LayoutDashboard,
  FileSearch,
  CalendarCheck,
  Headphones,
  Briefcase,
  Plus,
  LogOut,
  Menu,
  X,
  User,
  ChevronDown,
  Check
} from 'lucide-react';
import type { AuthUser } from '../types';
import { PicassoCareerCompass } from './ArtIllustrations';

interface HeaderProps {
  activeTab: 'home' | 'dashboard' | 'diagnosis' | 'sprint' | 'interview' | 'tracker';
  setActiveTab: (tab: 'home' | 'dashboard' | 'diagnosis' | 'sprint' | 'interview' | 'tracker') => void;
  onStartNewAnalysis: () => void;
  streakCount?: number;
  currentUser?: AuthUser | null;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onStartNewAnalysis,
  currentUser,
  onSignOut
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [burgerMenuOpen, setBurgerMenuOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'home' as const, label: 'Home', icon: Home, desc: 'Overview & product tour' },
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard, desc: 'Career transition overview' },
    { id: 'diagnosis' as const, label: 'Skill Diagnosis', icon: FileSearch, desc: 'Forensic gap & evidence audit' },
    { id: 'sprint' as const, label: 'Adaptive Sprint', icon: CalendarCheck, desc: '7-day daily learning plan' },
    { id: 'interview' as const, label: 'Mock Interview', icon: Headphones, desc: 'Scenario & technical coaching' },
    { id: 'tracker' as const, label: 'Job Tracker', icon: Briefcase, desc: 'Application pipeline CRM' }
  ];

  const currentNav = navItems.find((item) => item.id === activeTab) || navItems[1];
  const CurrentIcon = currentNav.icon;

  // Handle clicking outside to close popovers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (burgerRef.current && !burgerRef.current.contains(event.target as Node)) {
        setBurgerMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
        setBurgerMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNavClick = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    setDropdownOpen(false);
    setBurgerMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#D9CFB9] bg-[#FFF7E8]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ─── Left: Brand Logo & Name ─── */}
          <div
            className="flex items-center space-x-2.5 cursor-pointer select-none"
            onClick={() => handleNavClick('dashboard')}
            title="Career Pivot Dashboard"
          >
            <PicassoCareerCompass size={32} />
            <span className="font-editorial text-xl sm:text-2xl font-bold tracking-tight text-[#293C3A]">
              Career Pivot
            </span>
          </div>

          {/* ─── Right: Actions, Module Selector & Burger Menu ─── */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Decluttered Module Dropdown Selector (Desktop & Tablet only: hidden on mobile) */}
            <div className="hidden sm:block relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  setDropdownOpen(!dropdownOpen);
                  setBurgerMenuOpen(false);
                }}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer shadow-2xs ${
                  dropdownOpen
                    ? 'bg-[#E8EBDD] border-[#C5D5BE] text-[#293C3A]'
                    : 'bg-[#FFF7E8] hover:bg-[#E8EBDD] border-[#D9CFB9] text-[#293C3A]'
                }`}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                title="Switch section"
              >
                <CurrentIcon className="w-3.5 h-3.5 text-[#C95F48]" />
                <span className="font-bold text-[#293C3A]">{currentNav.label}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#6B7169] transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180 text-[#C95F48]' : ''
                  }`}
                />
              </button>

              {/* Module Dropdown Popover */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#FFF7E8] border border-[#D9CFB9] shadow-lg py-1.5 z-50 animate-fadeIn">
                  <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6B7169] border-b border-[#D9CFB9]/60">
                    Switch Section
                  </div>
                  <div className="p-1 space-y-0.5">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs font-medium transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-[#C95F48] text-white shadow-2xs font-semibold'
                              : 'text-[#293C3A] hover:bg-[#E8EBDD]'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#466E67]'}`} />
                            <div className="flex flex-col">
                              <span>{item.label}</span>
                              <span className={`text-[10px] ${isActive ? 'text-white/80' : 'text-[#6B7169]'}`}>
                                {item.desc}
                              </span>
                            </div>
                          </div>
                          {isActive && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* New Assessment Quick Action */}
            <button
              onClick={() => {
                onStartNewAnalysis();
                setDropdownOpen(false);
                setBurgerMenuOpen(false);
              }}
              title="Start a new career assessment"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#D9CFB9] text-[#293C3A] bg-[#FFF7E8] hover:bg-[#E8EBDD] transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#C95F48]" />
              <span className="hidden sm:inline">New Assessment</span>
              <span className="sm:hidden">New</span>
            </button>

            {/* Burger Icon Menu Button (Available on Desktop, Tablet, & Mobile) */}
            <div className="relative" ref={burgerRef}>
              <button
                onClick={() => {
                  setBurgerMenuOpen(!burgerMenuOpen);
                  setDropdownOpen(false);
                }}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer shadow-2xs ${
                  burgerMenuOpen
                    ? 'bg-[#C95F48] text-white border-[#C95F48]'
                    : 'bg-[#FFF7E8] hover:bg-[#E8EBDD] border-[#D9CFB9] text-[#293C3A]'
                }`}
                aria-label="Toggle navigation menu"
                aria-expanded={burgerMenuOpen}
                title="Navigation Menu"
              >
                {burgerMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                <span className="hidden sm:inline font-medium">Menu</span>
              </button>

              {/* Burger Menu Popover Panel (Desktop, Tablet, & Mobile) */}
              {burgerMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-xl bg-[#FFF7E8] border border-[#D9CFB9] shadow-xl p-3 z-50 animate-fadeIn space-y-3">
                  {/* Account Header inside Menu */}
                  {currentUser && (
                    <div className="p-2.5 rounded-lg bg-[#F5EBD6] border border-[#D9CFB9] flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 truncate pr-2">
                        <User className="w-3.5 h-3.5 text-[#466E67] shrink-0" />
                        <span className="truncate font-semibold text-[#293C3A]" title={currentUser.email}>
                          {currentUser.email}
                        </span>
                      </div>
                      {onSignOut && (
                        <button
                          onClick={onSignOut}
                          className="flex items-center space-x-1 text-[#C95F48] font-bold hover:underline shrink-0 text-[11px] cursor-pointer"
                          title="Sign out"
                        >
                          <LogOut className="w-3 h-3" />
                          <span>Logout</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Navigation Links Grid / List */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B7169] px-2 py-1">
                      Navigation
                    </div>
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-[#C95F48] text-white shadow-2xs font-semibold'
                              : 'text-[#293C3A] hover:bg-[#E8EBDD]'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#466E67]'}`} />
                            <div className="text-left">
                              <div>{item.label}</div>
                              <div className={`text-[10px] ${isActive ? 'text-white/80' : 'text-[#6B7169]'}`}>
                                {item.desc}
                              </div>
                            </div>
                          </div>
                          {isActive && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Menu Footer Quick Action */}
                  <div className="pt-2 border-t border-[#D9CFB9] space-y-2">
                    <button
                      onClick={() => {
                        onStartNewAnalysis();
                        setBurgerMenuOpen(false);
                      }}
                      className="w-full art-btn-primary py-2 text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Start New Assessment</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
