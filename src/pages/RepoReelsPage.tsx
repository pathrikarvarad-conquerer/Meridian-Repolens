import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ExternalLink, 
  ChevronUp, 
  ChevronDown, 
  Star, 
  Sparkles, 
  Code2, 
  Layers, 
  ArrowRight, 
  Loader2, 
  Plus, 
  Building2, 
  User, 
  Flame, 
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRepo } from '../context/RepoContext';
import { useToast } from '../context/ToastContext';
import { parseGitHubUrl } from '../services/api';

interface ReelRepoItem {
  id: string;
  owner: string;
  name: string;
  fullName: string;
  url: string;
  description: string;
  primaryLanguage: string;
  languageColor: string;
  stars: number;
  topics: string[];
  isOrg: boolean;
  avatarUrl: string;
  previewImageUrl: string;
  accentGradient: string;
}

const DEFAULT_REELS: ReelRepoItem[] = [
  {
    id: 'facebook/react',
    owner: 'facebook',
    name: 'react',
    fullName: 'facebook/react',
    url: 'https://github.com/facebook/react',
    description: 'The library for web and native user interfaces. Declarative component model with fiber reconciliation.',
    primaryLanguage: 'JavaScript',
    languageColor: '#f1e05a',
    stars: 228400,
    topics: ['ui', 'frontend', 'declarative', 'framework'],
    isOrg: true,
    avatarUrl: 'https://github.com/facebook.png?size=120',
    previewImageUrl: 'https://opengraph.githubassets.com/1/facebook/react',
    accentGradient: 'from-cyan-900/60 via-slate-900/90 to-black'
  },
  {
    id: 'tailwindlabs/tailwindcss',
    owner: 'tailwindlabs',
    name: 'tailwindcss',
    fullName: 'tailwindlabs/tailwindcss',
    url: 'https://github.com/tailwindlabs/tailwindcss',
    description: 'A utility-first CSS framework for rapid UI development with composeable utility classes and high-speed compiler.',
    primaryLanguage: 'TypeScript',
    languageColor: '#3178c6',
    stars: 84300,
    topics: ['css', 'styling', 'utilities', 'compiler'],
    isOrg: true,
    avatarUrl: 'https://github.com/tailwindlabs.png?size=120',
    previewImageUrl: 'https://opengraph.githubassets.com/1/tailwindlabs/tailwindcss',
    accentGradient: 'from-sky-950/70 via-slate-900/90 to-black'
  },
  {
    id: 'vercel/next.js',
    owner: 'vercel',
    name: 'next.js',
    fullName: 'vercel/next.js',
    url: 'https://github.com/vercel/next.js',
    description: 'The React Framework for the Web. Hybrid static & server rendering, TypeScript support, route pre-fetching, and zero config.',
    primaryLanguage: 'TypeScript',
    languageColor: '#3178c6',
    stars: 125000,
    topics: ['react', 'framework', 'ssr', 'fullstack'],
    isOrg: true,
    avatarUrl: 'https://github.com/vercel.png?size=120',
    previewImageUrl: 'https://opengraph.githubassets.com/1/vercel/next.js',
    accentGradient: 'from-zinc-900/80 via-neutral-900/95 to-black'
  },
  {
    id: 'astral-sh/uv',
    owner: 'astral-sh',
    name: 'uv',
    fullName: 'astral-sh/uv',
    url: 'https://github.com/astral-sh/uv',
    description: 'An extremely fast Python package and project manager, written in Rust. 10-100x faster than pip and pip-tools.',
    primaryLanguage: 'Rust',
    languageColor: '#dea584',
    stars: 45200,
    topics: ['python', 'package-manager', 'rust', 'cli'],
    isOrg: true,
    avatarUrl: 'https://github.com/astral-sh.png?size=120',
    previewImageUrl: 'https://opengraph.githubassets.com/1/astral-sh/uv',
    accentGradient: 'from-violet-950/70 via-slate-900/90 to-black'
  },
  {
    id: 'microsoft/vscode',
    owner: 'microsoft',
    name: 'vscode',
    fullName: 'microsoft/vscode',
    url: 'https://github.com/microsoft/vscode',
    description: 'Visual Studio Code is a code editor redefined and optimized for building and debugging modern web and cloud applications.',
    primaryLanguage: 'TypeScript',
    languageColor: '#3178c6',
    stars: 168000,
    topics: ['editor', 'developer-tools', 'electron'],
    isOrg: true,
    avatarUrl: 'https://github.com/microsoft.png?size=120',
    previewImageUrl: 'https://opengraph.githubassets.com/1/microsoft/vscode',
    accentGradient: 'from-blue-950/70 via-slate-900/90 to-black'
  },
  {
    id: 'torvalds/linux',
    owner: 'torvalds',
    name: 'linux',
    fullName: 'torvalds/linux',
    url: 'https://github.com/torvalds/linux',
    description: 'Linux kernel source tree. Foundational Unix-like operating system kernel created by Linus Torvalds.',
    primaryLanguage: 'C',
    languageColor: '#555555',
    stars: 184000,
    topics: ['kernel', 'operating-system', 'c', 'unix'],
    isOrg: false,
    avatarUrl: 'https://github.com/torvalds.png?size=120',
    previewImageUrl: 'https://opengraph.githubassets.com/1/torvalds/linux',
    accentGradient: 'from-amber-950/50 via-slate-900/90 to-black'
  },
  {
    id: 'oven-sh/bun',
    owner: 'oven-sh',
    name: 'bun',
    fullName: 'oven-sh/bun',
    url: 'https://github.com/oven-sh/bun',
    description: 'Incredibly fast JavaScript runtime, bundler, test runner, and package manager – all in one.',
    primaryLanguage: 'Zig',
    languageColor: '#ec915c',
    stars: 76000,
    topics: ['javascript', 'runtime', 'bundler', 'zig'],
    isOrg: true,
    avatarUrl: 'https://github.com/oven-sh.png?size=120',
    previewImageUrl: 'https://opengraph.githubassets.com/1/oven-sh/bun',
    accentGradient: 'from-rose-950/60 via-slate-900/90 to-black'
  },
  {
    id: 'supabase/supabase',
    owner: 'supabase',
    name: 'supabase',
    fullName: 'supabase/supabase',
    url: 'https://github.com/supabase/supabase',
    description: 'The open source Firebase alternative. Build an app in a weekend with Postgres Database, Authentication, real-time subscriptions, and Storage.',
    primaryLanguage: 'TypeScript',
    languageColor: '#3178c6',
    stars: 74500,
    topics: ['postgres', 'auth', 'database', 'realtime'],
    isOrg: true,
    avatarUrl: 'https://github.com/supabase.png?size=120',
    previewImageUrl: 'https://opengraph.githubassets.com/1/supabase/supabase',
    accentGradient: 'from-emerald-950/60 via-slate-900/90 to-black'
  }
];

