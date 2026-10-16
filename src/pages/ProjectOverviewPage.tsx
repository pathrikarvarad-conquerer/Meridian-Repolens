import React, { useState } from 'react';
import { 
  GitBranch, 
  GitCommit, 
  Star, 
  GitFork, 
  ShieldCheck, 
  ExternalLink, 
  FolderTree, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle,
  FileCode,
  Layers,
  Sparkles,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useRepo } from '../context/RepoContext';
import { useUserMode } from '../context/UserModeContext';
import { useEvidenceDrawer } from '../context/EvidenceDrawerContext';
import { Card } from '../components/primitives/Card';
import { EvidenceBadge } from '../components/primitives/EvidenceBadge';
import { Button } from '../components/primitives/Button';
import { Link } from 'react-router-dom';

export const ProjectOverviewPage: React.FC = () => {
  const { currentRepo, overview } = useRepo();
  const { mode } = useUserMode();
  const { openEvidence } = useEvidenceDrawer();

  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  if (!currentRepo || !overview) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-sm text-neutral-500">No repository analyzed yet.</p>
        <Link to="/">
          <Button variant="primary">Analyze a Repository</Button>
        </Link>
      </div>
    );
  }

  const shortSha = currentRepo.commitSha.substring(0, 7);

  return (
    <div className="space-y-8">
      {/* Repository Header & Metadata */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-neutral-500">{currentRepo.owner} /</span>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                {currentRepo.name}
              </h1>
              <a
                href={currentRepo.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1"
                aria-label="View on GitHub"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-3xl">
              {currentRepo.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link to="/setup">
              <Button size="sm" variant="outline">
                Setup Doctor
              </Button>
            </Link>
            <Link to="/export">
              <Button size="sm" variant="primary">
                Export Guide
              </Button>
            </Link>
          </div>
        </div>

        {/* Metadata row with anti-slop unboxed metadata */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-1.5 font-mono">
            <GitBranch className="w-3.5 h-3.5 text-neutral-400" />
            <span>{currentRepo.defaultBranch}</span>
          </div>

          <span className="text-neutral-300 dark:text-neutral-700">·</span>

          <div className="flex items-center gap-1.5 font-mono">
            <GitCommit className="w-3.5 h-3.5 text-neutral-400" />
            <span>commit {shortSha}</span>
          </div>

          <span className="text-neutral-300 dark:text-neutral-700">·</span>

          <div>
            <span>Language: </span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">{currentRepo.primaryLanguage}</span>
          </div>

          <span className="text-neutral-300 dark:text-neutral-700">·</span>

          <div className="flex items-center gap-1 tabular-nums">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{currentRepo.stars.toLocaleString()}</span>
          </div>

          <span className="text-neutral-300 dark:text-neutral-700">·</span>

          <div className="flex items-center gap-1 tabular-nums">
            <GitFork className="w-3.5 h-3.5 text-neutral-400" />
            <span>{currentRepo.forks.toLocaleString()}</span>
          </div>

          <span className="text-neutral-300 dark:text-neutral-700">·</span>

          <div>
            <span>License: </span>
            <span className="font-mono">{currentRepo.license || 'None'}</span>
          </div>
        </div>
      </div>

      {/* Mode Banner */}
      {mode === 'beginner' ? (
        <div className="p-4 rounded-lg bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-blue-900 dark:text-blue-200">Beginner Guide Active: </span>
            <span className="text-blue-800 dark:text-blue-300">
              We have highlighted the essential entrypoints and a structured 5-step reading path below so you can get oriented without getting lost in monorepo details.
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-neutral-100/80 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">Enterprise Traceability Active: </span>
            <span className="text-neutral-600 dark:text-neutral-400">
              Every architectural claim, dependency version, and entry point includes verifiable file references and line numbers keyed to commit {shortSha}. Click any badge to inspect verification details.
            </span>
          </div>
        </div>
      )}

      {/* 2-Column Overview Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Purpose, Core Workflows & Reading Path */}
        <div className="lg:col-span-2 space-y-6">
          {/* Purpose & Target Audience */}
          <Card title="Project Purpose & Architecture">
            <div className="space-y-4">
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {overview.purpose}
              </p>

              <div>
                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  Target Audience
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  {overview.targetAudience}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  Core Runtime Workflows
                </h4>
                <ul className="space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                  {overview.coreWorkflows.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 font-bold shrink-0">→</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* Recommended Reading Path */}
          <Card
            title="Recommended Codebase Reading Path"
            subtitle="Follow this sequence to understand the codebase without feeling overwhelmed"
          >
            <div className="space-y-3">
              {overview.readingPath.map((step) => {
                const isExpanded = expandedStep === step.step;
                return (
                  <div
                    key={step.step}
                    className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-3.5 transition-colors"
                  >
                    <div
                      onClick={() => setExpandedStep(isExpanded ? null : step.step)}
                      className="flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-bold flex items-center justify-center shrink-0">
                          {step.step}
                        </span>
                        <div>
                          <div className="font-mono text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                            {step.path}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {step.title}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Clock className="w-3 h-3 text-neutral-400" />
                          <span>~{step.estimatedMinutes}m</span>
                        </span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs space-y-2">
                        <p className="text-neutral-700 dark:text-neutral-300">
                          <strong className="text-neutral-900 dark:text-neutral-100">Why read this: </strong>
                          {step.purpose}
                        </p>
                        <div>
                          <span className="text-neutral-500">Key concepts to look for: </span>
                          <span className="font-medium text-neutral-800 dark:text-neutral-200">
                            {step.keyConcepts.join(' · ')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Architecture Components */}
          <Card title="Major Architecture Components">
            <div className="space-y-4">
              {overview.architectureComponents.map((comp) => (
                <div
                  key={comp.id}
                  className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/40 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                        {comp.name}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                        {comp.type}
                      </span>
                    </div>
                    <EvidenceBadge
                      status={comp.evidence.status}
                      evidence={comp.evidence}
                    />
                  </div>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {comp.description}
                  </p>

                  <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800 text-[11px] flex flex-wrap items-center gap-x-4 gap-y-1">
                    <div>
                      <span className="text-neutral-400">Entry: </span>
                      <code className="font-mono text-neutral-700 dark:text-neutral-300">
                        {comp.entryFiles[0]}
                      </code>
                    </div>
                    {comp.dependencies.length > 0 && (
                      <div>
                        <span className="text-neutral-400">Dependencies: </span>
                        <span className="text-neutral-600 dark:text-neutral-400">
                          {comp.dependencies.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Tech Stack & Key Directories */}
        <div className="space-y-6">
          {/* Tech Stack */}
          <Card title="Detected Technology Stack">
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {overview.techStack.map((tech) => (
                <div key={tech.name} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                      {tech.name}
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      <span>{tech.category}</span>
                      {tech.version && <span> · {tech.version}</span>}
                    </div>
                  </div>
                  <EvidenceBadge
                    status={tech.evidence.status}
                    evidence={tech.evidence}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Entry Points */}
          <Card title="Repository Entry Points">
            <div className="space-y-3">
              {overview.entryPoints.map((ep) => (
                <div key={ep.path} className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                      {ep.path}
                    </span>
                    <EvidenceBadge
                      status={ep.evidence.status}
                      evidence={ep.evidence}
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-normal">
                    {ep.purpose}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Key Directories */}
          <Card title="Important Directories">
            <div className="space-y-2.5">
              {overview.keyDirectories.map((dir) => (
                <div key={dir.path} className="text-xs p-2 rounded bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/60 dark:border-neutral-800/80">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                      <FolderTree className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{dir.path}</span>
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {dir.fileCount} files
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-500">
                    {dir.role}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
