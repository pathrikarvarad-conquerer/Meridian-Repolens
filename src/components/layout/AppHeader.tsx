import React, { useState } from 'react';
import { 
  Code2, 
  Sun, 
  Moon, 
  ChevronDown, 
  Check, 
  ExternalLink,
  GitBranch,
  GitCommit,
  Play
} from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useRepo } from '../../context/RepoContext';
import { useToast } from '../../context/ToastContext';

export const AppHeader: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { currentRepo, recentRepos, loadSampleRepo } = useRepo();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [showRepoDropdown, setShowRepoDropdown] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/overview', label: 'Repositories' },
    { to: '/run', label: 'Run Online' },
    { to: '/reels', label: 'Repo Reels' },
    { to: '/issues', label: 'Issues' },
    { to: '/graph', label: 'Dependencies' },
    { to: '/setup', label: 'Setup Doctor' },
    { to: '/assistant', label: 'AI Assistant' },
    { to: '/settings', label: 'Settings' },
  ];

  const shortSha = currentRepo?.commitSha ? currentRepo.commitSha.substring(0, 7) : 'head';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--color-border-default)] bg-[var(--color-bg-surface)] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-6 min-w-0">
          <NavLink to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-primary)] text-white flex items-center justify-center shadow-xs">
              <Code2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-lg tracking-tight text-[var(--color-text-primary)]">
                RepoLens
              </span>
              <span className="hidden xl:inline text-xs text-[var(--color-text-muted)] font-medium">
                AI-Powered Insights for Your Code
              </span>
            </div>
          </NavLink>

          {/* Main Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = link.to === '/' 
                ? location.pathname === '/' 
                : location.pathname.startsWith(link.to);
              
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    isActive
                      ? 'text-[var(--color-brand-primary)] bg-[var(--color-brand-primary-soft)]'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface-2)]'
                  }`}
                >
                  {link.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Right: Repository Quick Select, Theme Toggle, Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {currentRepo?.isSampleData && (
            <span className="hidden sm:inline-flex items-center text-[10px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded">
              Demo/sample data
            </span>
          )}

          {/* Quick Run Online Action Button */}
          {currentRepo && (
            <NavLink
              to="/run"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Run repository online in sandbox"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Online</span>
            </NavLink>
          )}

          {/* Repository Selector Dropdown if active */}
          {currentRepo && (
            <div className="relative hidden lg:block">
              <button
                onClick={() => setShowRepoDropdown(!showRepoDropdown)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface-2)] hover:bg-[var(--color-bg-surface-3)] text-xs text-[var(--color-text-primary)] font-mono cursor-pointer transition-colors max-w-[190px] truncate"
              >
                <span className="truncate">{currentRepo.name}</span>
                <span className="text-[10px] text-[var(--color-text-muted)]">({shortSha})</span>
                <ChevronDown className="w-3 h-3 text-[var(--color-text-muted)] shrink-0 ml-auto" />
              </button>

              {showRepoDropdown && (
                <div className="absolute right-0 mt-1.5 w-64 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] shadow-lg p-1.5 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                    Active Repositories
                  </div>
                  {recentRepos.map((r) => (
                    <button
                      key={r.fullName}
                      onClick={() => {
                        loadSampleRepo(r.fullName);
                        setShowRepoDropdown(false);
                        addToast({
                          type: 'info',
                          title: 'Switched Repository',
                          message: `Loaded ${r.fullName}`
                        });
                      }}
                      className="w-full text-left px-3 py-2 text-xs flex items-center justify-between rounded-lg hover:bg-[var(--color-bg-surface-2)] text-[var(--color-text-primary)] cursor-pointer font-mono"
                    >
                      <span className="truncate">{r.fullName}</span>
                      {currentRepo.fullName === r.fullName && (
                        <Check className="w-3.5 h-3.5 text-[var(--color-brand-primary)] shrink-0" />
                      )}
                    </button>
                  ))}
                  <div className="border-t border-[var(--color-border-subtle)] mt-1 pt-1">
                    <button
                      onClick={() => {
                        setShowRepoDropdown(false);
                        navigate('/');
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-soft)] rounded-md cursor-pointer font-medium"
                    >
                      + Analyze new repository
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Theme Switcher Toggle - Pill style matching screenshot preview */}
          <div className="flex items-center p-0.5 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface-2)]">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                resolvedTheme === 'light'
                  ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
              title="Switch to Light Theme"
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                resolvedTheme === 'dark'
                  ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
              title="Switch to Dark Theme"
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dark</span>
            </button>
          </div>

          {/* User Avatar Circle 'V' from Screenshot */}
          <button
            onClick={() => navigate('/settings')}
            className="w-8 h-8 rounded-full bg-[var(--color-brand-primary)] text-white flex items-center justify-center text-xs font-bold shadow-xs hover:opacity-90 cursor-pointer transition-opacity shrink-0"
            title="User Profile & Settings"
            aria-label="User Profile"
          >
            V
          </button>
        </div>
      </div>
    </header>
  );
};
