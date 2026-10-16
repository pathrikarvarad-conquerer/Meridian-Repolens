import React, { useState } from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  FileText, 
  BookOpen, 
  ShieldCheck, 
  ExternalLink,
  Code
} from 'lucide-react';
import { useRepo } from '../context/RepoContext';
import { useToast } from '../context/ToastContext';
import { generateOnboardingMarkdown, downloadMarkdownFile } from '../services/markdownExporter';
import { Button } from '../components/primitives/Button';
import { Card } from '../components/primitives/Card';

export const ExportGuidePage: React.FC = () => {
  const { currentRepo, overview, setupDoctor, issues } = useRepo();
  const { addToast } = useToast();

  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'raw'>('preview');

  if (!currentRepo || !overview || !setupDoctor) {
    return (
      <div className="py-16 text-center text-neutral-500 text-sm">
        Please analyze a repository first to export its onboarding guide.
      </div>
    );
  }

  const markdownContent = generateOnboardingMarkdown(
    currentRepo,
    overview,
    setupDoctor,
    issues
  );

  const handleDownload = () => {
    const filename = `${currentRepo.name.toUpperCase()}_ONBOARDING.md`;
    downloadMarkdownFile(markdownContent, filename);
    addToast({
      type: 'success',
      title: 'Download Started',
      message: `Saved ${filename} to your workstation.`
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    addToast({
      type: 'info',
      title: 'Copied Markdown',
      message: 'Onboarding guide markdown copied to clipboard.'
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Export Onboarding Guide
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
            Generate and download a clean, standalone <code className="font-mono text-neutral-900 dark:text-neutral-100">ONBOARDING.md</code> for {currentRepo.fullName}.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center p-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 text-xs mr-2">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-2xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Formatted Preview
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'raw'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-2xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Raw Markdown
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            onClick={handleCopy}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>

          <Button
            size="sm"
            variant="primary"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleDownload}
          >
            Download ONBOARDING.md
          </Button>
        </div>
      </div>

      {/* Guide Content Display */}
      {viewMode === 'raw' ? (
        <Card title="Raw Markdown Output">
          <pre className="font-mono text-xs text-neutral-800 dark:text-neutral-200 bg-neutral-50 dark:bg-neutral-950 p-4 rounded-lg overflow-x-auto whitespace-pre leading-relaxed select-all border border-neutral-200 dark:border-neutral-800">
            {markdownContent}
          </pre>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Table of Contents sidebar (1 span) */}
          <div className="space-y-4">
            <Card title="Table of Contents">
              <nav className="space-y-2 text-xs">
                {[
                  '1. Project Overview',
                  '2. Prerequisites & System Setup',
                  '3. Building & Testing',
                  '4. Important Directories',
                  '5. Recommended Reading Path',
                  '6. Recommended Issues',
                  '7. Limitations & Disclaimers'
                ].map((item, idx) => (
                  <div key={idx} className="text-neutral-600 dark:text-neutral-400 py-0.5">
                    {item}
                  </div>
                ))}
              </nav>
            </Card>

            <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-neutral-900 dark:text-neutral-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Zero Secrets Policy</span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-normal">
                No environment secrets, API tokens, or proprietary credentials are included in this markdown file.
              </p>
            </div>
          </div>

          {/* Formatted Preview Box (3 spans) */}
          <div className="lg:col-span-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 sm:p-8 shadow-2xs space-y-8 font-sans">
            <div>
              <span className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
                RepoLens Onboarding Guide
              </span>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                {currentRepo.fullName}
              </h2>
              <div className="flex items-center gap-2 text-xs text-neutral-500 mt-2 font-mono">
                <span>Commit: {currentRepo.commitSha.substring(0, 7)}</span>
                <span aria-hidden="true">·</span>
                <span>Branch: {currentRepo.defaultBranch}</span>
                <span aria-hidden="true">·</span>
                <span>Language: {currentRepo.primaryLanguage}</span>
              </div>
            </div>

            {/* Section 1 */}
            <div className="space-y-3 pt-6 border-t border-neutral-100 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                1. Project Overview
              </h3>
              <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {overview.purpose}
              </p>
              <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
                <strong>Core Workflows:</strong>
                <ul className="list-disc pl-5 space-y-0.5">
                  {overview.coreWorkflows.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Section 2 */}
            <div className="space-y-3 pt-6 border-t border-neutral-100 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                2. Prerequisites & System Setup
              </h3>
              <div className="bg-neutral-50 dark:bg-neutral-850 p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs space-y-2">
                <strong>Detected Toolchain Requirements:</strong>
                <ul className="space-y-1">
                  {setupDoctor.prerequisites.map((p) => (
                    <li key={p.name} className="flex items-center justify-between">
                      <span>• {p.name}: <code className="font-mono">{p.versionRequirement}</code></span>
                      <span className="text-[11px] text-neutral-400 font-mono">({p.detectedIn})</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Installation Command:
                </span>
                <pre className="font-mono text-xs bg-neutral-900 text-neutral-100 p-3 rounded overflow-x-auto">
                  {setupDoctor.installCommands[0]?.command || 'npm install'}
                </pre>
              </div>
            </div>

            {/* Section 3 */}
            <div className="space-y-3 pt-6 border-t border-neutral-100 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                3. Building & Testing
              </h3>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Test Execution Command:
                </span>
                <pre className="font-mono text-xs bg-neutral-900 text-neutral-100 p-3 rounded overflow-x-auto">
                  {setupDoctor.testCommands[0]?.command || 'npm test'}
                </pre>
              </div>
              <p className="text-[11px] text-neutral-500 italic">
                Note: Extracted from repository configuration. Commands have not been executed in an external sandbox.
              </p>
            </div>

            {/* Section 4 */}
            <div className="space-y-3 pt-6 border-t border-neutral-100 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                4. Important Directories
              </h3>
              <div className="space-y-2 text-xs">
                {overview.keyDirectories.map((d) => (
                  <div key={d.path} className="flex items-start justify-between gap-4 p-2 rounded bg-neutral-50 dark:bg-neutral-850">
                    <div>
                      <strong className="font-mono">{d.path}/: </strong>
                      <span className="text-neutral-600 dark:text-neutral-400">{d.role}</span>
                    </div>
                    <span className="text-[11px] text-neutral-400 font-mono shrink-0">{d.fileCount} files</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5 */}
            <div className="space-y-3 pt-6 border-t border-neutral-100 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                5. Recommended Reading Path
              </h3>
              <div className="space-y-2 text-xs">
                {overview.readingPath.map((r) => (
                  <div key={r.step} className="p-3 rounded border border-neutral-200 dark:border-neutral-800 space-y-1">
                    <div className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                      <span className="font-mono">{r.step}.</span>
                      <span className="font-mono">{r.path}</span>
                      <span className="text-neutral-400 font-normal">({r.title})</span>
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-400">{r.purpose}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 6 */}
            <div className="space-y-3 pt-6 border-t border-neutral-100 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                6. Recommended Issues for First Contribution
              </h3>
              <div className="space-y-3 text-xs">
                {issues.map((iss) => (
                  <div key={iss.id} className="p-3 rounded border border-neutral-200 dark:border-neutral-800 space-y-1">
                    <div className="font-bold text-neutral-900 dark:text-neutral-100">
                      #{iss.number}: {iss.title} ({iss.difficulty})
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-400">{iss.matchReason}</p>
                    <div className="text-[11px] font-mono text-neutral-500">
                      Relevant file: {iss.relevantFiles[0]?.path}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
