import React, { useState } from 'react';
import { 
  Stethoscope, 
  Terminal, 
  AlertTriangle, 
  Check, 
  Copy, 
  ShieldAlert, 
  Info, 
  Key, 
  ExternalLink,
  FileCheck,
  Play
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRepo } from '../context/RepoContext';
import { useEvidenceDrawer } from '../context/EvidenceDrawerContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/primitives/Card';
import { EvidenceBadge } from '../components/primitives/EvidenceBadge';
import { Button } from '../components/primitives/Button';

export const SetupDoctorPage: React.FC = () => {
  const { currentRepo, setupDoctor } = useRepo();
  const { openEvidence } = useEvidenceDrawer();
  const { addToast } = useToast();

  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!currentRepo || !setupDoctor) {
    return (
      <div className="py-16 text-center text-neutral-500 text-sm">
        No setup analysis available for this repository.
      </div>
    );
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    addToast({
      type: 'info',
      title: 'Copied to Clipboard',
      message: `${label} copied.`
    });
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header and Disclaimer */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Stethoscope className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            Setup Doctor
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
          Environment prerequisites, installation recipes, test commands, and documentation inconsistency audit for <strong className="text-neutral-900 dark:text-neutral-100">{currentRepo.fullName}</strong>.
        </p>

        {/* Mandatory Static Analysis Disclaimer */}
        <div className="mt-4 p-4 rounded-lg bg-neutral-100/90 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div className="text-xs space-y-1">
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              Static Analysis Verification Policy:
            </span>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {setupDoctor.executionDisclaimer} Commands are verified for structural presence in repository manifests and documentation files. RepoLens never executes arbitrary repository code or claims tests have passed without running them in an authenticated sandbox.
            </p>
          </div>
        </div>

        {/* Online Runtime Environment Launch Banner */}
        <div className="mt-3 p-3.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Play className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 fill-current" />
            <span className="text-xs text-neutral-800 dark:text-neutral-200">
              Want to run and test these commands live? Execute <strong>{currentRepo.name}</strong> inside the RepoLens browser micro-sandbox.
            </span>
          </div>
          <Link to="/run" className="shrink-0">
            <Button size="sm" variant="primary" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs">
              <Play className="w-3 h-3 fill-current" />
              <span>Launch Sandbox</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Detected Inconsistencies Banner (if any) */}
      {setupDoctor.inconsistencies.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Documentation vs Configuration Inconsistencies ({setupDoctor.inconsistencies.length})</span>
          </div>

          <div className="space-y-3">
            {setupDoctor.inconsistencies.map((inc) => (
              <div
                key={inc.id}
                className="p-4 rounded-lg border border-amber-300 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 text-xs space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900 dark:text-neutral-100">
                      {inc.title}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-200">
                      {inc.severity} severity
                    </span>
                  </div>
                  <EvidenceBadge status={inc.evidence.status} evidence={inc.evidence} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
                  <div className="bg-white/80 dark:bg-neutral-900/80 p-2.5 rounded border border-neutral-200 dark:border-neutral-800">
                    <span className="font-semibold text-neutral-500 text-[11px] block mb-1">
                      Documentation States ({inc.docSource}):
                    </span>
                    <p className="text-neutral-800 dark:text-neutral-200 font-mono text-[11px]">
                      {inc.docStatement}
                    </p>
                  </div>
                  <div className="bg-white/80 dark:bg-neutral-900/80 p-2.5 rounded border border-neutral-200 dark:border-neutral-800">
                    <span className="font-semibold text-neutral-500 text-[11px] block mb-1">
                      Configuration Reality ({inc.configSource}):
                    </span>
                    <p className="text-neutral-800 dark:text-neutral-200 font-mono text-[11px]">
                      {inc.configReality}
                    </p>
                  </div>
                </div>

                <div className="text-neutral-700 dark:text-neutral-300 pt-1">
                  <strong>Recommendation: </strong>
                  {inc.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prerequisites Table */}
      <Card title="Prerequisites & Toolchain Requirements">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-medium pb-2">
                <th className="py-2.5 font-semibold">Requirement</th>
                <th className="py-2.5 font-semibold">Version Constraint</th>
                <th className="py-2.5 font-semibold">Detected In</th>
                <th className="py-2.5 font-semibold">Install Command</th>
                <th className="py-2.5 font-semibold text-right">Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {setupDoctor.prerequisites.map((req) => (
                <tr key={req.name} className="hover:bg-neutral-50 dark:hover:bg-neutral-850/50 transition-colors">
                  <td className="py-3 font-semibold text-neutral-900 dark:text-neutral-100">
                    {req.name}
                  </td>
                  <td className="py-3 font-mono text-neutral-600 dark:text-neutral-300">
                    {req.versionRequirement}
                  </td>
                  <td className="py-3 font-mono text-neutral-500">
                    {req.detectedIn}
                  </td>
                  <td className="py-3">
                    {req.installCommand ? (
                      <div className="flex items-center gap-1.5">
                        <code className="font-mono text-[11px] bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-800 dark:text-neutral-200">
                          {req.installCommand}
                        </code>
                        <button
                          onClick={() => handleCopy(req.installCommand!, req.name)}
                          className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                          aria-label="Copy install command"
                        >
                          {copiedCmd === req.installCommand ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <EvidenceBadge status={req.status} evidence={req.evidence} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Installation & Test Commands Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Installation Commands */}
        <Card title="Documented Installation Commands">
          <div className="space-y-4">
            {setupDoctor.installCommands.map((cmd, idx) => (
              <div key={idx} className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {cmd.purpose}
                  </span>
                  <EvidenceBadge status={cmd.evidence.status} evidence={cmd.evidence} />
                </div>
                <div className="flex items-center justify-between bg-neutral-900 text-neutral-100 p-2.5 rounded font-mono text-xs overflow-x-auto">
                  <code>{cmd.command}</code>
                  <button
                    onClick={() => handleCopy(cmd.command, 'Install command')}
                    className="p-1 hover:text-neutral-300 cursor-pointer shrink-0 ml-2"
                  >
                    {copiedCmd === cmd.command ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="text-[11px] text-neutral-500">
                  <span>Source: {cmd.source}</span>
                  {cmd.notes && <span> · {cmd.notes}</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Test Commands */}
        <Card title="Documented Test Commands">
          <div className="space-y-4">
            {setupDoctor.testCommands.map((cmd, idx) => (
              <div key={idx} className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {cmd.purpose}
                  </span>
                  <EvidenceBadge status={cmd.evidence.status} evidence={cmd.evidence} />
                </div>
                <div className="flex items-center justify-between bg-neutral-900 text-neutral-100 p-2.5 rounded font-mono text-xs overflow-x-auto">
                  <code>{cmd.command}</code>
                  <button
                    onClick={() => handleCopy(cmd.command, 'Test command')}
                    className="p-1 hover:text-neutral-300 cursor-pointer shrink-0 ml-2"
                  >
                    {copiedCmd === cmd.command ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="text-[11px] text-neutral-500">
                  <span>Status: Static analysis verified declaration in {cmd.evidence.sourcePath}</span>
                  {cmd.notes && <span> · {cmd.notes}</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Safe Environment Variables Inspection */}
      <Card
        title="Environment Variables (Safe Static Exposure)"
        subtitle="Values and secrets are never retrieved or stored. Only variable names declared in .env.example or build scripts are mapped."
      >
        {setupDoctor.envVars.length === 0 ? (
          <p className="text-xs text-neutral-500 py-3">
            No mandatory environment variables discovered in root configuration or example templates.
          </p>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {setupDoctor.envVars.map((env) => (
              <div key={env.key} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Key className="w-3.5 h-3.5 text-neutral-400" />
                    <code className="font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      {env.key}
                    </code>
                    {env.required && (
                      <span className="text-[10px] uppercase font-mono px-1 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-semibold">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {env.purpose}
                  </p>
                  <div className="text-[11px] text-neutral-400 font-mono">
                    Detected in: {env.detectedIn}
                    {env.exampleValue && ` (Example: ${env.exampleValue})`}
                  </div>
                </div>
                <EvidenceBadge status={env.evidence.status} evidence={env.evidence} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
