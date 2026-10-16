import React from 'react';
import { 
  Settings as SettingsIcon, 
  Sun, 
  Moon, 
  Monitor, 
  Trash2, 
  GraduationCap, 
  Building2, 
  ShieldCheck, 
  Cpu, 
  Info,
  Check
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useUserMode } from '../context/UserModeContext';
import { useRepo } from '../context/RepoContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/primitives/Card';
import { Button } from '../components/primitives/Button';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { mode, setMode } = useUserMode();
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

      {/* Mode Setting */}
      <Card title="User Experience Persona" subtitle="Tailor the presentation hierarchy to your technical objectives">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => setMode('beginner')}
            className={`p-4 rounded-lg border text-left transition-all cursor-pointer space-y-2 ${
              mode === 'beginner'
                ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-100 dark:bg-neutral-800'
                : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-neutral-900 dark:text-neutral-100">
                <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Beginner Mode</span>
              </div>
              {mode === 'beginner' && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Focuses on plain-language concepts, guided 5-step reading order, step-by-step installation instructions, and good first issues.
            </p>
          </div>

          <div
            onClick={() => setMode('enterprise')}
            className={`p-4 rounded-lg border text-left transition-all cursor-pointer space-y-2 ${
              mode === 'enterprise'
                ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-100 dark:bg-neutral-800'
                : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-neutral-900 dark:text-neutral-100">
                <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Enterprise Mode</span>
              </div>
              {mode === 'enterprise' && <Check className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Prioritizes commit SHA traceability, evidence verification status, configuration inconsistency audits, and dependency security matrices.
            </p>
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
