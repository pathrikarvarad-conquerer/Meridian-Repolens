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
  Filter,
  Check,
  Copy,
  Terminal,
  Code2,
  ChevronDown,
  ChevronUp,
  Wrench,
  ShieldCheck
} from 'lucide-react';
import { useRepo } from '../context/RepoContext';
import { useEvidenceDrawer } from '../context/EvidenceDrawerContext';
import { Card } from '../components/primitives/Card';
import { EvidenceBadge } from '../components/primitives/EvidenceBadge';
import { Button } from '../components/primitives/Button';
import { useNavigate } from 'react-router-dom';

export const RecommendedIssuesPage: React.FC = () => {
  const { currentRepo, issues, overview, setupDoctor } = useRepo();
  const { openEvidence } = useEvidenceDrawer();
  const navigate = useNavigate();

  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Beginner' | 'Intermediate' | 'Advanced'>('all');
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  if (!currentRepo || issues.length === 0) {
    return (
      <div className="py-16 text-center text-[var(--color-text-muted)] text-sm space-y-3">
        <Target className="w-8 h-8 mx-auto text-[var(--color-text-muted)] opacity-50" />
        <p>No recommended issues analyzed yet for this repository.</p>
      </div>
    );
  }

  const filteredIssues = issues.filter((iss) => {
    return difficultyFilter === 'all' || iss.difficulty === difficultyFilter;
  });

  const handleInvestigate = (issue: typeof issues[0]) => {
    navigate('/assistant', {
      state: {
        investigatePrompt: `How should I approach solving issue #${issue.number}: "${issue.title}"? Please provide a step-by-step implementation strategy, affected files in ${currentRepo.name}, and a unit test to verify the fix.`
      }
    });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  const lang = currentRepo.primaryLanguage || 'TypeScript';
  const testCmd = setupDoctor?.testCommands?.[0]?.command || 'npm test';

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-5 h-5 text-[var(--color-brand-primary)]" />
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
              Recommended Candidate Issues
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
            Open issues correlated with code isolation, test coverage, and modular boundaries in <strong className="text-[var(--color-text-primary)]">{currentRepo.fullName}</strong>.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-1 p-1 bg-[var(--color-bg-surface-2)] rounded-lg border border-[var(--color-border-default)] self-start sm:self-auto text-xs">
          {(['all', 'Beginner', 'Intermediate', 'Advanced'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                difficultyFilter === diff
                  ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-xs font-bold'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {diff === 'all' ? 'All' : diff}
            </button>
          ))}
        </div>
      </div>


      {/* Issues List */}
      <div className="space-y-5">
        {filteredIssues.map((issue) => {
          const difficultyStyles = {
            Beginner: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
            Intermediate: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30',
            Advanced: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/30'
          };

          const isExpanded = expandedIssueId === issue.id;
          const primaryFile = issue.relevantFiles[0]?.path || 'src/index.ts';
          const primaryTest = issue.relevantTests[0]?.path || 'tests';

          const sampleFixSnippet = `// Proposed fix for #${issue.number} inside ${primaryFile}
function validateAndProcess(input) {
  if (!input || typeof input !== 'object') {
    throw new TypeError(\`Invalid argument: expected valid config object in ${currentRepo.name}\`);
  }
  // Proceed with safe execution
  return executeCore(input);
}`;

          const sampleTestSnippet = `// Proposed unit test in ${primaryTest}
test('issue #${issue.number}: rejects invalid payload with clear diagnostics', () => {
  expect(() => validateAndProcess(null)).toThrow(/Invalid argument/);
});`;

          return (
            <div
              key={issue.id}
              className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl p-5 sm:p-6 shadow-xs space-y-4"
            >
              {/* Title & Metadata row */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--color-brand-primary)]">
                      #{issue.number}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                        difficultyStyles[issue.difficulty]
                      }`}
                    >
                      {issue.difficulty}
                    </span>
                    {issue.assignedTo ? (
                      <span className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1">
                        <User className="w-3 h-3 text-[var(--color-text-muted)]" />
                        <span>Assigned to {issue.assignedTo}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Unassigned · Open</span>
                      </span>
                    )}

                    {issue.commentsCount !== undefined && issue.commentsCount > 0 && (
                      <span className="text-[11px] font-mono text-[var(--color-text-muted)]">
                        · {issue.commentsCount} comments
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[var(--color-text-primary)] tracking-tight">
                    {issue.title}
                  </h3>

                  {/* Label tags */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs pt-0.5">
                    {issue.labels.map((lbl) => (
                      <span
                        key={lbl}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--color-bg-surface-2)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]"
                      >
                        {lbl}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Bot className="w-3.5 h-3.5 text-[var(--color-brand-primary)]" />}
                    onClick={() => handleInvestigate(issue)}
                  >
                    Investigate with AI
                  </Button>
                  <a
                    href={issue.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[var(--color-brand-primary)] text-white hover:opacity-90 rounded-lg transition-opacity cursor-pointer shadow-xs"
                  >
                    <span>View on GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Matching Rationale Box */}
              <div className="bg-[var(--color-bg-surface-2)] p-3.5 rounded-xl border border-[var(--color-border-subtle)] text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-[var(--color-text-primary)]">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--color-brand-primary)] shrink-0" />
                  <span>Why this issue is recommended:</span>
                </div>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  {issue.matchReason}
                </p>
                <div className="pt-1 text-[11px] text-[var(--color-text-muted)]">
                  <strong className="text-[var(--color-text-primary)]">Prerequisite Skills: </strong>
                  {issue.requiredKnowledge.join(', ')}
                </div>
              </div>

              {/* Relevant Files and Tests Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Files */}
                <div className="border border-[var(--color-border-default)] rounded-xl p-3 space-y-2 bg-[var(--color-bg-surface)]">
                  <span className="font-semibold text-[var(--color-text-muted)] block text-[10.5px] uppercase tracking-wider">
                    Relevant Source Files
                  </span>
                  <div className="space-y-2">
                    {issue.relevantFiles.map((file) => (
                      <div key={file.path} className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <code className="font-mono text-xs font-bold text-[var(--color-text-primary)] block truncate">
                            {file.path}
                          </code>
                          <p className="text-[11px] text-[var(--color-text-muted)]">{file.role}</p>
                        </div>
                        <EvidenceBadge status={file.evidence.status} evidence={file.evidence} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tests */}
                <div className="border border-[var(--color-border-default)] rounded-xl p-3 space-y-2 bg-[var(--color-bg-surface)]">
                  <span className="font-semibold text-[var(--color-text-muted)] block text-[10.5px] uppercase tracking-wider">
                    Associated Test Suites
                  </span>
                  {issue.relevantTests.length === 0 ? (
                    <p className="text-[11px] text-[var(--color-text-muted)] italic">
                      No automated test fixture directly mapped. Add a new regression test in your PR.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {issue.relevantTests.map((t) => (
                        <div key={t.path} className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <code className="font-mono text-xs font-bold text-[var(--color-text-primary)] block truncate">
                              {t.path}
                            </code>
                            <p className="text-[11px] text-[var(--color-text-muted)]">{t.role}</p>
                          </div>
                          <EvidenceBadge status={t.evidence.status} evidence={t.evidence} size="sm" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Interactive Fix Strategy Toggle */}
              <div className="pt-2 border-t border-[var(--color-border-subtle)]">
                <button
                  onClick={() => setExpandedIssueId(isExpanded ? null : issue.id)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-brand-primary)] hover:underline cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>{isExpanded ? 'Hide Implementation Strategy' : 'View Fix Strategy & Code Solution'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {isExpanded && (
                  <div className="mt-3 p-4 rounded-xl bg-[var(--color-bg-surface-2)] border border-[var(--color-border-subtle)] space-y-3 text-xs">
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-[var(--color-text-primary)]">
                        Implementation Plan for #{issue.number}
                      </h4>
                      <p className="text-[var(--color-text-secondary)]">
                        Recommended 3-step patch workflow to resolve this issue and pass CI checks.
                      </p>
                    </div>

                    {/* Step 1: Repro test */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[var(--color-text-primary)] text-[11px]">
                          Step 1: Write Regression Unit Test in <code className="font-mono">{primaryTest}</code>
                        </span>
                        <button
                          onClick={() => copyToClipboard(sampleTestSnippet, `test-${issue.id}`)}
                          className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
                        >
                          {copiedSnippetId === `test-${issue.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedSnippetId === `test-${issue.id}` ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <pre className="p-2.5 rounded-lg bg-[var(--color-bg-surface-3)] font-mono text-[11px] overflow-x-auto text-[var(--color-text-primary)] border border-[var(--color-border-subtle)]">
                        <code>{sampleTestSnippet}</code>
                      </pre>
                    </div>

                    {/* Step 2: Implementation Patch */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[var(--color-text-primary)] text-[11px]">
                          Step 2: Apply Patch in <code className="font-mono">{primaryFile}</code>
                        </span>
                        <button
                          onClick={() => copyToClipboard(sampleFixSnippet, `fix-${issue.id}`)}
                          className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
                        >
                          {copiedSnippetId === `fix-${issue.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedSnippetId === `fix-${issue.id}` ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <pre className="p-2.5 rounded-lg bg-[var(--color-bg-surface-3)] font-mono text-[11px] overflow-x-auto text-[var(--color-text-primary)] border border-[var(--color-border-subtle)]">
                        <code>{sampleFixSnippet}</code>
                      </pre>
                    </div>

                    {/* Step 3: Run verify command */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]">
                      <span className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-[var(--color-brand-primary)]" />
                        <span>Step 3: Run Test Suite:</span>
                        <code className="font-mono font-bold text-[var(--color-text-primary)]">{testCmd}</code>
                      </span>
                      <Button size="sm" variant="outline" onClick={() => handleInvestigate(issue)}>
                        Ask AI Assistant to Debug
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
