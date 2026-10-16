import React from 'react';
import { X, ExternalLink, FileCode, GitCommit, ShieldCheck, AlertCircle, Info, Copy, Check } from 'lucide-react';
import { useEvidenceDrawer } from '../../context/EvidenceDrawerContext';
import { useRepo } from '../../context/RepoContext';
import { EvidenceBadge } from '../primitives/EvidenceBadge';
import { Button } from '../primitives/Button';

export const EvidenceDrawer: React.FC = () => {
  const { activeEvidence, isOpen, closeEvidence } = useEvidenceDrawer();
  const { currentRepo } = useRepo();
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !activeEvidence) return null;

  const handleCopyPath = () => {
    const text = `${activeEvidence.sourcePath}${activeEvidence.lineNumber ? `:${activeEvidence.lineNumber}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const githubUrl = currentRepo
    ? `${currentRepo.url}/blob/${activeEvidence.revision || currentRepo.commitSha}/${activeEvidence.sourcePath}${
        activeEvidence.lineNumber ? `#L${activeEvidence.lineNumber}` : ''
      }`
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="evidence-drawer-title">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-xs transition-opacity"
        onClick={closeEvidence}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 id="evidence-drawer-title" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Evidence Inspector
              </h2>
            </div>
            <button
              onClick={closeEvidence}
              className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              aria-label="Close evidence panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Status and Claim */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Verification Status
                </span>
                <EvidenceBadge status={activeEvidence.status} clickable={false} />
              </div>
              <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100 leading-snug">
                {activeEvidence.claim}
              </h3>
            </div>

            {/* Source Reference Block */}
            <div className="bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  <FileCode className="w-4 h-4 text-neutral-500" />
                  <span>Source File</span>
                </div>
                <button
                  onClick={handleCopyPath}
                  className="inline-flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy path'}</span>
                </button>
              </div>

              <div className="font-mono text-xs text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-900 px-3 py-2 rounded border border-neutral-200 dark:border-neutral-800 break-all select-all">
                {activeEvidence.sourcePath}
                {activeEvidence.lineNumber && (
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">
                    :{activeEvidence.lineNumber}
                  </span>
                )}
              </div>

              {activeEvidence.revision && (
                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                  <GitCommit className="w-3.5 h-3.5" />
                  <span>Revision: {activeEvidence.revision}</span>
                </div>
              )}
            </div>

            {/* Explanation */}
            <div>
              <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                Detection Rationale
              </h4>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed bg-white dark:bg-neutral-900/50 p-3 rounded border border-neutral-200 dark:border-neutral-800">
                {activeEvidence.explanation}
              </p>
            </div>

            {/* Limitations Notice */}
            <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 rounded-lg p-3 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Verification Scope & Limits</span>
              </div>
              <p className="opacity-90 leading-normal">
                {activeEvidence.limitations ||
                  'Extracted via static code analysis without executing runtime tests. A valid file reference indicates structural presence in the checked repository commit, not dynamic runtime behavior.'}
              </p>
            </div>
          </div>

          {/* Footer with action */}
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 bg-neutral-50 dark:bg-neutral-900/60">
            <span className="text-xs text-neutral-500 font-mono">
              ID: {activeEvidence.id}
            </span>
            {githubUrl ? (
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded transition-colors"
              >
                <span>View on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <Button size="sm" variant="secondary" onClick={closeEvidence}>
                Close
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
