import React from 'react';
import { 
  Settings as SettingsIcon, 
  Sun, 
  Moon, 
  Monitor, 
  Trash2, 
  Building2, 
  ShieldCheck, 
  Cpu, 
  Info,
  Check
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useRepo } from '../context/RepoContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/primitives/Card';
import { Button } from '../components/primitives/Button';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { recentRepos } = useRepo();
  const { addToast } = useToast();

  const handleClearRecent = () => {
    localStorage.removeItem('repolens-recent-repos');
    addToast({
      type: 'success',
      title: 'Recent Repositories Cleared',
      message: 'Your cached analysis history has been reset.'
    });
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <SettingsIcon className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            Settings & Preferences
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
          Configure appearance, analysis personas, and local storage preferences.
        </p>
      </div>

      {/* Theme Setting */}
      <Card title="Interface Theme" subtitle="Select your preferred color scheme across all views">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Light', icon: Sun, desc: 'Clean high-contrast paper background' },
            { id: 'dark', label: 'Dark', icon: Moon, desc: 'Low-light slate surface' },
            { id: 'system', label: 'System', icon: Monitor, desc: 'Matches workstation preference' }
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = theme === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTheme(item.id as any)}
                className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-100 dark:bg-neutral-800'
                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                </div>
                <p className="text-[11px] text-neutral-500 leading-tight">
                  {item.desc}
                </p>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Enterprise Platform Configuration */}
      <Card title="Analysis & Governance Configuration" subtitle="Commit-pinned analysis and telemetry policies">
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-surface-2)] border border-[var(--color-border-default)]">
            <div>
              <span className="font-semibold text-[var(--color-text-primary)] block">
                Unified Enterprise Intelligence
              </span>
              <span className="text-[11px] text-[var(--color-text-muted)]">
                All claims, dependencies, and setup findings are anchored to immutable commit SHAs with source line provenance.
              </span>
            </div>
            <span className="text-[11px] font-mono font-medium text-[var(--color-status-verified-text)] bg-[var(--color-status-verified-bg)] px-2 py-0.5 rounded border border-[var(--color-status-verified-border)]">
              Enforced
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-surface-2)] border border-[var(--color-border-default)]">
            <div>
              <span className="font-semibold text-[var(--color-text-primary)] block">
                Zero-Secret Exposure Policy
              </span>
              <span className="text-[11px] text-[var(--color-text-muted)]">
                Environment variables are audited for keys only. Actual values and tokens are never read, stored, or exported.
              </span>
            </div>
            <span className="text-[11px] font-mono font-medium text-[var(--color-brand-primary)] bg-[var(--color-brand-primary-soft)] px-2 py-0.5 rounded border border-[var(--color-brand-primary)]/20">
              Active
            </span>
          </div>
        </div>
      </Card>

      {/* Model Provider & Engine Info */}
      <Card title="Analysis & AI Provider Status" subtitle="Active inference and parsing engines">
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4 text-blue-600" />
              <div>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                  RepoLens Static Verification Engine
                </span>
                <span className="text-[11px] text-neutral-500">
                  AST Parser · Manifest Extractor · Evidence Correlator
                </span>
              </div>
            </div>
            <span className="text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400">
              Active / Optimal
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <div>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                  Grounding & Evidence Contract
                </span>
                <span className="text-[11px] text-neutral-500">
                  Unvalidated model outputs are never displayed as verified evidence
                </span>
              </div>
            </div>
            <span className="text-[11px] font-mono text-neutral-500">
              Enforced
            </span>
          </div>
        </div>
      </Card>

      {/* Storage & Privacy */}
      <Card title="Local Storage & Cache" subtitle="Manage cached repositories and session state">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 block">
              Clear Analysis History
            </span>
            <span className="text-[11px] text-neutral-500">
              Removes {recentRepos.length} cached repositories from browser localStorage.
            </span>
          </div>
          <Button
            size="sm"
            variant="danger"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={handleClearRecent}
          >
            Clear History
          </Button>
        </div>
      </Card>
    </div>
  );
};
