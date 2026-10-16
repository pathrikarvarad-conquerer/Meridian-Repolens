import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  Stethoscope, 
  Target, 
  Download, 
  Github, 
  Sparkles,
  GitCommit,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';
import { useRepo } from '../context/RepoContext';
import { useToast } from '../context/ToastContext';
import { parseGitHubUrl } from '../services/api';

export const HomePage: React.FC = () => {
  const [repoInput, setRepoInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const { analyzeRepo, isAnalyzing, analysisProgress, recentRepos, loadSampleRepo, cancelAnalysis } = useRepo();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);

    const validation = parseGitHubUrl(repoInput);
    if (!validation.isValid) {
      setInputError(validation.error || 'Please enter a valid GitHub repository URL.');
      return;
    }

    const success = await analyzeRepo(repoInput);
    if (success) {
      addToast({
        type: 'success',
        title: 'Repository Analyzed',
        message: 'Successfully mapped architecture, setup requirements, and issues.'
      });
      navigate('/overview');
    }
  };

  const handleSelectSample = (fullName: string) => {
    loadSampleRepo(fullName);
    addToast({
      type: 'info',
      title: 'Repository Loaded',
      message: `Switched context to ${fullName}`
    });
    navigate('/overview');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Evidence-Based Codebase Intelligence</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 text-balance">
          Understand your codebase, faster.
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed text-pretty">
          RepoLens performs verified static analysis on repositories to extract architectural entry points, validate setup instructions against actual manifests, and map beginner-friendly issues.
        </p>
      </div>

      {/* Main Analysis Input Box */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 sm:p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="repo-url-input" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              GitHub Repository URL or <code className="font-mono text-neutral-600 dark:text-neutral-400">owner/repo</code>
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                <input
                  id="repo-url-input"
                  type="text"
                  value={repoInput}
                  onChange={(e) => {
                    setRepoInput(e.target.value);
                    if (inputError) setInputError(null);
                  }}
                  disabled={isAnalyzing}
                  placeholder="https://github.com/facebook/react or facebook/react"
                  className={`w-full h-11 pl-10 pr-4 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-850 border transition-all text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 ${
                    inputError
                      ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                      : 'border-neutral-300 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-neutral-100'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={isAnalyzing}
                className="h-11 px-6 rounded-lg text-sm font-semibold bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                <span>{isAnalyzing ? 'Analyzing...' : 'Analyze repository'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {inputError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium" role="alert">
                {inputError}
              </p>
            )}
          </div>
        </form>

        {/* Progress Display while analyzing */}
        {isAnalyzing && analysisProgress && (
          <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span>{analysisProgress.stageTitle}</span>
              </div>
              <button
                onClick={cancelAnalysis}
                className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
              >
                Cancel
              </button>
            </div>
            <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${Math.min(100, (analysisProgress.stageIndex + 1) * 20)}%` }}
              />
            </div>
            <p className="text-[11px] text-neutral-500">
              Stage {analysisProgress.stageIndex + 1} of 5 · Inspecting package manifests and commit evidence
            </p>
          </div>
        )}

        {/* Quick Sample Repositories */}
        <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <span className="text-xs text-neutral-500 font-medium mr-2">
            Try featured open-source repositories:
          </span>
          <div className="inline-flex flex-wrap gap-2 mt-2">
            {[
              { name: 'facebook/react', label: 'facebook/react', lang: 'JavaScript' },
              { name: 'tailwindlabs/tailwindcss', label: 'tailwindlabs/tailwindcss', lang: 'TypeScript' }
            ].map((sample) => (
              <button
                key={sample.name}
                type="button"
                onClick={() => handleSelectSample(sample.name)}
                className="text-xs font-mono px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer border border-neutral-200 dark:border-neutral-700"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Analyzed Repositories */}
      {recentRepos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Recently Analyzed Repositories</span>
            </span>
            <span className="font-mono">{recentRepos.length} cached</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentRepos.map((repo) => (
              <div
                key={repo.fullName}
                onClick={() => handleSelectSample(repo.fullName)}
                className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="min-w-0 pr-3">
                  <div className="font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                    {repo.fullName}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-1">
                    <span>{repo.primaryLanguage}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">★ {repo.stars.toLocaleString()}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform Capabilities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="p-4 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
          <Stethoscope className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
            Setup Doctor
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Extracts exact prerequisites, documented commands, and highlights inconsistencies between READMEs and package manifests.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
          <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
            Architecture Map
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Pins entrypoints, directory purposes, and provides a recommended 5-step reading path to master the core loops.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
          <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
            Issue Discovery
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Identifies beginner-friendly issues mapped directly to affected files, test suites, and prerequisite knowledge.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
          <Download className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
            Markdown Export
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Generates a comprehensive <code className="font-mono text-[11px]">ONBOARDING.md</code> file ready for team check-in or personal study.
          </p>
        </div>
      </div>
    </div>
  );
};
