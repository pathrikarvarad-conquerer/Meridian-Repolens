import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink,
  Code2,
  Sparkles,
  GitBranch,
  Layers,
  FileCode2,
  Info,
  Star,
  ChevronRight,
  BookOpen,
  Compass,
  Zap,
  Terminal
} from 'lucide-react';
import { useRepo } from '../context/RepoContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { parseGitHubUrl } from '../services/api';

export const HomePage: React.FC = () => {
  const [repoInput, setRepoInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const { analyzeRepo, isAnalyzing, analysisProgress, loadSampleRepo, cancelAnalysis } = useRepo();
  const { addToast } = useToast();
  const { resolvedTheme } = useTheme();
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
        message: 'Loaded architecture, setup doctor, and issue intelligence.'
      });
      navigate('/overview');
    }
  };

  const handleSelectRepository = (fullName: string) => {
    loadSampleRepo(fullName);
    addToast({
      type: 'info',
      title: 'Repository Loaded',
      message: `Analyzing and exploring ${fullName}`
    });
    navigate('/overview');
  };

  // Popular repositories list matching the screenshot
  const popularRepositories = [
    {
      fullName: 'facebook/react',
      owner: 'facebook',
      name: 'react',
      description: 'A JavaScript library for building user interfaces',
      language: 'JavaScript',
      languageColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      stars: '222k',
      updated: '2 days ago',
      iconBg: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400'
    },
    {
      fullName: 'microsoft/vscode',
      owner: 'microsoft',
      name: 'vscode',
      description: 'Visual Studio Code editor',
      language: 'TypeScript',
      languageColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
      stars: '168k',
      updated: '3 days ago',
      iconBg: 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
    },
    {
      fullName: 'tensorflow/tensorflow',
      owner: 'tensorflow',
      name: 'tensorflow',
      description: 'Machine learning framework',
      language: 'Python',
      languageColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      stars: '150k',
      updated: '4 days ago',
      iconBg: 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
    },
    {
      fullName: 'vercel/next.js',
      owner: 'vercel',
      name: 'next.js',
      description: 'The React Framework for production',
      language: 'TypeScript',
      languageColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
      stars: '124k',
      updated: '5 days ago',
      iconBg: 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900'
    },
    {
      fullName: 'tailwindlabs/tailwindcss',
      owner: 'tailwindlabs',
      name: 'tailwindcss',
      description: 'A utility-first CSS framework for rapid UI development',
      language: 'TypeScript',
      languageColor: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
      stars: '84k',
      updated: '1 day ago',
      iconBg: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400'
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section matching the Screenshot */}
      <section className="relative pt-6 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[var(--color-text-primary)] leading-[1.1]">
              Understand Your <br />
              Codebase,{' '}
              <span className="text-[var(--color-brand-primary)]">
                Faster
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-xl text-pretty font-normal">
              RepoLens helps you analyze public GitHub repositories, find key issues, understand project structure, and set up your project with AI — all in one place.
            </p>

            {/* Instant Repository Analysis Input Form */}
            <form onSubmit={handleSubmit} className="space-y-2 max-w-xl">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={repoInput}
                    onChange={(e) => {
                      setRepoInput(e.target.value);
                      if (inputError) setInputError(null);
                    }}
                    disabled={isAnalyzing}
                    placeholder="Enter GitHub URL (e.g. facebook/react)"
                    className={`w-full h-12 pl-4 pr-4 rounded-xl text-sm bg-[var(--color-bg-surface)] border shadow-xs transition-all text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] ${
                      inputError
                        ? 'border-[var(--color-status-failed)] focus:ring-1 focus:ring-[var(--color-status-failed)]'
                        : 'border-[var(--color-border-default)] focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-focus)]/20'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="h-12 px-6 rounded-xl font-semibold text-sm bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-primary-hover)] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <span>{isAnalyzing ? 'Analyzing...' : 'Analyze'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {inputError && (
                <p className="text-xs text-[var(--color-status-failed-text)] bg-[var(--color-status-failed-bg)] p-2 rounded-lg border border-[var(--color-status-failed-border)]" role="alert">
                  {inputError}
                </p>
              )}
            </form>

            {/* Progress Bar when Analysis is Active */}
            {isAnalyzing && analysisProgress && (
              <div className="max-w-xl p-4 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-brand-primary)] animate-ping" />
                    <span>{analysisProgress.stageTitle}</span>
                  </span>
                  <button
                    onClick={cancelAnalysis}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                </div>
                <div className="w-full bg-[var(--color-bg-surface-3)] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[var(--color-brand-primary)] h-full transition-all duration-300 rounded-full"
                    style={{ width: `${Math.min(100, (analysisProgress.stageIndex + 1) * 20)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Hero Buttons Matching Screenshot */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  const elem = document.getElementById('popular-repos');
                  elem?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="h-11 px-5 rounded-xl font-semibold text-sm bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-primary-hover)] shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Repositories</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/overview')}
                className="h-11 px-5 rounded-xl font-semibold text-sm bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] hover:bg-[var(--color-bg-surface-2)] text-[var(--color-text-primary)] transition-all cursor-pointer shadow-2xs"
              >
                View Documentation
              </button>
            </div>
          </div>

          {/* Right Hero Column: Code Window & Floating Orbiting Badges */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[380px]">
            {/* Ambient background glow */}
            <div 
              className={`absolute inset-0 pointer-events-none rounded-3xl ${
                resolvedTheme === 'dark' ? 'hero-glow-dark' : 'hero-glow-light'
              }`}
            />

            {/* Simulated Code Card */}
            <div className="relative w-full max-w-md rounded-2xl border border-[#233650] bg-[#0E1A2B] text-[#E8EEF8] p-5 shadow-2xl space-y-4">
              {/* Window Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#233650]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#1E2E44] flex items-center justify-center text-white">
                    <Code2 className="w-3.5 h-3.5 text-[#4D7CFF]" />
                  </div>
                  <span className="font-mono text-xs text-[#B0BED2] font-semibold">repolens-analyzer.ts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
              </div>

              {/* Code Editor Simulated Lines */}
              <div className="font-mono text-[11px] leading-relaxed space-y-2 py-1 select-none">
                <div className="text-[#8798B2]">
                  <span className="text-[#4D7CFF]">import</span> &#123; createEngine &#125; <span className="text-[#4D7CFF]">from</span> <span className="text-emerald-400">'@repolens/core'</span>;
                </div>
                <div className="text-[#8798B2]">
                  <span className="text-[#4D7CFF]">const</span> repo = <span className="text-[#4D7CFF]">await</span> engine.ingest(<span className="text-emerald-400">'facebook/react'</span>);
                </div>
                <div className="pl-3 border-l-2 border-[#314A6E] space-y-1 my-2 text-xs">
                  <div className="text-emerald-400">✓ Manifest verified: yarn workspaces</div>
                  <div className="text-blue-400">✓ Entrypoint: packages/react/index.js</div>
                  <div className="text-purple-400">✓ 3 curated first issues mapped</div>
                </div>
                <div className="text-[#B0BED2]">
                  <span className="text-[#4D7CFF]">return</span> repo.generateOnboardingGuide();
                </div>
              </div>

              <div className="pt-2 border-t border-[#233650] flex items-center justify-between text-[10px] font-mono text-[#8798B2]">
                <span>Status: Deterministic check passed</span>
                <span className="text-[#55D6A0]">● Ready</span>
              </div>
            </div>

            {/* Floating Orbiting Badges matching Screenshot */}
            {/* 1. Top Right: Project Analysis */}
            <button
              onClick={() => navigate('/overview')}
              className="absolute -top-3 -right-2 sm:right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-md text-xs font-semibold cursor-pointer hover:scale-105 transition-transform"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-brand-primary)]" />
              <span>Project Analysis</span>
            </button>

            {/* 2. Middle Right: Issues & Insights */}
            <button
              onClick={() => navigate('/issues')}
              className="absolute top-28 -right-3 sm:-right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-md text-xs font-semibold cursor-pointer hover:scale-105 transition-transform"
            >
              <Info className="w-3.5 h-3.5 text-[var(--color-brand-primary)]" />
              <span>Issues & Insights</span>
            </button>

            {/* 3. Bottom Left: Dependencies */}
            <button
              onClick={() => navigate('/graph')}
              className="absolute bottom-2 -left-2 sm:-left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-md text-xs font-semibold cursor-pointer hover:scale-105 transition-transform"
            >
              <Layers className="w-3.5 h-3.5 text-[var(--color-brand-primary)]" />
              <span>Dependencies</span>
            </button>

            {/* 4. Bottom Right: AI Assistant */}
            <button
              onClick={() => navigate('/assistant')}
              className="absolute -bottom-3 right-6 sm:right-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-md text-xs font-semibold cursor-pointer hover:scale-105 transition-transform"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-status-partial)]" />
              <span>AI Assistant</span>
            </button>
          </div>
        </div>
      </section>

      {/* Key Features Section matching the Screenshot */}
      <section className="space-y-6 pt-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Key Features
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Everything you need to get started with any open-source project.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Repository Analysis */}
          <div
            onClick={() => navigate('/overview')}
            className="p-5 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] hover:border-[var(--color-brand-primary)] hover:shadow-sm transition-all cursor-pointer space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-primary-soft)] text-[var(--color-brand-primary)] flex items-center justify-center">
              <Search className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="font-bold text-base text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-primary)] transition-colors">
              Repository Analysis
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Get a complete overview of any public GitHub repository with AI-powered insights.
            </p>
          </div>

          {/* Card 2: Issue Management */}
          <div
            onClick={() => navigate('/issues')}
            className="p-5 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] hover:border-[var(--color-brand-primary)] hover:shadow-sm transition-all cursor-pointer space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-primary-soft)] text-[var(--color-brand-primary)] flex items-center justify-center">
              <Info className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="font-bold text-base text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-primary)] transition-colors">
              Issue Management
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Find and understand issues quickly with smart summaries and priorities.
            </p>
          </div>

          {/* Card 3: Project Structure */}
          <div
            onClick={() => navigate('/graph')}
            className="p-5 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] hover:border-[var(--color-brand-primary)] hover:shadow-sm transition-all cursor-pointer space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-primary-soft)] text-[var(--color-brand-primary)] flex items-center justify-center">
              <GitBranch className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="font-bold text-base text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-primary)] transition-colors">
              Project Structure
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Explore the codebase structure, key files, and dependencies at a glance.
            </p>
          </div>

          {/* Card 4: AI Assistant */}
          <div
            onClick={() => navigate('/assistant')}
            className="p-5 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] hover:border-[var(--color-brand-primary)] hover:shadow-sm transition-all cursor-pointer space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-primary-soft)] text-[var(--color-brand-primary)] flex items-center justify-center">
              <Sparkles className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="font-bold text-base text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-primary)] transition-colors">
              AI Assistant
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Generate guides, get answers, and run the project locally with AI support.
            </p>
          </div>
        </div>
      </section>

      {/* Popular Repositories Section matching the Screenshot */}
      <section id="popular-repos" className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
              Popular Repositories
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Explore trending open-source projects and get started in seconds.
            </p>
          </div>

          <button
            onClick={() => handleSelectRepository('facebook/react')}
            className="text-xs font-semibold text-[var(--color-brand-primary)] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Structured Data Table matching Screenshot */}
        <div className="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--color-border-default)] bg-[var(--color-bg-surface-2)] text-[var(--color-text-muted)] font-semibold">
                  <th className="py-3 px-5">Repository</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Stars</th>
                  <th className="py-3 px-4">Updated</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {popularRepositories.map((repo) => (
                  <tr
                    key={repo.fullName}
                    onClick={() => handleSelectRepository(repo.fullName)}
                    className="hover:bg-[var(--color-bg-surface-2)] transition-colors cursor-pointer group"
                  >
                    {/* Repository title and desc */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${repo.iconBg}`}>
                          {repo.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-primary)] transition-colors">
                            {repo.fullName}
                          </span>
                          <p className="text-xs text-[var(--color-text-muted)] truncate max-w-xs sm:max-w-md">
                            {repo.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Language Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${repo.languageColor}`}>
                        {repo.language}
                      </span>
                    </td>

                    {/* Stars */}
                    <td className="py-4 px-4 whitespace-nowrap font-mono tabular-nums text-[var(--color-text-primary)]">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{repo.stars}</span>
                      </span>
                    </td>

                    {/* Updated */}
                    <td className="py-4 px-4 whitespace-nowrap text-[var(--color-text-muted)]">
                      {repo.updated}
                    </td>

                    {/* Arrow Action */}
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-primary)] group-hover:translate-x-0.5 transition-all inline-block" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
