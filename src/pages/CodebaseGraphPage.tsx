import React, { useState } from 'react';
import { 
  Network, 
  Layers, 
  ArrowRight, 
  FileCode, 
  Sparkles, 
  ListFilter, 
  Check, 
  Eye, 
  Maximize2 
} from 'lucide-react';
import { useRepo } from '../context/RepoContext';
import { useEvidenceDrawer } from '../context/EvidenceDrawerContext';
import { CodebaseNode, CodebaseEdge } from '../types';
import { Card } from '../components/primitives/Card';
import { EvidenceBadge } from '../components/primitives/EvidenceBadge';
import { Button } from '../components/primitives/Button';

export const CodebaseGraphPage: React.FC = () => {
  const { currentRepo, graph } = useRepo();
  const { openEvidence } = useEvidenceDrawer();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'visual' | 'textual'>('visual');

  if (!currentRepo || !graph || graph.nodes.length === 0) {
    return (
      <div className="py-16 text-center text-neutral-500 text-sm">
        No module dependency graph available for this repository.
      </div>
    );
  }

  const filteredNodes = graph.nodes.filter(
    (n) => activeGroup === 'all' || n.group === activeGroup
  );

  const selectedNode = graph.nodes.find((n) => n.id === selectedNodeId) || filteredNodes[0];

  const incomingEdges = graph.edges.filter((e) => e.target === selectedNode?.id);
  const outgoingEdges = graph.edges.filter((e) => e.source === selectedNode?.id);

  const groupColors: Record<string, { bg: string; text: string; border: string }> = {
    core: { bg: 'bg-blue-50 dark:bg-blue-950/50', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-800' },
    service: { bg: 'bg-purple-50 dark:bg-purple-950/50', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-300 dark:border-purple-800' },
    ui: { bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-300 dark:border-emerald-800' },
    util: { bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-800' },
    config: { bg: 'bg-slate-50 dark:bg-slate-800/50', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-300 dark:border-slate-700' }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Network className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Codebase Dependency Graph
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
            Structural package and module relationships extracted from import AST statements in <strong className="text-neutral-900 dark:text-neutral-100">{currentRepo.fullName}</strong>.
          </p>
        </div>

        {/* View Mode Switch & Filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 text-xs">
            <button
              onClick={() => setViewMode('visual')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'visual'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-2xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Interactive Graph
            </button>
            <button
              onClick={() => setViewMode('textual')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'textual'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-2xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Textual Alternative
            </button>
          </div>
        </div>
      </div>

      {/* Layer Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-neutral-400 text-[11px] font-semibold uppercase mr-1">Layer:</span>
        {['all', 'core', 'service', 'ui', 'util'].map((grp) => (
          <button
            key={grp}
            onClick={() => setActiveGroup(grp)}
            className={`px-2.5 py-1 rounded text-xs capitalize transition-colors cursor-pointer border ${
              activeGroup === grp
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-transparent font-medium'
                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50'
            }`}
          >
            {grp}
          </button>
        ))}
      </div>

      {viewMode === 'visual' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visual Graph Canvas (2 spans) */}
          <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-2xs relative min-h-[420px] flex flex-col justify-between">
            {/* Relationship Legend */}
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-neutral-500 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">Relationship Types:</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-0.5 bg-blue-500" />
                <span>Imports</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-0.5 bg-purple-500" />
                <span>Calls</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-0.5 bg-emerald-500" />
                <span>Implements</span>
              </span>
            </div>

            {/* Interactive Module Nodes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-6">
              {filteredNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const colors = groupColors[node.group] || groupColors.core;

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all select-none ${
                      isSelected
                        ? 'border-neutral-900 dark:border-neutral-100 ring-2 ring-neutral-900/10 dark:ring-white/20 shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                    } ${colors.bg}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] uppercase font-mono px-1.5 py-0.2 rounded border ${colors.border} ${colors.text} font-semibold`}>
                        {node.group}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-400 tabular-nums">
                        {node.loc} LOC
                      </span>
                    </div>

                    <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-xs mb-1">
                      {node.name}
                    </h4>

                    <p className="text-[11px] text-neutral-500 truncate font-mono">
                      {node.path}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-neutral-200/40 dark:border-neutral-800 flex items-center justify-between text-[10px] text-neutral-400">
                      <span>Imports: {node.importsCount}</span>
                      <span>Imported by: {node.importedByCount}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-[11px] text-neutral-400 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <span>Select any module above to inspect incoming/outgoing edges & evidence.</span>
              <span className="font-mono">{filteredNodes.length} modules mapped</span>
            </div>
          </div>

          {/* Selected Node Details Panel (1 span) */}
          <div className="space-y-4">
            {selectedNode && (
              <Card title={selectedNode.name} subtitle={selectedNode.path}>
                <div className="space-y-4 text-xs">
                  <div>
                    <h5 className="font-semibold text-neutral-400 text-[10px] uppercase tracking-wider mb-1">
                      Module Purpose
                    </h5>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      {selectedNode.description}
                    </p>
                  </div>

                  <div>
                    <h5 className="font-semibold text-neutral-400 text-[10px] uppercase tracking-wider mb-1">
                      Exported Symbols ({selectedNode.exports.length})
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {selectedNode.exports.map((exp) => (
                        <code
                          key={exp}
                          className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700"
                        >
                          {exp}
                        </code>
                      ))}
                    </div>
                  </div>

                  {/* Outgoing edges */}
                  <div>
                    <h5 className="font-semibold text-neutral-400 text-[10px] uppercase tracking-wider mb-1.5">
                      Dependencies ({outgoingEdges.length})
                    </h5>
                    {outgoingEdges.length === 0 ? (
                      <p className="text-[11px] text-neutral-400">No outgoing dependencies mapped.</p>
                    ) : (
                      <div className="space-y-2">
                        {outgoingEdges.map((edge) => (
                          <div
                            key={edge.id}
                            className="p-2 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850 flex items-center justify-between"
                          >
                            <span className="font-mono text-[11px] text-neutral-800 dark:text-neutral-200">
                              {edge.type} → {edge.target}
                            </span>
                            <EvidenceBadge status={edge.evidence.status} evidence={edge.evidence} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Incoming edges */}
                  <div>
                    <h5 className="font-semibold text-neutral-400 text-[10px] uppercase tracking-wider mb-1.5">
                      Dependents ({incomingEdges.length})
                    </h5>
                    {incomingEdges.length === 0 ? (
                      <p className="text-[11px] text-neutral-400">Not directly imported by sibling nodes.</p>
                    ) : (
                      <div className="space-y-2">
                        {incomingEdges.map((edge) => (
                          <div
                            key={edge.id}
                            className="p-2 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850 flex items-center justify-between"
                          >
                            <span className="font-mono text-[11px] text-neutral-800 dark:text-neutral-200">
                              {edge.source} ({edge.type})
                            </span>
                            <EvidenceBadge status={edge.evidence.status} evidence={edge.evidence} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      ) : (
        /* Textual Alternative View */
        <Card title="Accessible Codebase Module Directory">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-semibold pb-2">
                  <th className="py-2.5">Module Name</th>
                  <th className="py-2.5">File Path</th>
                  <th className="py-2.5">Layer</th>
                  <th className="py-2.5">Lines of Code</th>
                  <th className="py-2.5">Key Exports</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredNodes.map((node) => (
                  <tr key={node.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-850 transition-colors">
                    <td className="py-3 font-bold text-neutral-900 dark:text-neutral-100">
                      {node.name}
                    </td>
                    <td className="py-3 font-mono text-neutral-600 dark:text-neutral-300">
                      {node.path}
                    </td>
                    <td className="py-3 uppercase font-mono text-[11px] text-neutral-500">
                      {node.group}
                    </td>
                    <td className="py-3 font-mono tabular-nums text-neutral-700 dark:text-neutral-300">
                      {node.loc}
                    </td>
                    <td className="py-3 font-mono text-[11px] text-neutral-500 truncate max-w-xs">
                      {node.exports.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
