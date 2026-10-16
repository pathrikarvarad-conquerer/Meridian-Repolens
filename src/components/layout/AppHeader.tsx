import React, { useState } from 'react';
import { 
  GitBranch, 
  GitCommit, 
  Moon, 
  Sun, 
  Monitor, 
  SlidersHorizontal, 
  Search, 
  ExternalLink,
  ChevronDown,
  Sparkles,
  Check,
  Building2,
  GraduationCap
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useUserMode } from '../../context/UserModeContext';
import { useRepo } from '../../context/RepoContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

interface AppHeaderProps {
  onOpenSearch?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenSearch }) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { mode, setMode } = useUserMode();
  const { currentRepo, recentRepos, loadSampleRepo } = useRepo();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [showRepoDropdown, setShowRepoDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);

  const shortSha = currentRepo?.commitSha ? currentRepo.commitSha.substring(0, 7) : 'head';

  return (
    <header className="h-14 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 lg:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 select-none">
      {/* Left: Breadcrumbs & Repository Selector */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 group cursor-pointer shrink-0"
        >
          <div className="w-7 h-7 rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs tracking-tighter">
            RL
          </div>
          <span className="font-bold text-sm tracking-tight text-neutral-900 dark:text-neutral-100 hidden sm:inline-block">
            RepoLens
          </span>
        </button>

        <span className="text-neutral-300 dark:text-neutral-700" aria-hidden="true">/</span>

        {/* Repository selector dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRepoDropdown(!showRepoDropdown)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-xs font-semibold text-neutral-800 dark:text-neutral-200 cursor-pointer max-w-[220px] sm:max-w-xs truncate"
            aria-expanded={showRepoDropdown}
          >
            <span className="truncate">{currentRepo ? currentRepo.fullName : 'Select Repository'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          </button>

          {showRepoDropdown && (
            <div className="absolute left-0 mt-1 w-64 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg py-1.5 z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Switch Analyzed Repository
              </div>
              {recentRepos.map((r) => (
                <button
                  key={r.fullName}
                  onClick={() => {
                    loadSampleRepo(r.fullName);
                    setShowRepoDropdown(false);
                    addToast({
                      type: 'info',
                      title: 'Loaded Repository',
                      message: `Switched active context to ${r.fullName}`
                    });
                  }}
                  className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 cursor-pointer"
                >
                  <span className="font-mono truncate">{r.fullName}</span>
                  {currentRepo?.fullName === r.fullName && (
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  )}
                </button>
              ))}
              <div className="border-t border-neutral-100 dark:border-neutral-800 mt-1 pt-1">
                <button
                  onClick={() => {
                    setShowRepoDropdown(false);
                    navigate('/');
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
                >
                  + Analyze another repository
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Git branch & commit pill */}
        {currentRepo && (
          <div className="hidden md:flex items-center gap-2 text-xs text-neutral-500 font-mono">
            <span className="flex items-center gap-1">
              <GitBranch className="w-3 h-3 text-neutral-400" />
              <span>{currentRepo.defaultBranch}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <GitCommit className="w-3 h-3 text-neutral-400" />
              <span>{shortSha}</span>
            </span>
          </div>
        )}
      </div>

      {/* Right Controls: Search, Mode Switch, Theme, External link */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Quick Search Button */}
        <button
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs text-neutral-500 cursor-pointer"
          aria-label="Search repository knowledge"
        >
          <Search className="w-3.5 h-3.5 text-neutral-400" />
          <span>Quick search...</span>
          <kbd className="text-[10px] bg-neutral-200 dark:bg-neutral-700 px-1 py-0.5 rounded text-neutral-600 dark:text-neutral-300">
            ⌘K
          </kbd>
        </button>

        {/* Beginner vs Enterprise Mode Toggle */}
        <div className="flex items-center p-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <button
            onClick={() => {
              setMode('beginner');
              addToast({
                type: 'info',
                title: 'Beginner Mode Enabled',
                message: 'Simplified explanations, learning paths, and plain-language guidance.'
              });
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
              mode === 'beginner'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-2xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
            title="Beginner Mode: Plain-language explanations, learning paths, and setup walkthroughs"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Beginner</span>
          </button>
          <button
            onClick={() => {
              setMode('enterprise');
              addToast({
                type: 'info',
                title: 'Enterprise Mode Enabled',
                message: 'Traceability matrices, commit revisions, configuration audits, and risk indicators.'
              });
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
              mode === 'enterprise'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-2xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
            title="Enterprise Mode: Evidence traceability, commit verification, and architectural inspection"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Enterprise</span>
          </button>
        </div>

        {/* Theme Selector */}
        <div className="relative">
          <button
            onClick={() => setShowThemeDropdown(!showThemeDropdown)}
            className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
            aria-label="Theme selector"
          >
            {resolvedTheme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {showThemeDropdown && (
            <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg py-1 z-50">
              <button
                onClick={() => {
                  setTheme('light');
                  setShowThemeDropdown(false);
                }}
                className="w-full px-3 py-1.5 text-xs text-left flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 cursor-pointer"
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
                {theme === 'light' && <Check className="w-3 h-3 ml-auto text-blue-600" />}
              </button>
              <button
                onClick={() => {
                  setTheme('dark');
                  setShowThemeDropdown(false);
                }}
                className="w-full px-3 py-1.5 text-xs text-left flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 cursor-pointer"
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
                {theme === 'dark' && <Check className="w-3 h-3 ml-auto text-blue-600" />}
              </button>
              <button
                onClick={() => {
                  setTheme('system');
                  setShowThemeDropdown(false);
                }}
                className="w-full px-3 py-1.5 text-xs text-left flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 cursor-pointer"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>System</span>
                {theme === 'system' && <Check className="w-3 h-3 ml-auto text-blue-600" />}
              </button>
            </div>
          )}
        </div>

        {/* View on GitHub */}
        {currentRepo && (
          <a
            href={currentRepo.url}
            target="_blank"
            rel="noreferrer noopener"
            className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors hidden md:inline-flex"
            title="View original repository on GitHub"
            aria-label="View on GitHub"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </header>
  );
};
