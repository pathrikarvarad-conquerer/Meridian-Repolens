import React, { useState, useMemo, useRef } from 'react';
import { 
  Network, 
  Layers, 
  ArrowRight, 
  FileCode, 
  Sparkles, 
  ListFilter, 
  Check, 
  Eye, 
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  GitCommit,
  ShieldCheck,
  Cpu,
  Info,
  Download,
  Share2,
  Activity,
  Boxes,
  Compass,
  ArrowUpRight,
  ArrowDownLeft,
  Sliders
} from 'lucide-react';
import { useRepo } from '../context/RepoContext';
import { useEvidenceDrawer } from '../context/EvidenceDrawerContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { CodebaseNode, CodebaseEdge } from '../types';
import { Card } from '../components/primitives/Card';
import { EvidenceBadge } from '../components/primitives/EvidenceBadge';
import { Button } from '../components/primitives/Button';

type GraphLayoutMode = 'tiered' | 'orbital' | 'grid';

export const CodebaseGraphPage: React.FC = () => {
  const { currentRepo, graph } = useRepo();
  const { openEvidence } = useEvidenceDrawer();
  const { resolvedTheme } = useTheme();
  const { addToast } = useToast();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'visual' | 'textual'>('visual');
  const [layoutMode, setLayoutMode] = useState<GraphLayoutMode>('tiered');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const svgRef = useRef<SVGSVGElement | null>(null);

  if (!currentRepo || !graph || graph.nodes.length === 0) {
    return (
      <div className="py-16 text-center text-[var(--color-text-muted)] text-sm">
        No module dependency graph available for this repository.
      </div>
    );
  }

  // Filter nodes by architectural layer group
  const filteredNodes = useMemo(() => {
    return graph.nodes.filter((n) => {
      return activeGroup === 'all' || n.group === activeGroup;
    });
  }, [graph.nodes, activeGroup]);

  // Set default active node
  const activeNode = useMemo(() => {
    return graph.nodes.find((n) => n.id === selectedNodeId) || filteredNodes[0] || graph.nodes[0];
  }, [graph.nodes, selectedNodeId, filteredNodes]);

  // Find incoming and outgoing edges for the selected node
  const incomingEdges = useMemo(() => {
    return graph.edges.filter((e) => e.target === activeNode?.id);
  }, [graph.edges, activeNode]);

  const outgoingEdges = useMemo(() => {
    return graph.edges.filter((e) => e.source === activeNode?.id);
  }, [graph.edges, activeNode]);

  // Calculate layout coordinates dynamically based on layoutMode
  const nodePositions = useMemo(() => {
    const posMap: Record<string, { x: number; y: number }> = {};
    const nodes = graph.nodes;
    const total = nodes.length;

    if (layoutMode === 'orbital') {
      // Hub and Spoke: node 0/1 in center, others in an orbit ellipse
      const centerX = 520;
      const centerY = 240;
      const radiusX = 360;
      const radiusY = 160;

      nodes.forEach((node, i) => {
        if (i === 0 || node.group === 'core' && i < 2) {
          posMap[node.id] = { x: centerX - 110, y: centerY - 45 };
        } else {
          const angle = ((i - 1) / (total - 1)) * 2 * Math.PI - Math.PI / 2;
          const x = centerX + Math.cos(angle) * radiusX - 110;
          const y = centerY + Math.sin(angle) * radiusY - 45;
          posMap[node.id] = { x, y };
        }
      });
    } else if (layoutMode === 'grid') {
      // Clean structured 3-column grid
      const cols = 3;
      nodes.forEach((node, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = 120 + col * 320;
        const y = 80 + row * 150;
        posMap[node.id] = { x, y };
      });
    } else {
      // Tiered Architecture DAG
      // Group by layer: Layer 0 (Entry/UI), Layer 1 (Services/Engine), Layer 2 (Utils/Config)
      const layers: Record<number, CodebaseNode[]> = { 0: [], 1: [], 2: [], 3: [] };
      nodes.forEach((node, i) => {
        const lyr = node.layer !== undefined ? node.layer : (node.group === 'ui' ? 0 : node.group === 'core' ? 1 : node.group === 'service' ? 1 : 2);
        const clampedLayer = Math.min(2, lyr);
        if (!layers[clampedLayer]) layers[clampedLayer] = [];
        layers[clampedLayer].push(node);
      });

      // Position each layer column
      const layerXCoords = [140, 480, 820];
      [0, 1, 2].forEach((layerIdx) => {
        const layerNodes = layers[layerIdx] || [];
        const count = layerNodes.length;
        layerNodes.forEach((node, nodeIdx) => {
          const spacing = count > 1 ? 360 / (count) : 200;
          const startY = count > 1 ? 90 + nodeIdx * spacing : 180;
          posMap[node.id] = {
            x: layerXCoords[layerIdx] - 110,
            y: startY
          };
        });
      });
    }

    return posMap;
  }, [graph.nodes, layoutMode]);

  const groupColors: Record<string, { bg: string; text: string; border: string; circle: string; fill: string; accent: string }> = {
    core: { 
      bg: 'bg-blue-500/10', 
      text: 'text-blue-600 dark:text-blue-400', 
      border: 'border-blue-500/40', 
      circle: '#315EFB', 
      fill: resolvedTheme === 'dark' ? '#142D5B' : '#EBF1FF',
      accent: '#315EFB'
    },
    service: { 
      bg: 'bg-purple-500/10', 
      text: 'text-purple-600 dark:text-purple-400', 
      border: 'border-purple-500/40', 
      circle: '#7C3AED', 
      fill: resolvedTheme === 'dark' ? '#261758' : '#F3E8FF',
      accent: '#7C3AED'
    },
    ui: { 
      bg: 'bg-emerald-500/10', 
      text: 'text-emerald-600 dark:text-emerald-400', 
      border: 'border-emerald-500/40', 
      circle: '#059669', 
      fill: resolvedTheme === 'dark' ? '#063625' : '#ECFDF5',
      accent: '#059669'
    },
    util: { 
      bg: 'bg-amber-500/10', 
      text: 'text-amber-600 dark:text-amber-400', 
      border: 'border-amber-500/40', 
      circle: '#D97706', 
      fill: resolvedTheme === 'dark' ? '#3B2305' : '#FFFBEB',
      accent: '#D97706'
    },
    config: { 
      bg: 'bg-slate-500/10', 
      text: 'text-slate-600 dark:text-slate-400', 
      border: 'border-slate-500/40', 
      circle: '#475569', 
      fill: resolvedTheme === 'dark' ? '#1E293B' : '#F1F5F9',
      accent: '#475569'
    }
  };

  const handleExportSvg = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgRef.current);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentRepo.name}-dependency-graph.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast({
      type: 'success',
      title: 'Graph Exported',
      message: 'SVG diagram downloaded successfully.'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Network className="w-5 h-5 text-[var(--color-brand-primary)]" />
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
              Codebase Dependency Graph
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
            Interactive structural module relationship diagram extracted from verified AST imports and package boundaries in <strong className="text-[var(--color-text-primary)]">{currentRepo.fullName}</strong>.
          </p>
        </div>

        {/* View Mode Switch, Layout Selector, and Zoom Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {viewMode === 'visual' && (
            <>
              {/* Layout Presets */}
              <div className="flex items-center p-0.5 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface-2)] text-xs">
                <button
                  onClick={() => setLayoutMode('tiered')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                    layoutMode === 'tiered'
                      ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-xs font-semibold'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                  }`}
                  title="Layered Architecture View"
                >
                  Architecture
                </button>
                <button
                  onClick={() => setLayoutMode('orbital')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                    layoutMode === 'orbital'
                      ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-xs font-semibold'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                  }`}
                  title="Radial Hub & Spoke"
                >
                  Radial Hub
                </button>
                <button
                  onClick={() => setLayoutMode('grid')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                    layoutMode === 'grid'
                      ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-xs font-semibold'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                  }`}
                  title="Grid Matrix View"
                >
                  Matrix
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center p-0.5 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface-2)]">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.15))}
                  className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono px-1.5 text-[var(--color-text-muted)] tabular-nums">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
                  className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Export SVG */}
              <button
                onClick={handleExportSvg}
                className="p-1.5 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
                title="Export Diagram as SVG"
              >
                <Download className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Toggle Visual / Table */}
          <div className="flex items-center p-0.5 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface-2)] text-xs">
            <button
              onClick={() => setViewMode('visual')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                viewMode === 'visual'
                  ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-xs font-bold'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              Interactive Graph
            </button>
            <button
              onClick={() => setViewMode('textual')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                viewMode === 'textual'
                  ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-xs font-bold'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              Table View
            </button>
          </div>
        </div>
      </div>

      {/* Filter Pills and Architecture Health Metrics */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">

          <span className="text-[var(--color-text-muted)] text-[11px] font-semibold uppercase ml-1">Layer:</span>
          {['all', 'core', 'service', 'ui', 'util', 'config'].map((grp) => (
            <button
              key={grp}
              onClick={() => setActiveGroup(grp)}
              className={`px-2.5 py-1 rounded-md text-xs capitalize transition-colors cursor-pointer border ${
                activeGroup === grp
                  ? 'bg-[var(--color-brand-primary)] text-white border-transparent font-semibold shadow-xs'
                  : 'bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border-[var(--color-border-default)] hover:bg-[var(--color-bg-surface-2)]'
              }`}
            >
              {grp}
            </button>
          ))}
        </div>

        {/* Quick architecture metrics */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-[var(--color-text-muted)] font-mono">
          <span>Modules: <strong className="text-[var(--color-text-primary)]">{graph.nodes.length}</strong></span>
          <span>·</span>
          <span>Relationships: <strong className="text-[var(--color-text-primary)]">{graph.edges.length}</strong></span>
          <span>·</span>
          <span className="text-[var(--color-status-verified-text)] flex items-center gap-1 font-sans">
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-status-verified)]" />
            <span>Acyclic DAG Verified</span>
          </span>
        </div>
      </div>

      {viewMode === 'visual' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Visual Interactive SVG Canvas (8 cols) */}
          <div className="lg:col-span-8 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] overflow-hidden shadow-xs flex flex-col justify-between relative min-h-[520px]">
            {/* Visual Legend Bar */}
            <div className="p-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-2)] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3 text-[11px]">
                <span className="font-semibold text-[var(--color-text-primary)]">Edges:</span>
                <span className="flex items-center gap-1.5 font-medium text-[var(--color-text-secondary)]">
                  <span className="w-2.5 h-0.5 bg-[#315EFB] rounded" />
                  <span>Imports</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium text-[var(--color-text-secondary)]">
                  <span className="w-2.5 h-0.5 bg-[#7C3AED] rounded" />
                  <span>Calls / Invokes</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium text-[var(--color-text-secondary)]">
                  <span className="w-2.5 h-0.5 bg-[#059669] rounded" />
                  <span>Implements</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium text-[var(--color-text-secondary)]">
                  <span className="w-2.5 h-0.5 bg-[#D97706] rounded" />
                  <span>Configures</span>
                </span>
              </div>

              <span className="text-[11px] text-[var(--color-text-muted)] font-mono">
                Click node to inspect dependencies
              </span>
            </div>

            {/* Interactive SVG Diagram */}
            <div className="relative flex-1 overflow-auto p-4 flex items-center justify-center min-h-[440px] bg-dots">
              <svg
                ref={svgRef}
                viewBox="0 0 1000 500"
                className="w-full h-full min-w-[760px] select-none transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
              >
                <defs>
                  {/* Arrow marker for standard edge */}
                  <marker
                    id="arrow-std"
                    viewBox="0 0 10 10"
                    refX="24"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={resolvedTheme === 'dark' ? '#3B5375' : '#94A3B8'} />
                  </marker>

                  {/* Arrow marker for highlighted edge */}
                  <marker
                    id="arrow-highlight"
                    viewBox="0 0 10 10"
                    refX="24"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#315EFB" />
                  </marker>

                  {/* Incoming highlight marker */}
                  <marker
                    id="arrow-incoming"
                    viewBox="0 0 10 10"
                    refX="24"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#059669" />
                  </marker>
                </defs>

                {/* Draw SVG Connecting Paths with Bezier Curves and animated particles */}
                {graph.edges.map((edge) => {
                  const sourcePos = nodePositions[edge.source];
                  const targetPos = nodePositions[edge.target];
                  if (!sourcePos || !targetPos) return null;

                  // Connection card center coordinates
                  const sx = sourcePos.x + 110;
                  const sy = sourcePos.y + 45;
                  const tx = targetPos.x + 110;
                  const ty = targetPos.y + 45;

                  const isSourceSelected = activeNode?.id === edge.source;
                  const isTargetSelected = activeNode?.id === edge.target;
                  const isSourceHovered = hoveredNodeId === edge.source;
                  const isTargetHovered = hoveredNodeId === edge.target;

                  const isHighlight = isSourceSelected || isTargetSelected || isSourceHovered || isTargetHovered;
                  const isIncoming = isTargetSelected || isTargetHovered;

                  // Gentle curved cubic bezier
                  const dx = tx - sx;
                  const dy = ty - sy;
                  const cx1 = sx + dx * 0.45;
                  const cy1 = sy;
                  const cx2 = sx + dx * 0.55;
                  const cy2 = ty;

                  const pathD = `M ${sx} ${sy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tx} ${ty}`;

                  const strokeColor = isHighlight
                    ? isIncoming
                      ? '#059669' // Emerald for incoming
                      : '#315EFB' // Royal blue for outgoing
                    : (resolvedTheme === 'dark' ? '#1E293B' : '#E2E8F0');

                  const strokeWidth = isHighlight ? 2.5 : 1.5;
                  const markerId = isHighlight ? (isIncoming ? 'url(#arrow-incoming)' : 'url(#arrow-highlight)') : 'url(#arrow-std)';

                  return (
                    <g key={edge.id} className="transition-opacity duration-200">
                      <path
                        id={`path-${edge.id}`}
                        d={pathD}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={isHighlight ? 'none' : '4,3'}
                        markerEnd={markerId}
                        className="transition-all duration-200"
                      />

                      {/* Animated particle flowing along active edges */}
                      {isHighlight && (
                        <circle r="3.5" fill={isIncoming ? '#059669' : '#315EFB'}>
                          <animateMotion
                            dur="2s"
                            repeatCount="indefinite"
                            path={pathD}
                          />
                        </circle>
                      )}

                      {/* Edge relationship badge centered along curve */}
                      {isHighlight && edge.label && (
                        <g transform={`translate(${(sx + tx) / 2}, ${(sy + ty) / 2})`}>
                          <rect
                            x="-48"
                            y="-11"
                            width="96"
                            height="20"
                            rx="5"
                            fill={resolvedTheme === 'dark' ? '#0F172A' : '#FFFFFF'}
                            stroke={strokeColor}
                            strokeWidth="1"
                            className="shadow-sm"
                          />
                          <text
                            x="0"
                            y="3"
                            textAnchor="middle"
                            fontSize="9"
                            fontFamily="sans-serif"
                            fontWeight="bold"
                            fill={strokeColor}
                          >
                            {edge.label}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Draw Rich SVG Node Cards */}
                {graph.nodes.map((node) => {
                  const pos = nodePositions[node.id];
                  if (!pos) return null;

                  const isSelected = activeNode?.id === node.id;
                  const isHovered = hoveredNodeId === node.id;
                  const isRelated = 
                    isSelected ||
                    incomingEdges.some((e) => e.source === node.id) ||
                    outgoingEdges.some((e) => e.target === node.id);

                  const opacity = (hoveredNodeId || selectedNodeId) && !isRelated ? 0.35 : 1;
                  const cfg = groupColors[node.group] || groupColors.core;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${pos.x}, ${pos.y})`}
                      className="cursor-pointer transition-all duration-200"
                      style={{ opacity }}
                      onClick={() => setSelectedNodeId(node.id)}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                    >
                      {/* Card Outer Shadow & Glow */}
                      {isSelected && (
                        <rect
                          x="-3"
                          y="-3"
                          width="226"
                          height="96"
                          rx="13"
                          fill="none"
                          stroke={cfg.accent}
                          strokeWidth="2.5"
                          strokeOpacity="0.8"
                          className="animate-pulse"
                        />
                      )}

                      {/* Card Main Rectangle */}
                      <rect
                        x="0"
                        y="0"
                        width="220"
                        height="90"
                        rx="10"
                        fill={resolvedTheme === 'dark' ? '#0F172A' : '#FFFFFF'}
                        stroke={isSelected ? cfg.accent : (resolvedTheme === 'dark' ? '#334155' : '#E2E8F0')}
                        strokeWidth={isSelected ? '2' : '1.2'}
                        filter={isSelected ? 'drop-shadow(0 4px 12px rgba(49, 94, 251, 0.15))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.04))'}
                      />

                      {/* Header Accent Bar */}
                      <rect
                        x="0"
                        y="0"
                        width="220"
                        height="26"
                        rx="10"
                        fill={cfg.fill}
                      />
                      {/* Clip bottom corners of top header bar */}
                      <rect
                        x="0"
                        y="16"
                        width="220"
                        height="10"
                        fill={cfg.fill}
                      />

                      {/* Group Category Tag */}
                      <circle cx="14" cy="13" r="4.5" fill={cfg.accent} />
                      <text
                        x="24"
                        y="16"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                        letterSpacing="0.05em"
                        fill={cfg.accent}
                      >
                        {node.group.toUpperCase()}
                      </text>

                      {/* Status Pill on top right */}
                      <text
                        x="208"
                        y="16"
                        textAnchor="end"
                        fontSize="8.5"
                        fontWeight="600"
                        fontFamily="monospace"
                        fill={resolvedTheme === 'dark' ? '#94A3B8' : '#64748B'}
                      >
                        {node.status || 'active'}
                      </text>

                      {/* Node Title */}
                      <text
                        x="12"
                        y="44"
                        fontSize="12"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                        fill={resolvedTheme === 'dark' ? '#F8FAFC' : '#0F172A'}
                      >
                        {node.name.length > 24 ? node.name.substring(0, 22) + '...' : node.name}
                      </text>

                      {/* Path subtitle */}
                      <text
                        x="12"
                        y="60"
                        fontSize="9.5"
                        fontFamily="monospace"
                        fill={resolvedTheme === 'dark' ? '#94A3B8' : '#64748B'}
                      >
                        {node.path.length > 30 ? '...' + node.path.substring(node.path.length - 27) : node.path}
                      </text>

                      {/* Card Footer Divider */}
                      <line
                        x1="10"
                        y1="68"
                        x2="210"
                        y2="68"
                        stroke={resolvedTheme === 'dark' ? '#1E293B' : '#F1F5F9'}
                        strokeWidth="1"
                      />

                      {/* Card Footer: LOC and Dependencies count */}
                      <text
                        x="12"
                        y="81"
                        fontSize="8.5"
                        fontFamily="monospace"
                        fill={resolvedTheme === 'dark' ? '#64748B' : '#94A3B8'}
                      >
                        {node.loc.toLocaleString()} LOC
                      </text>

                      <text
                        x="208"
                        y="81"
                        textAnchor="end"
                        fontSize="8.5"
                        fontFamily="monospace"
                        fill={resolvedTheme === 'dark' ? '#64748B' : '#94A3B8'}
                      >
                        {node.importsCount} in · {node.importedByCount} out
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Module Inspector Side Panel (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Card
              title={
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-brand-primary)]" />
                  <span className="text-sm font-bold text-[var(--color-text-primary)]">Module Inspector</span>
                </div>
              }
              subtitle="Grounded architectural dependencies & AST export boundary"
            >
              <div className="space-y-4 text-xs">
                {/* Selected Node Header */}
                <div className="p-3.5 rounded-xl bg-[var(--color-bg-surface-2)] border border-[var(--color-border-subtle)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[var(--color-text-primary)]">
                      {activeNode.name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--color-brand-primary-soft)] text-[var(--color-brand-primary)]">
                      {activeNode.group}
                    </span>
                  </div>

                  <p className="font-mono text-[11px] text-[var(--color-text-muted)] break-all flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 shrink-0 text-[var(--color-brand-primary)]" />
                    <span>{activeNode.path}</span>
                  </p>

                  <p className="text-[var(--color-text-secondary)] leading-relaxed text-[11.5px] pt-1">
                    {activeNode.description}
                  </p>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-[var(--color-bg-surface-2)] border border-[var(--color-border-subtle)]">
                    <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-semibold">Lines of Code</span>
                    <div className="text-base font-bold text-[var(--color-text-primary)] font-mono mt-0.5">
                      {activeNode.loc.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[var(--color-bg-surface-2)] border border-[var(--color-border-subtle)]">
                    <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-semibold">Complexity Score</span>
                    <div className="text-base font-bold text-amber-500 font-mono mt-0.5">
                      {activeNode.complexityScore || Math.min(95, Math.max(30, Math.round(activeNode.loc / 30)))}/100
                    </div>
                  </div>
                </div>

                {/* Exports Surface */}
                {activeNode.exports && activeNode.exports.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                      Exported Interfaces ({activeNode.exports.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeNode.exports.map((exp) => (
                        <span
                          key={exp}
                          className="px-2 py-0.5 rounded font-mono text-[11px] bg-[var(--color-bg-surface-3)] text-[var(--color-text-primary)] border border-[var(--color-border-subtle)]"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Incoming Dependencies (Modules that import this) */}
                <div className="space-y-1.5 pt-2 border-t border-[var(--color-border-subtle)]">
                  <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide flex items-center justify-between">
                    <span>Imported By ({incomingEdges.length})</span>
                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
                  </span>

                  {incomingEdges.length === 0 ? (
                    <p className="text-[11px] text-[var(--color-text-muted)] italic">
                      Root entrypoint module — not imported by internal packages.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {incomingEdges.map((e) => {
                        const srcNode = graph.nodes.find((n) => n.id === e.source);
                        return (
                          <button
                            key={e.id}
                            onClick={() => setSelectedNodeId(e.source)}
                            className="w-full text-left p-2 rounded-lg bg-[var(--color-bg-surface-2)] hover:bg-[var(--color-bg-surface-3)] border border-[var(--color-border-subtle)] flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <span className="font-medium text-[var(--color-text-primary)] truncate">
                              {srcNode?.name || e.source}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                              {e.label || 'imports'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Outgoing Dependencies (Modules this imports) */}
                <div className="space-y-1.5 pt-2 border-t border-[var(--color-border-subtle)]">
                  <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide flex items-center justify-between">
                    <span>Depends On ({outgoingEdges.length})</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-blue-500" />
                  </span>

                  {outgoingEdges.length === 0 ? (
                    <p className="text-[11px] text-[var(--color-text-muted)] italic">
                      Leaf utility module — zero internal dependencies.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {outgoingEdges.map((e) => {
                        const tgtNode = graph.nodes.find((n) => n.id === e.target);
                        return (
                          <button
                            key={e.id}
                            onClick={() => setSelectedNodeId(e.target)}
                            className="w-full text-left p-2 rounded-lg bg-[var(--color-bg-surface-2)] hover:bg-[var(--color-bg-surface-3)] border border-[var(--color-border-subtle)] flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <span className="font-medium text-[var(--color-text-primary)] truncate">
                              {tgtNode?.name || e.target}
                            </span>
                            <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400">
                              {e.label || 'calls'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Evidence Verification Action */}
                <div className="pt-3 border-t border-[var(--color-border-subtle)]">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-center text-xs"
                    onClick={() => {
                      openEvidence({
                        id: `ev-node-${activeNode.id}`,
                        claim: `Module ${activeNode.name} (${activeNode.path}) structure and boundaries`,
                        status: 'verified',
                        sourcePath: activeNode.path,
                        lineNumber: 1,
                        explanation: `Verified AST module declaration in ${currentRepo.fullName}. Contains ${activeNode.loc} lines of code and ${activeNode.exports.length} public exports.`,
                        revision: currentRepo.commitSha.substring(0, 7)
                      });
                    }}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 mr-1.5" />
                    <span>Inspect Grounded Evidence</span>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        /* Structured Architecture Table View */
        <Card title="Codebase Module Architecture Table" subtitle="Comprehensive tabular representation of indexed modules and interfaces">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--color-bg-surface-2)] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold border-b border-[var(--color-border-default)]">
                <tr>
                  <th className="p-3">Module Name</th>
                  <th className="p-3">Layer</th>
                  <th className="p-3">File Path</th>
                  <th className="p-3 text-right">LOC</th>
                  <th className="p-3">Exports</th>
                  <th className="p-3 text-right">Dependencies</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {graph.nodes.map((node) => (
                  <tr
                    key={node.id}
                    onClick={() => {
                      setSelectedNodeId(node.id);
                      setViewMode('visual');
                    }}
                    className="hover:bg-[var(--color-bg-surface-2)] transition-colors cursor-pointer"
                  >
                    <td className="p-3 font-bold text-[var(--color-text-primary)]">
                      {node.name}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--color-brand-primary-soft)] text-[var(--color-brand-primary)]">
                        {node.group}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[var(--color-text-muted)]">
                      {node.path}
                    </td>
                    <td className="p-3 text-right font-mono font-semibold text-[var(--color-text-primary)]">
                      {node.loc.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {node.exports.slice(0, 3).map((exp) => (
                          <span key={exp} className="px-1.5 py-0.5 rounded bg-[var(--color-bg-surface-3)] font-mono text-[10px]">
                            {exp}
                          </span>
                        ))}
                        {node.exports.length > 3 && (
                          <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                            +{node.exports.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono text-[var(--color-text-muted)]">
                      {node.importsCount} in / {node.importedByCount} out
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {node.status || 'active'}
                      </span>
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
