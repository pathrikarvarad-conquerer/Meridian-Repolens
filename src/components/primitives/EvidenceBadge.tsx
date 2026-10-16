import React from 'react';
import { CheckCircle2, HelpCircle, AlertTriangle, XCircle, Info, Sparkles } from 'lucide-react';
import { Evidence, EvidenceStatus } from '../../types';
import { useEvidenceDrawer } from '../../context/EvidenceDrawerContext';

interface EvidenceBadgeProps {
  status: EvidenceStatus;
  evidence?: Evidence;
  sourcePath?: string;
  lineNumber?: string | number;
  showIcon?: boolean;
  clickable?: boolean;
  size?: 'sm' | 'md';
}

export const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({
  status,
  evidence,
  sourcePath,
  lineNumber,
  showIcon = true,
  clickable = true,
  size = 'sm'
}) => {
  const { openEvidence } = useEvidenceDrawer();

  const config: Record<EvidenceStatus, {
    label: string;
    icon: React.ReactNode;
    bgClass: string;
    textClass: string;
    borderClass: string;
  }> = {
    verified: {
      label: 'Verified',
      icon: <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />,
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/60',
      textClass: 'text-emerald-800 dark:text-emerald-300',
      borderClass: 'border-emerald-200 dark:border-emerald-800'
    },
    inferred: {
      label: 'Inferred',
      icon: <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />,
      bgClass: 'bg-blue-50 dark:bg-blue-950/60',
      textClass: 'text-blue-800 dark:text-blue-300',
      borderClass: 'border-blue-200 dark:border-blue-800'
    },
    'not-tested': {
      label: 'Not Tested',
      icon: <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />,
      bgClass: 'bg-amber-50 dark:bg-amber-950/60',
      textClass: 'text-amber-800 dark:text-amber-300',
      borderClass: 'border-amber-200 dark:border-amber-800'
    },
    unknown: {
      label: 'Unknown',
      icon: <HelpCircle className="w-3 h-3 text-slate-500 dark:text-slate-400" />,
      bgClass: 'bg-slate-100 dark:bg-slate-800/80',
      textClass: 'text-slate-700 dark:text-slate-300',
      borderClass: 'border-slate-300 dark:border-slate-700'
    },
    failed: {
      label: 'Failed',
      icon: <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />,
      bgClass: 'bg-rose-50 dark:bg-rose-950/60',
      textClass: 'text-rose-800 dark:text-rose-300',
      borderClass: 'border-rose-200 dark:border-rose-800'
    },
    partial: {
      label: 'Partial',
      icon: <Info className="w-3 h-3 text-purple-600 dark:text-purple-400" />,
      bgClass: 'bg-purple-50 dark:bg-purple-950/60',
      textClass: 'text-purple-800 dark:text-purple-300',
      borderClass: 'border-purple-200 dark:border-purple-800'
    }
  };

  const current = config[status] || config.unknown;
  const path = evidence?.sourcePath || sourcePath;
  const line = evidence?.lineNumber || lineNumber;

  const handleClick = (e: React.MouseEvent) => {
    if (clickable && evidence) {
      e.stopPropagation();
      openEvidence(evidence);
    }
  };

  const isInteractive = clickable && !!evidence;

  return (
    <button
      type="button"
      onClick={isInteractive ? handleClick : undefined}
      disabled={!isInteractive}
      title={evidence ? `Click to inspect evidence for: ${evidence.claim}` : current.label}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-medium font-mono whitespace-nowrap transition-all ${current.bgClass} ${current.textClass} ${current.borderClass} ${
        isInteractive ? 'cursor-pointer hover:opacity-85 hover:shadow-xs active:scale-98' : 'cursor-default'
      } ${size === 'md' ? 'text-xs py-1 px-2.5' : 'text-[11px]'}`}
    >
      {showIcon && <span className="shrink-0">{current.icon}</span>}
      <span className="font-sans font-semibold tracking-tight">{current.label}</span>
      {path && (
        <span className="opacity-75 text-[10px] ml-0.5 border-l border-current/25 pl-1.5 truncate max-w-[140px]">
          {path.split('/').pop()}{line ? `:${line}` : ''}
        </span>
      )}
    </button>
  );
};
