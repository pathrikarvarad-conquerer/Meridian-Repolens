import React, { useState } from 'react';
import { 
  Target, 
  ExternalLink, 
  FileCode, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  BookOpen, 
  Sparkles, 
  Bot,
  Filter
} from 'lucide-react';
import { useRepo } from '../context/RepoContext';
import { useEvidenceDrawer } from '../context/EvidenceDrawerContext';
import { Card } from '../components/primitives/Card';
import { EvidenceBadge } from '../components/primitives/EvidenceBadge';
import { Button } from '../components/primitives/Button';
import { useNavigate } from 'react-router-dom';

export const RecommendedIssuesPage: React.FC = () => {
  const { currentRepo, issues } = useRepo();
  const { openEvidence } = useEvidenceDrawer();
  const navigate = useNavigate();

  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Beginner' | 'Intermediate' | 'Advanced'>('all');

  if (!currentRepo || issues.length === 0) {
    return (
      <div className="py-16 text-center text-neutral-500 text-sm">
        No recommended issues found or analyzed yet.
      </div>
    );
  }

  const filteredIssues = issues.filter(
    (iss) => difficultyFilter === 'all' || iss.difficulty === difficultyFilter
  );

  const handleInvestigate = (issue: typeof issues[0]) => {
    // Navigate to Assistant with pre-filled question or evidence
    navigate('/assistant', {
      state: {
        investigatePrompt: `How should I approach solving issue #${issue.number}: "${issue.title}"? What are the relevant files and tests?`
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Recommended Issues
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
            Curated issues mapped by code isolation, test coverage, and modular boundaries for <strong className="text-neutral-900 dark:text-neutral-100">{currentRepo.fullName}</strong>.
          </p>
        </div>

        {/* Filter Bar (buttons allowed per design constitution) */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-850 rounded-lg border border-neutral-200 dark:border-neutral-800 self-start sm:self-auto">
          {(['all', 'Beginner', 'Intermediate', 'Advanced'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
                difficultyFilter === diff
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-2xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              {diff === 'all' ? 'All Issues' : diff}
            </button>
          ))}
        </div>
      </div>

      {/* Issues List (up to 3 curated) */}
      <div className="space-y-6">
        {filteredIssues.map((issue) => {
          const difficultyColors = {
            Beginner: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
            Intermediate: 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
            Advanced: 'text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800'
          };

          return (
            <div
              key={issue.id}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 sm:p-6 shadow-2xs space-y-5"
            >
              {/* Title & Metadata row */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-neutral-500">
                      #{issue.number}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                        difficultyColors[issue.difficulty]
                      }`}
                    >
                      {issue.difficulty}
                    </span>
                    {issue.assignedTo ? (
                      <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                        <User className="w-3 h-3 text-neutral-400" />
                        <span>Assigned to {issue.assignedTo}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Unassigned · Open
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                    {issue.title}
                  </h3>

                  {/* Unboxed label tags */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500">
                    <span>Labels:</span>
                    {issue.labels.map((lbl, idx) => (
                      <React.Fragment key={lbl}>
                        <span className="font-mono text-neutral-700 dark:text-neutral-300">
                          {lbl}
                        </span>
                        {idx < issue.labels.length - 1 && <span aria-hidden="true">·</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Bot className="w-3.5 h-3.5" />}
                    onClick={() => handleInvestigate(issue)}
                  >
                    Investigate with AI
                  </Button>
                  <a
                    href={issue.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded transition-colors"
                  >
                    <span>View issue</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Matching Rationale */}
              <div className="bg-neutral-50 dark:bg-neutral-850/60 p-3.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-neutral-900 dark:text-neutral-100">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Why this issue matches:</span>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {issue.matchReason}
                </p>
                <div className="pt-1 text-[11px] text-neutral-500">
                  <strong className="text-neutral-700 dark:text-neutral-300">Required Knowledge: </strong>
                  {issue.requiredKnowledge.join(', ')}
                </div>
              </div>

              {/* Relevant Files and Tests Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Files */}
                <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 space-y-2">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300 block text-[11px] uppercase tracking-wider">
                    Relevant Source Files
                  </span>
                  <div className="space-y-2">
                    {issue.relevantFiles.map((file) => (
                      <div key={file.path} className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <code className="font-mono text-xs font-semibold text-neutral-900 dark:text-neutral-100 block truncate">
                            {file.path}
                          </code>
                          <p className="text-[11px] text-neutral-500">{file.role}</p>
                        </div>
                        <EvidenceBadge status={file.evidence.status} evidence={file.evidence} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tests */}
                <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 space-y-2">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300 block text-[11px] uppercase tracking-wider">
                    Associated Test Suites
                  </span>
                  {issue.relevantTests.length === 0 ? (
                    <p className="text-[11px] text-neutral-500">
                      No automated test file directly mapped for this issue. You may need to create a new fixture.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {issue.relevantTests.map((t) => (
                        <div key={t.path} className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <code className="font-mono text-xs font-semibold text-neutral-900 dark:text-neutral-100 block truncate">
                              {t.path}
                            </code>
                            <p className="text-[11px] text-neutral-500">{t.role}</p>
                          </div>
                          <EvidenceBadge status={t.evidence.status} evidence={t.evidence} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Uncertainty Notes */}
              {issue.uncertaintyNotes && (
                <div className="text-[11px] text-neutral-500 italic flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>Uncertainty Notice: {issue.uncertaintyNotes}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