export const RepoReelsPage: React.FC = () => {
  const { currentRepo, analyzeRepo } = useRepo();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [expandedDescMap, setExpandedDescMap] = useState<Record<string, boolean>>({});
  const [customInput, setCustomInput] = useState('');
  const [customError, setCustomError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Prepend currently analyzed repo if it is not already in the list
  const allReels = useMemo(() => {
    let list = [...DEFAULT_REELS];
    if (currentRepo && currentRepo.fullName) {
      const exists = list.some((r) => r.fullName.toLowerCase() === currentRepo.fullName.toLowerCase());
      if (!exists) {
        const currentItem: ReelRepoItem = {
          id: currentRepo.fullName,
          owner: currentRepo.owner,
          name: currentRepo.name,
          fullName: currentRepo.fullName,
          url: currentRepo.url,
          description: currentRepo.description || 'Analyzed open source project',
          primaryLanguage: currentRepo.primaryLanguage || 'TypeScript',
          languageColor: '#38bdf8',
          stars: currentRepo.stars || 1200,
          topics: currentRepo.tags?.slice(0, 4) || ['open-source'],
          isOrg: true,
          avatarUrl: `https://github.com/${currentRepo.owner}.png?size=120`,
          previewImageUrl: `https://opengraph.githubassets.com/1/${currentRepo.owner}/${currentRepo.name}`,
          accentGradient: 'from-blue-950/70 via-slate-900/90 to-black'
        };
        list = [currentItem, ...list];
      }
    }
    return list;
  }, [currentRepo]);

  // Filter reels by topic/language category
  const filteredReels = useMemo(() => {
    if (activeCategory === 'all') return allReels;
    if (activeCategory === 'web') return allReels.filter((r) => r.topics.some((t) => ['ui', 'frontend', 'css', 'react', 'styling'].includes(t)));
    if (activeCategory === 'systems') return allReels.filter((r) => ['Rust', 'C', 'Zig', 'Go'].includes(r.primaryLanguage) || r.topics.includes('kernel'));
    if (activeCategory === 'tools') return allReels.filter((r) => r.topics.some((t) => ['editor', 'cli', 'bundler', 'package-manager', 'database'].includes(t)));
    return allReels;
  }, [allReels, activeCategory]);

  const activeReel = filteredReels[currentIndex] || filteredReels[0];

  const handleNext = () => {
    if (currentIndex < filteredReels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Keyboard navigation for Instagram Reels
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, filteredReels.length]);

  const toggleExpandDesc = (id: string) => {
    setExpandedDescMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Analyze Now Action: Calls the existing RepoLens analyzeRepo workflow
  const handleAnalyzeNow = async (repo: ReelRepoItem) => {
    setAnalyzingId(repo.id);
    addToast({
      type: 'info',
      title: 'Analyzing Repository',
      message: `Running deterministic analysis for ${repo.fullName}...`
    });

    try {
      const success = await analyzeRepo(repo.url);
      if (success) {
        addToast({
          type: 'success',
          title: 'Analysis Complete',
          message: `Calibrated to ${repo.fullName}.`
        });
        navigate('/overview');
      } else {
        addToast({
          type: 'error',
          title: 'Analysis Failed',
          message: `Unable to analyze ${repo.fullName}. Please check GitHub rate limits.`
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: err?.message || 'Failed to analyze repository.'
      });
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleAddCustomRepo = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);
    const parsed = parseGitHubUrl(customInput);
    if (!parsed.isValid || !parsed.owner || !parsed.repo) {
      setCustomError(parsed.error || 'Please enter a valid GitHub URL or owner/repo format.');
      return;
    }

    const newItem: ReelRepoItem = {
      id: `${parsed.owner}/${parsed.repo}`,
      owner: parsed.owner,
      name: parsed.repo,
      fullName: `${parsed.owner}/${parsed.repo}`,
      url: `https://github.com/${parsed.owner}/${parsed.repo}`,
      description: `Discovered repository by ${parsed.owner}`,
      primaryLanguage: 'Code',
      languageColor: '#38bdf8',
      stars: 100,
      topics: ['custom-reel'],
      isOrg: false,
      avatarUrl: `https://github.com/${parsed.owner}.png?size=120`,
      previewImageUrl: `https://opengraph.githubassets.com/1/${parsed.owner}/${parsed.repo}`,
      accentGradient: 'from-cyan-950/60 via-slate-900/90 to-black'
    };

    allReels.unshift(newItem);
    setCustomInput('');
    setCurrentIndex(0);
    addToast({
      type: 'info',
      title: 'Added to Reels',
      message: `Now viewing 9:16 reel for ${newItem.fullName}.`
    });
  };

  return (
    <div className="min-h-[calc(100vh-8.5rem)] flex flex-col items-center justify-start pb-12 select-none">
      
      {/* Top Filter and Discovery Bar */}
      <div className="w-full max-w-xl mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--color-bg-surface-2)] border border-[var(--color-border-default)] text-xs">
          {[
            { id: 'all', label: 'All Reels' },
            { id: 'web', label: 'Web & UI' },
            { id: 'systems', label: 'Systems & OS' },
            { id: 'tools', label: 'DevTools' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setCurrentIndex(0);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[var(--color-bg-surface)] text-[var(--color-brand-primary)] shadow-2xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Custom Repo Quick Ingest */}
        <form onSubmit={handleAddCustomRepo} className="flex items-center gap-1.5 w-full sm:w-auto">
          <input
            type="text"
            value={customInput}
            onChange={(e) => {
              setCustomInput(e.target.value);
              if (customError) setCustomError(null);
            }}
            placeholder="Search / Add repo (e.g. rust-lang/rust)..."
            className="w-full sm:w-56 h-8 px-2.5 rounded-lg text-xs bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand-primary)]"
          />
          <button
            type="submit"
            className="h-8 px-2.5 rounded-lg bg-[var(--color-bg-surface-2)] hover:bg-[var(--color-bg-surface-3)] border border-[var(--color-border-default)] text-xs text-[var(--color-text-primary)] font-medium cursor-pointer shrink-0"
            title="Inspect as 9:16 Reel"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {customError && (
        <div className="w-full max-w-xl text-xs text-rose-500 mb-2 px-2 text-center font-mono">
          {customError}
        </div>
      )}

      {/* Main 9:16 Reel Viewport Container */}
      <div className="relative flex items-center justify-center w-full">
        
        {/* Desktop Vertical Up/Down Controls */}
        <div className="hidden md:flex flex-col gap-3 absolute right-[calc(50%-270px)] z-30">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="w-10 h-10 rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-surface-2)] text-[var(--color-text-primary)] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed shadow-md transition-all cursor-pointer"
            title="Previous Reel (Arrow Up)"
            aria-label="Previous Reel"
          >
            <ChevronUp className="w-5 h-5" />
          </button>

          <div className="text-center text-[10px] font-mono text-[var(--color-text-muted)] select-none">
            {currentIndex + 1} / {filteredReels.length}
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex === filteredReels.length - 1}
            className="w-10 h-10 rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-surface-2)] text-[var(--color-text-primary)] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed shadow-md transition-all cursor-pointer"
            title="Next Reel (Arrow Down)"
            aria-label="Next Reel"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* The 9:16 Portrait Reel Card */}
        {activeReel ? (
          <div
            ref={containerRef}
            className="w-full max-w-[420px] sm:max-w-[440px] aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl border border-[var(--color-border-default)] bg-black relative flex flex-col justify-between select-none animate-in fade-in duration-200"
            style={{
              maxHeight: 'calc(100vh - 12rem)'
            }}
          >
            {/* Visual Area: Real Social Preview Image or Abstract Generated Theme */}
            <div className="absolute inset-0 z-0">
              <img
                src={activeReel.previewImageUrl}
                alt={`${activeReel.fullName} social preview`}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback to CSS styled container if GitHub social image returns 404
                  (e.target as HTMLElement).style.display = 'none';
                }}
                className="w-full h-full object-cover object-center opacity-60 filter saturate-110"
              />

              {/* Multi-layered dark gradient scrim to guarantee high contrast typography */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/70" />
              <div className={`absolute inset-0 bg-gradient-to-br ${activeReel.accentGradient} opacity-40 mix-blend-overlay`} />
            </div>

            {/* A. Top Creator Profile Section */}
            <div className="relative z-10 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={activeReel.avatarUrl}
                  alt={activeReel.owner}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to initial monogram
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                  className="w-10 h-10 rounded-full border-2 border-white/20 object-cover shadow-sm shrink-0 bg-neutral-800"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-white font-bold text-sm truncate">
                    <span className="truncate">{activeReel.owner}</span>
                    {activeReel.isOrg ? (
                      <span title="Verified Organization">
                        <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      </span>
                    ) : (
                      <span title="Creator Profile">
                        <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-400 font-mono block">
                    github.com/{activeReel.owner}
                  </span>
                </div>
              </div>

              {/* Creator GitHub Profile Link */}
              <a
                href={`https://github.com/${activeReel.owner}`}
                target="_blank"
                rel="noreferrer noopener"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
                title={`Open ${activeReel.owner} on GitHub`}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* B. Mid Visual Content: Floating Code/Tech Accent */}
            <div className="relative z-10 px-6 flex-1 flex flex-col items-center justify-center text-center space-y-2 opacity-80 pointer-events-none">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-white shadow-lg">
                <Code2 className="w-7 h-7 stroke-[2]" style={{ color: activeReel.languageColor }} />
              </div>
              <span className="text-xs font-mono tracking-widest uppercase text-white/60">
                {activeReel.primaryLanguage}
              </span>
            </div>

            {/* C. Lower Portion: Repository Information & Analyze Now */}
            <div className="relative z-10 p-5 pt-0 space-y-3.5 bg-gradient-to-t from-black via-black/90 to-transparent">
              
              {/* Repo Identity: Logo / Icon & Name */}
              <div className="flex items-start gap-3">
                {/* Repository Logo / Monogram (Separate from Creator Avatar) */}
                <div 
                  className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm text-white shrink-0 shadow-md border border-white/20"
                  style={{ backgroundColor: activeReel.languageColor ? `${activeReel.languageColor}33` : '#3178c633' }}
                >
                  <span style={{ color: activeReel.languageColor || '#ffffff' }}>
                    {activeReel.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-black text-white tracking-tight truncate">
                    {activeReel.name}
                  </h2>
                  <span className="text-xs font-mono text-neutral-400 block truncate">
                    {activeReel.fullName}
                  </span>
                </div>
              </div>

              {/* Short Description (2-3 lines with expand toggle) */}
              <div>
                <p className={`text-xs text-neutral-200 leading-relaxed ${expandedDescMap[activeReel.id] ? '' : 'line-clamp-3'}`}>
                  {activeReel.description}
                </p>
                {activeReel.description && activeReel.description.length > 120 && (
                  <button
                    onClick={() => toggleExpandDesc(activeReel.id)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium mt-1 cursor-pointer block"
                  >
                    {expandedDescMap[activeReel.id] ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>

              {/* Compact Metadata: Language + Stars + Topics (Clean unboxed text) */}
              <div className="flex items-center gap-3 text-xs text-neutral-300 font-mono flex-wrap pt-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeReel.languageColor }} />
                  <span>{activeReel.primaryLanguage}</span>
                </div>

                <span className="text-neutral-500">·</span>

                <div className="flex items-center gap-1 text-amber-300">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="tabular-nums">{(activeReel.stars).toLocaleString()}</span>
                </div>

                {activeReel.topics[0] && (
                  <>
                    <span className="text-neutral-500">·</span>
                    <span className="text-neutral-400">#{activeReel.topics[0]}</span>
                  </>
                )}
              </div>

              {/* Primary Action Button: Analyze Now */}
              <button
                type="button"
                onClick={() => handleAnalyzeNow(activeReel)}
                disabled={analyzingId === activeReel.id}
                className="w-full h-11 rounded-xl bg-white text-black hover:bg-neutral-200 active:scale-98 font-bold text-xs tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {analyzingId === activeReel.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Analyzing Repository...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze Now</span>
                    <ArrowRight className="w-4 h-4 text-black" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[420px] aspect-[9/16] rounded-3xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] flex flex-col items-center justify-center text-center p-6 text-[var(--color-text-muted)] space-y-3">
            <Flame className="w-8 h-8 text-[var(--color-brand-primary)]" />
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">No Reels in this category</p>
            <button
              onClick={() => setActiveCategory('all')}
              className="text-xs text-[var(--color-brand-primary)] underline cursor-pointer"
            >
              Reset to All Reels
            </button>
          </div>
        )}
      </div>

      {/* Mobile Swipe / Next Footer Navigation */}
      <div className="flex md:hidden items-center justify-center gap-4 mt-4 text-xs font-mono text-[var(--color-text-muted)]">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-3 py-1.5 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] disabled:opacity-30 cursor-pointer"
        >
          Previous
        </button>
        <span>{currentIndex + 1} / {filteredReels.length}</span>
        <button
          onClick={handleNext}
          disabled={currentIndex === filteredReels.length - 1}
          className="px-3 py-1.5 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] disabled:opacity-30 cursor-pointer"
        >
          Next Reel
        </button>
      </div>
    </div>
  );
};
