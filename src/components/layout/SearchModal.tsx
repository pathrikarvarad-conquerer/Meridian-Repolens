import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileCode, Target, Stethoscope, ArrowRight } from 'lucide-react';
import { useRepo } from '../../context/RepoContext';
import { useEvidenceDrawer } from '../../context/EvidenceDrawerContext';
import { useNavigate } from 'react-router-dom';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { currentRepo, overview, setupDoctor, issues } = useRepo();
  const { openEvidence } = useEvidenceDrawer();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // will be triggered by parent or state
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Build searchable index from current repository data
  const results: {
    id: string;
    category: 'Architecture' | 'Setup Doctor' | 'Issue' | 'Directory';
    title: string;
    subtitle: string;
    action: () => void;
  }[] = [];

  const q = query.toLowerCase().trim();

  if (overview) {
    // Directories
    overview.keyDirectories.forEach((d) => {
      if (!q || d.path.toLowerCase().includes(q) || d.role.toLowerCase().includes(q)) {
        results.push({
          id: `dir-${d.path}`,
          category: 'Directory',
          title: d.path,
          subtitle: d.role,
          action: () => {
            navigate('/overview');
            onClose();
          }
        });
      }
    });

    // Architecture components
    overview.architectureComponents.forEach((c) => {
      if (!q || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) {
        results.push({
          id: `arch-${c.id}`,
          category: 'Architecture',
          title: c.name,
          subtitle: c.description,
          action: () => {
            openEvidence(c.evidence);
            onClose();
          }
        });
      }
    });

    // Tech Stack
    overview.techStack.forEach((t) => {
      if (!q || t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)) {
        results.push({
          id: `tech-${t.name}`,
          category: 'Architecture',
          title: t.name,
          subtitle: `Verified in ${t.verifiedIn}`,
          action: () => {
            openEvidence(t.evidence);
            onClose();
          }
        });
      }
    });
  }

  if (setupDoctor) {
    // Prerequisites
    setupDoctor.prerequisites.forEach((p) => {
      if (!q || p.name.toLowerCase().includes(q) || p.versionRequirement.toLowerCase().includes(q)) {
        results.push({
          id: `pre-${p.name}`,
          category: 'Setup Doctor',
          title: p.name,
          subtitle: `${p.versionRequirement} (detected in ${p.detectedIn})`,
          action: () => {
            navigate('/setup');
            onClose();
          }
        });
      }
    });

    // Commands
    setupDoctor.installCommands.concat(setupDoctor.testCommands).forEach((cmd, idx) => {
      if (!q || cmd.command.toLowerCase().includes(q) || cmd.purpose.toLowerCase().includes(q)) {
        results.push({
          id: `cmd-${idx}`,
          category: 'Setup Doctor',
          title: cmd.command,
          subtitle: cmd.purpose,
          action: () => {
            openEvidence(cmd.evidence);
            onClose();
          }
        });
      }
    });
  }

  if (issues) {
    issues.forEach((iss) => {
      if (!q || iss.title.toLowerCase().includes(q) || iss.number.toString().includes(q)) {
        results.push({
          id: `iss-${iss.number}`,
          category: 'Issue',
          title: `#${iss.number}: ${iss.title}`,
          subtitle: `${iss.difficulty} · ${iss.labels.join(', ')}`,
          action: () => {
            navigate('/issues');
            onClose();
          }
        });
      }
    });
  }

  const handleSelect = (idx: number) => {
    const item = results[idx];
    if (item) {
      item.action();
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(selectedIndex);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 flex justify-center items-start" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-neutral-200 dark:border-neutral-800">
          <Search className="w-4 h-4 text-neutral-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder={`Search ${currentRepo ? currentRepo.fullName : 'codebase'} files, architecture, setup...`}
            className="w-full h-12 text-sm bg-transparent border-0 focus:outline-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              No matching findings or files for "{query}".
            </div>
          ) : (
            results.slice(0, 15).map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(idx)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-850'
                  }`}
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-neutral-200/70 dark:bg-neutral-700/60 text-neutral-600 dark:text-neutral-300">
                        {item.category}
                      </span>
                      <span className="font-semibold truncate">{item.title}</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 truncate">{item.subtitle}</p>
                  </div>
                  <ArrowRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                </div>
              );
            })
          )}
        </div>

        {/* Keyboard hints footer */}
        <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
          <span>Navigate with ↑ and ↓</span>
          <span>Select with ↵ Enter</span>
          <span>Close with Esc</span>
        </div>
      </div>
    </div>
  );
};
