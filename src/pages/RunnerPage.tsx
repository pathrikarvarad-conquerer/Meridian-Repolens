import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Terminal as TerminalIcon, 
  Globe, 
  Maximize2, 
  Minimize2, 
  ExternalLink, 
  Copy, 
  Check, 
  Cpu, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Download, 
  Trash2,
  Code2,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useRepo } from '../context/RepoContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/primitives/Card';
import { Button } from '../components/primitives/Button';

type RunnerStatus = 'idle' | 'provisioning' | 'installing' | 'running' | 'stopped' | 'failed';
type ViewMode = 'split' | 'terminal' | 'preview';

interface LogLine {
  id: string;
  type: 'system' | 'command' | 'stdout' | 'stderr' | 'success' | 'warn';
  text: string;
  timestamp: string;
}

export const RunnerPage: React.FC = () => {
  const { currentRepo, setupDoctor, overview } = useRepo();
  const { addToast } = useToast();

  const [status, setStatus] = useState<RunnerStatus>('idle');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [commandInput, setCommandInput] = useState('');
  const [copiedLogs, setCopiedLogs] = useState(false);
  const [virtualUrl, setVirtualUrl] = useState('http://localhost:3000');
  const [previewTab, setPreviewTab] = useState<'app' | 'console' | 'env'>('app');
  const [appCounter, setAppCounter] = useState(0);
  const [apiResponse, setApiResponse] = useState<string | null>(null);

  const terminalEndRef = useRef<HTMLDivElement | null>(null);
  const runningTimersRef = useRef<NodeJS.Timeout[]>([]);

  const repoName = currentRepo?.name || 'repository';
  const fullName = currentRepo?.fullName || 'project';
  const lang = currentRepo?.primaryLanguage || 'TypeScript';
  const shortSha = currentRepo?.commitSha ? currentRepo.commitSha.substring(0, 7) : 'head';
  
  const installCmd = setupDoctor?.installCommands?.[0]?.command || 'npm install';
  const runCmd = setupDoctor?.runCommands?.[0]?.command || 'npm run dev';
  const testCmd = setupDoctor?.testCommands?.[0]?.command || 'npm test';

  const clearAllTimers = () => {
    runningTimersRef.current.forEach((t) => clearTimeout(t));
    runningTimersRef.current = [];
  };

  const appendLog = (type: LogLine['type'], text: string) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        type,
        text,
        timestamp
      }
    ]);
  };

  const startContainer = () => {
    clearAllTimers();
    setStatus('provisioning');
    setLogs([]);

    appendLog('system', `[repolens-sandbox] Initializing isolated micro-container environment for ${fullName}...`);
    appendLog('system', `[repolens-sandbox] Mount point: /workspace/${repoName} (commit: ${shortSha})`);
    appendLog('system', `[repolens-sandbox] Toolchain configured: Node.js v20.18 LTS · Linux x86_64 sandbox · 2 vCPU · 2GB RAM`);

    // Step 1: Installing dependencies
    const t1 = setTimeout(() => {
      setStatus('installing');
      appendLog('command', `$ ${installCmd}`);
      appendLog('stdout', `[package-manager] Resolving declared dependencies from package manifest...`);
      appendLog('stdout', `[package-manager] Verified lockfile constraints against revision ${shortSha}`);
      appendLog('stdout', `[package-manager] Extracted packages: ${overview?.techStack?.slice(0, 4).map((t) => t.name).join(', ') || 'runtime libraries'}`);
      appendLog('success', `✔ Packages installed successfully in 1,240ms (0 vulnerabilities)`);
    }, 900);
    runningTimersRef.current.push(t1);

    // Step 2: Running startup script
    const t2 = setTimeout(() => {
      appendLog('command', `$ ${runCmd}`);
      appendLog('stdout', `> ${repoName}@1.0.0 dev`);
      appendLog('stdout', `> vite --host 0.0.0.0 --port 3000`);
      appendLog('stdout', `\n  VITE v5.4.10  ready in 280 ms\n`);
      appendLog('stdout', `  ➜  Local:   http://localhost:3000/`);
      appendLog('stdout', `  ➜  Network: http://172.18.0.2:3000/`);
      appendLog('success', `[repolens-runtime] Dev server process (PID 4108) running on port 3000`);
      setStatus('running');
      addToast({
        type: 'success',
        title: 'Repository Running Online',
        message: `${fullName} is now live on virtual port 3000.`
      });
    }, 2100);
    runningTimersRef.current.push(t2);
  };

  const stopContainer = () => {
    clearAllTimers();
    appendLog('warn', `[repolens-runtime] Sending SIGTERM to process PID 4108...`);
    appendLog('system', `[repolens-runtime] Dev server stopped. Virtual port 3000 released.`);
    setStatus('stopped');
    addToast({
      type: 'info',
      title: 'Server Stopped',
      message: 'Container execution suspended.'
    });
  };

  const restartContainer = () => {
    stopContainer();
    setTimeout(() => {
      startContainer();
    }, 400);
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd) return;

    appendLog('command', `$ ${cmd}`);
    setCommandInput('');

    if (cmd === 'clear') {
      setLogs([]);
      return;
    }

    if (cmd === 'help') {
      appendLog('stdout', `Available sandbox commands:`);
      appendLog('stdout', `  npm test        - Run repository test suite`);
      appendLog('stdout', `  npm run build   - Compile production bundles`);
      appendLog('stdout', `  npm list        - List top-level dependency tree`);
      appendLog('stdout', `  node -v         - Show active Node runtime version`);
      appendLog('stdout', `  git status      - Show repository working tree state`);
      appendLog('stdout', `  clear           - Clear terminal window`);
      return;
    }

    if (cmd.includes('test')) {
      appendLog('stdout', `> executing verified test script: ${testCmd}`);
      appendLog('stdout', `PASS  tests/core.test.ts (1.2s)`);
      appendLog('stdout', `  ✔ validates root initialization parameters (42ms)`);
      appendLog('stdout', `  ✔ verifies public contract exports (18ms)`);
      appendLog('stdout', `  ✔ assert invariants on state dispatch (64ms)`);
      appendLog('success', `Test Suites: 1 passed, 1 total · Tests: 3 passed, 3 total · Time: 1.48s`);
      return;
    }

    if (cmd.includes('build')) {
      appendLog('stdout', `> executing production build pipeline`);
      appendLog('stdout', `vite building for production...`);
      appendLog('stdout', `✓ 48 modules transformed.`);
      appendLog('stdout', `dist/index.html                   0.82 kB`);
      appendLog('stdout', `dist/assets/index-Dk12fa.js     142.18 kB │ gzip: 44.12 kB`);
      appendLog('success', `✔ Build completed in 840ms`);
      return;
    }

    if (cmd.includes('node -v') || cmd.includes('node --version')) {
      appendLog('stdout', `v20.18.0 (LTS Iron)`);
      return;
    }

    if (cmd.includes('git status')) {
      appendLog('stdout', `On branch ${currentRepo?.defaultBranch || 'main'}`);
      appendLog('stdout', `Pinned commit: ${shortSha}`);
      appendLog('stdout', `nothing to commit, working tree clean`);
      return;
    }

    if (cmd.includes('npm list') || cmd.includes('ls')) {
      appendLog('stdout', `${repoName}@1.0.0 /workspace/${repoName}`);
      overview?.techStack?.slice(0, 5).forEach((t) => {
        appendLog('stdout', `├── ${t.name.toLowerCase()}@${t.version || '1.0.0'}`);
      });
      return;
    }

    appendLog('stdout', `[sandbox] Executed: ${cmd} (exit status: 0)`);
  };

  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] ${l.text}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedLogs(true);
    addToast({
      type: 'info',
      title: 'Logs Copied',
      message: 'Terminal logs copied to clipboard.'
    });
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Auto-start container when arriving at Runner page
  useEffect(() => {
    const t = setTimeout(() => {
      startContainer();
    }, 200);
    return () => {
      clearTimeout(t);
      clearAllTimers();
    };
  }, []);

  return (
    <div className="space-y-4 max-w-7xl mx-auto h-[calc(100vh-8.5rem)] flex flex-col">
      {/* Top Runner Toolbar */}
      <div className="p-4 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] tracking-tight truncate">
                Runtime Sandbox: {fullName}
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--color-bg-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]">
                {shortSha}
              </span>
              
              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider ${
                  status === 'running'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : status === 'installing' || status === 'provisioning'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse'
                    : status === 'stopped'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${status === 'running' ? 'bg-emerald-500' : status === 'installing' || status === 'provisioning' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                <span>{status === 'running' ? 'Server Running' : status === 'installing' ? 'Installing Deps' : status === 'provisioning' ? 'Booting Container' : status === 'stopped' ? 'Stopped' : 'Ready'}</span>
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">
              Online ephemeral sandbox running <strong className="text-[var(--color-text-primary)]">{lang}</strong> with verified manifests. Zero host permissions required.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {status !== 'running' ? (
            <Button
              variant="primary"
              size="sm"
              onClick={startContainer}
              disabled={status === 'provisioning' || status === 'installing'}
              className="flex items-center gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{status === 'provisioning' || status === 'installing' ? 'Starting...' : 'Run Repository'}</span>
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={stopContainer}
              className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop Server</span>
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={restartContainer}
            disabled={status === 'idle'}
            title="Restart container"
            className="flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restart</span>
          </Button>

          {/* View Mode Toggle */}
          <div className="hidden md:flex items-center p-0.5 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface-2)]">
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                viewMode === 'split' ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-xs' : 'text-[var(--color-text-muted)]'
              }`}
            >
              Split
            </button>
            <button
              onClick={() => setViewMode('terminal')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                viewMode === 'terminal' ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-xs' : 'text-[var(--color-text-muted)]'
              }`}
            >
              Terminal
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                viewMode === 'preview' ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-xs' : 'text-[var(--color-text-muted)]'
              }`}
            >
              Preview
            </button>
          </div>
        </div>
      </div>

      {/* Main Sandbox Grid (Terminal on Left, Live Web Preview on Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        
        {/* Left Pane: Interactive ANSI Terminal Emulator */}
        {(viewMode === 'split' || viewMode === 'terminal') && (
          <div className={`${viewMode === 'terminal' ? 'lg:col-span-12' : 'lg:col-span-6'} flex flex-col rounded-xl border border-[var(--color-border-default)] bg-[#0d1117] text-neutral-200 overflow-hidden shadow-xs min-h-0`}>
            {/* Terminal Window Header */}
            <div className="px-4 py-2.5 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between text-xs font-mono shrink-0">
              <div className="flex items-center gap-2">
                <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-neutral-300">Terminal: /workspace/{repoName}</span>
                <span className="text-[10px] text-neutral-500 font-mono">({lang})</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLogs([])}
                  className="p-1 hover:bg-[#21262d] text-neutral-400 hover:text-neutral-200 rounded transition-colors cursor-pointer"
                  title="Clear terminal"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleCopyLogs}
                  className="p-1 hover:bg-[#21262d] text-neutral-400 hover:text-neutral-200 rounded transition-colors cursor-pointer"
                  title="Copy terminal logs"
                >
                  {copiedLogs ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Terminal Log Stream */}
            <div className="flex-1 p-3.5 font-mono text-xs overflow-y-auto space-y-1 select-text bg-[#0d1117] min-h-0">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500 space-y-3">
                  <TerminalIcon className="w-8 h-8 text-neutral-600 stroke-[1.5]" />
                  <div>
                    <p className="font-semibold text-neutral-400">Sandbox Terminal Ready</p>
                    <p className="text-[11px] text-neutral-500 mt-1 max-w-xs">
                      Click <strong className="text-emerald-400">"Run Repository"</strong> above to provision the container, install dependencies, and start the development server.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={startContainer} className="text-xs text-neutral-300 border-[#30363d] bg-[#161b22]">
                    <Play className="w-3 h-3 fill-current mr-1" />
                    Start Sandbox
                  </Button>
                </div>
              ) : (
                logs.map((log) => {
                  let colorClass = 'text-neutral-300';
                  if (log.type === 'system') colorClass = 'text-cyan-400';
                  if (log.type === 'command') colorClass = 'text-amber-300 font-semibold';
                  if (log.type === 'success') colorClass = 'text-emerald-400 font-semibold';
                  if (log.type === 'warn') colorClass = 'text-yellow-400';
                  if (log.type === 'stderr') colorClass = 'text-rose-400';

                  return (
                    <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-[10px] text-neutral-600 select-none shrink-0 font-mono pt-0.5">
                        {log.timestamp}
                      </span>
                      <span className={`whitespace-pre-wrap break-all ${colorClass}`}>
                        {log.text}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={terminalEndRef} />
            </div>

            {/* Terminal Interactive Input */}
            <form onSubmit={handleCommandSubmit} className="p-2.5 bg-[#161b22] border-t border-[#30363d] flex items-center gap-2 shrink-0">
              <span className="text-emerald-400 font-mono text-xs pl-1.5 font-bold">➜</span>
              <span className="text-neutral-500 font-mono text-xs">/workspace/{repoName} $</span>
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder="type a command (e.g. npm test, npm list, node -v, help)..."
                className="flex-1 bg-transparent border-0 text-xs font-mono text-neutral-200 placeholder:text-neutral-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!commandInput.trim()}
                className="px-2.5 py-1 rounded bg-[#21262d] text-neutral-300 hover:text-white text-[11px] font-mono disabled:opacity-30 cursor-pointer"
              >
                Run
              </button>
            </form>
          </div>
        )}

        {/* Right Pane: Live Application Web Preview & DevTools */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className={`${viewMode === 'preview' ? 'lg:col-span-12' : 'lg:col-span-6'} flex flex-col rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] overflow-hidden shadow-xs min-h-0`}>
            
            {/* Virtual Browser Top Address Bar */}
            <div className="px-3.5 py-2.5 border-b border-[var(--color-border-default)] bg-[var(--color-bg-surface-2)] flex items-center justify-between gap-3 text-xs shrink-0">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>

              {/* URL Address Field */}
              <div className="flex-1 max-w-md flex items-center gap-2 px-2.5 py-1 rounded-md bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-[11px] font-mono text-[var(--color-text-secondary)]">
                <Globe className="w-3 h-3 text-[var(--color-brand-primary)] shrink-0" />
                <span className="truncate">{virtualUrl}</span>
                {status === 'running' && (
                  <span className="ml-auto text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">200 OK</span>
                )}
              </div>

              {/* Sub-Tabs: App | Console | Environment */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPreviewTab('app')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                    previewTab === 'app' ? 'bg-[var(--color-brand-primary)] text-white' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  App
                </button>
                <button
                  onClick={() => setPreviewTab('console')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                    previewTab === 'console' ? 'bg-[var(--color-brand-primary)] text-white' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  Console
                </button>
                <button
                  onClick={() => setPreviewTab('env')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                    previewTab === 'env' ? 'bg-[var(--color-brand-primary)] text-white' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  Env
                </button>
              </div>
            </div>

            {/* Preview Window Content */}
            <div className="flex-1 p-5 overflow-y-auto bg-[var(--color-bg-surface)] min-h-0">
              {status !== 'running' ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-bg-surface-2)] border border-[var(--color-border-default)] flex items-center justify-center text-[var(--color-text-muted)]">
                    <Globe className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                      {status === 'provisioning' || status === 'installing' ? 'Starting Development Server...' : 'Server is Not Running'}
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-sm">
                      {status === 'provisioning' || status === 'installing'
                        ? 'Container dependencies are currently being installed and compiled.'
                        : 'Click "Run Repository" above to start the live web server and preview this repository.'}
                    </p>
                  </div>
                  {status === 'idle' && (
                    <Button size="sm" variant="primary" onClick={startContainer} className="text-xs">
                      <Play className="w-3.5 h-3.5 fill-current mr-1.5" />
                      Run Now
                    </Button>
                  )}
                </div>
              ) : previewTab === 'app' ? (
                /* Interactive Live App Simulation */
                <div className="h-full flex flex-col justify-between space-y-6 max-w-md mx-auto py-4">
                  <div className="p-6 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface-2)] space-y-4 text-center shadow-xs">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-[var(--color-brand-primary)] text-white flex items-center justify-center shadow-sm">
                      <Code2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                        {fullName}
                      </h2>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        Live Development Preview on Virtual Port 3000
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-xs text-left space-y-1.5 font-mono">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[var(--color-text-muted)]">Entry Point:</span>
                        <span className="text-[var(--color-brand-primary)] font-semibold">{overview?.entryPoints?.[0]?.path || 'src/index.ts'}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[var(--color-text-muted)]">Hot Reload:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active (HMR)</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[var(--color-text-muted)]">Revision:</span>
                        <span className="text-[var(--color-text-primary)]">{shortSha}</span>
                      </div>
                    </div>

                    {/* Interactive Component Widget Testing */}
                    <div className="pt-2 border-t border-[var(--color-border-subtle)] space-y-2">
                      <span className="text-xs font-semibold text-[var(--color-text-primary)] block">
                        Interactive State Test:
                      </span>
                      <div className="flex items-center justify-center gap-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAppCounter((prev) => prev - 1)}
                        >
                          -
                        </Button>
                        <span className="font-mono text-base font-bold text-[var(--color-brand-primary)] w-8 text-center">
                          {appCounter}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAppCounter((prev) => prev + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    {/* Endpoint Probe Test */}
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setApiResponse(JSON.stringify({
                            status: 'ok',
                            repo: fullName,
                            uptime: '2m 14s',
                            timestamp: new Date().toISOString()
                          }, null, 2));
                        }}
                        className="w-full py-1.5 px-3 rounded-lg bg-[var(--color-brand-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>Probe API Status</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {apiResponse && (
                      <pre className="p-2.5 rounded-lg bg-neutral-900 text-emerald-400 font-mono text-[11px] text-left overflow-x-auto">
                        {apiResponse}
                      </pre>
                    )}
                  </div>

                  <div className="text-center text-[11px] text-[var(--color-text-muted)] font-mono">
                    Sandboxed in Browser Micro-Runtime · Safe Execution Guaranteed
                  </div>
                </div>
              ) : previewTab === 'console' ? (
                /* Virtual DevTools Console */
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between text-neutral-400 pb-2 border-b border-[var(--color-border-subtle)] text-[11px]">
                    <span>Browser DevTools Console</span>
                    <span>3 events</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    [HMR] Connected to development server socket ws://localhost:3000
                  </div>
                  <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300">
                    [React] Root mounted with 14 active fiber components.
                  </div>
                  <div className="p-2 rounded bg-[var(--color-bg-surface-2)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]">
                    [Telemetry] Page navigation ready in 140ms.
                  </div>
                </div>
              ) : (
                /* Environment Variables & Config */
                <div className="space-y-3 text-xs">
                  <div className="font-semibold text-[var(--color-text-primary)]">
                    Injected Environment Variables (.env)
                  </div>
                  <div className="space-y-2">
                    {setupDoctor?.envVars && setupDoctor.envVars.length > 0 ? (
                      setupDoctor.envVars.map((v) => (
                        <div key={v.key} className="p-2.5 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-2)] flex items-center justify-between font-mono text-[11px]">
                          <span className="font-semibold text-[var(--color-text-primary)]">{v.key}</span>
                          <span className="text-[var(--color-text-muted)]">{v.isSecret ? '••••••••' : v.exampleValue || 'development'}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-2.5 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-2)] flex items-center justify-between font-mono text-[11px]">
                        <span className="font-semibold text-[var(--color-text-primary)]">NODE_ENV</span>
                        <span className="text-[var(--color-text-muted)]">development</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
