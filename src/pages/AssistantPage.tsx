import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  GitCommit, 
  ShieldCheck, 
  RotateCcw, 
  Check, 
  Copy, 
  AlertCircle,
  FileCode,
  Terminal,
  Code2,
  HelpCircle,
  Layers,
  Wrench,
  Cpu,
  Zap
} from 'lucide-react';
import { useRepo } from '../context/RepoContext';
import { useEvidenceDrawer } from '../context/EvidenceDrawerContext';
import { useToast } from '../context/ToastContext';
import { repoLensApi } from '../services/api';
import { ChatMessage, Evidence } from '../types';
import { EvidenceBadge } from '../components/primitives/EvidenceBadge';
import { Button } from '../components/primitives/Button';

// Formats assistant message markdown with headings, code blocks, and copy buttons
const FormattedMessage: React.FC<{ content: string }> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split content by code blocks ```...```
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 leading-relaxed text-xs">
      {parts.map((part, idx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const match = part.match(/^```([a-zA-Z0-9_-]*)\n([\s\S]*?)```$/);
          const lang = match ? match[1] : '';
          const code = match ? match[2] : part.slice(3, -3);

          return (
            <div key={idx} className="my-2.5 rounded-lg overflow-hidden border border-[var(--color-border-default)] bg-[var(--color-bg-surface-3)]">
              <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--color-bg-surface-2)] border-b border-[var(--color-border-subtle)] text-[11px] font-mono text-[var(--color-text-muted)]">
                <span>{lang || 'code'}</span>
                <button
                  onClick={() => copyCode(code.trim(), idx)}
                  className="flex items-center gap-1 hover:text-[var(--color-text-primary)] cursor-pointer"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 text-[11.5px] font-mono text-[var(--color-text-primary)] overflow-x-auto leading-normal">
                <code>{code.trim()}</code>
              </pre>
            </div>
          );
        }

        // Split text by lines to handle headings and bullets
        const lines = part.split('\n');
        return (
          <div key={idx} className="space-y-1.5">
            {lines.map((line, lIdx) => {
              if (line.startsWith('### ')) {
                return (
                  <h3 key={lIdx} className="text-sm font-bold text-[var(--color-text-primary)] pt-1.5">
                    {line.slice(4)}
                  </h3>
                );
              }
              if (line.startsWith('#### ')) {
                return (
                  <h4 key={lIdx} className="text-xs font-bold text-[var(--color-text-primary)] pt-1 uppercase tracking-wider text-[var(--color-brand-primary)]">
                    {line.slice(5)}
                  </h4>
                );
              }
              if (line.startsWith('- ') || line.startsWith('* ')) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-2">
                    <span className="text-[var(--color-brand-primary)] font-bold shrink-0">•</span>
                    <span className="text-[var(--color-text-secondary)]">{renderInlineMarkup(line.slice(2))}</span>
                  </div>
                );
              }
              if (line.trim().length === 0) {
                return <div key={lIdx} className="h-1" />;
              }
              return (
                <p key={lIdx} className="text-[var(--color-text-secondary)]">
                  {renderInlineMarkup(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

// Renders bold (**...**) and inline code (`...`)
function renderInlineMarkup(text: string): React.ReactNode {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((seg, i) => {
    if (seg.startsWith('`') && seg.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-[var(--color-bg-surface-3)] font-mono text-[11px] text-[var(--color-brand-primary)] font-bold">
          {seg.slice(1, -1)}
        </code>
      );
    }
    if (seg.startsWith('**') && seg.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-[var(--color-text-primary)]">
          {seg.slice(2, -2)}
        </strong>
      );
    }
    return seg;
  });
}

export const AssistantPage: React.FC = () => {
  const { 
    currentRepo, 
    overview, 
    setupDoctor, 
    graph, 
    issues, 
    chatMessages, 
    addChatMessage, 
    clearChat 
  } = useRepo();
  const { openEvidence } = useEvidenceDrawer();
  const { addToast } = useToast();
  const location = useLocation();

  const [input, setInput] = useState('');
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isSending]);

  // Handle passed investigate prompt from RecommendedIssuesPage
  useEffect(() => {
    const state = location.state as { investigatePrompt?: string } | null;
    if (state?.investigatePrompt) {
      setInput(state.investigatePrompt);
      textareaRef.current?.focus();
    }
  }, [location.state]);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || isSending || !currentRepo || !overview || !setupDoctor) return;

    // Save draft for preservation on failure
    setDraft(textToSend);
    setInput('');
    setError(null);
    setIsSending(true);

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    addChatMessage(userMsg);

    try {
      const assistantResult = await repoLensApi.askAssistant(
        currentRepo.id,
        textToSend,
        currentRepo,
        overview,
        setupDoctor,
        chatMessages,
        graph,
        issues
      );

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: assistantResult.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        evidenceReferences: assistantResult.evidence,
        suggestedFollowUps: assistantResult.suggestedFollowUps,
        tokensUsed: assistantResult.tokensUsed
      };

      addChatMessage(assistantMsg);
      setDraft(''); // Clear draft on success
    } catch (err: any) {
      setError(err?.message || 'Failed to generate response. Your prompt draft was preserved.');
      setInput(textToSend);
      addToast({
        type: 'error',
        title: 'Assistant Request Failed',
        message: 'Draft preserved. You can edit and retry.'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const shortSha = currentRepo?.commitSha ? currentRepo.commitSha.substring(0, 7) : 'head';

  const quickStarters = [
    { label: 'Explain architecture & modules', prompt: `Explain the high-level architecture and how modules interact in ${currentRepo?.name}.` },
    { label: 'How to run tests', prompt: `What is the exact command to run tests for ${currentRepo?.name}?` },
    { label: 'Local setup guide', prompt: `What are the step-by-step instructions and prerequisites to set up ${currentRepo?.name} locally?` },
    { label: 'Recommend beginner issue', prompt: `Which open issue is easiest for a new contributor to start with, and how should I fix it?` }
  ];

  const messagesWithTokens = chatMessages.filter((m) => m.tokensUsed);
  const totalSessionTokens = chatMessages.reduce((sum, m) => sum + (m.tokensUsed?.totalTokens || 0), 0);
  const avgTokensPerRequest = messagesWithTokens.length > 0 ? Math.round(totalSessionTokens / messagesWithTokens.length) : null;

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col space-y-4">
      {/* Context Banner */}
      <div className="p-3.5 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 shadow-xs">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-[var(--color-brand-primary)]" />
          <span className="font-semibold text-[var(--color-text-primary)]">
            RepoLens Assistant
          </span>
          <span className="text-[var(--color-text-muted)]">·</span>
          <span className="font-mono text-[var(--color-text-secondary)] font-bold">
            {currentRepo?.fullName}
          </span>
          <span className="text-[var(--color-text-muted)] font-mono">
            ({shortSha})
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {totalSessionTokens > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--color-bg-surface-2)] text-[11px] font-mono text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]" title="Total tokens consumed across all assistant queries">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500/20" />
              <span>{totalSessionTokens.toLocaleString()} tokens</span>
              {avgTokensPerRequest && (
                <span className="text-[var(--color-text-muted)] text-[10px]">(~{avgTokensPerRequest.toLocaleString()}/req)</span>
              )}
            </div>
          )}
          <button
            onClick={clearChat}
            className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Chat</span>
          </button>
        </div>
      </div>

      {/* Quick Starters Carousel if few messages */}
      {chatMessages.length <= 2 && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
            Quick Prompts:
          </span>
          {quickStarters.map((qs) => (
            <button
              key={qs.label}
              onClick={() => handleSend(qs.prompt)}
              disabled={isSending}
              className="text-xs px-2.5 py-1 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-surface-2)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
            >
              {qs.label}
            </button>
          ))}
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {chatMessages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-[var(--color-text-primary)] text-[var(--color-bg-canvas)]'
                    : 'bg-[var(--color-brand-primary)] text-white shadow-xs'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-xl p-4 text-xs space-y-3 ${
                  isUser
                    ? 'bg-[var(--color-brand-primary)] text-white shadow-xs'
                    : 'bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] shadow-xs'
                }`}
              >
                {isUser ? (
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </div>
                ) : (
                  <FormattedMessage content={msg.content} />
                )}

                {/* Evidence References in Assistant Messages */}
                {msg.evidenceReferences && msg.evidenceReferences.length > 0 && (
                  <div className="pt-2 border-t border-[var(--color-border-subtle)] space-y-1.5">
                    <span className="text-[10px] uppercase font-semibold text-[var(--color-text-muted)] block tracking-wider">
                      Referenced Verification Sources:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.evidenceReferences.map((ev) => (
                        <EvidenceBadge
                          key={ev.id}
                          status={ev.status}
                          evidence={ev}
                          size="sm"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Follow-up suggestions */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="pt-2 border-t border-[var(--color-border-subtle)] space-y-1.5">
                    <span className="text-[10px] uppercase font-semibold text-[var(--color-text-muted)] block tracking-wider">
                      Suggested Next Questions:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedFollowUps.map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => handleSend(prompt)}
                          className="text-[11px] px-2 py-1 rounded bg-[var(--color-bg-surface-2)] hover:bg-[var(--color-bg-surface-3)] text-[var(--color-text-primary)] border border-[var(--color-border-subtle)] transition-colors cursor-pointer text-left"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] pt-1">
                  {msg.tokensUsed ? (
                    <span 
                      className="inline-flex items-center gap-1.5 font-mono text-[9.5px] px-1.5 py-0.5 rounded bg-[var(--color-bg-surface-2)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]" 
                      title={`Prompt Context: ${msg.tokensUsed.promptTokens.toLocaleString()} tokens\nGenerated Output: ${msg.tokensUsed.completionTokens.toLocaleString()} tokens\nTotal: ${msg.tokensUsed.totalTokens.toLocaleString()} tokens`}
                    >
                      <Cpu className="w-2.5 h-2.5 text-[var(--color-brand-primary)]" />
                      <span className="font-semibold">{msg.tokensUsed.totalTokens.toLocaleString()} tokens</span>
                      <span className="text-[var(--color-text-muted)]">({msg.tokensUsed.promptTokens.toLocaleString()} in · {msg.tokensUsed.completionTokens.toLocaleString()} out)</span>
                    </span>
                  ) : <span />}
                  <span>{msg.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-[var(--color-brand-primary)] text-white flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl p-3.5 text-xs text-[var(--color-text-muted)] shadow-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-primary)] animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-primary)] animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-primary)] animate-bounce [animation-delay:0.4s]" />
              <span className="text-[var(--color-text-muted)] ml-1">Reasoning across repository codebase and AST architecture...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error / Draft notice */}
      {error && (
        <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => handleSend(draft)}
            className="font-semibold underline ml-2 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Input Box */}
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl p-3 shadow-xs">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder={`Ask about architecture, solving issue #..., test commands, or modules in ${currentRepo?.name}... (Enter to send, Shift+Enter for new line)`}
          className="w-full text-xs sm:text-sm bg-transparent border-0 resize-none focus:outline-none text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
        />

        <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-subtle)]">
          <span className="text-[11px] text-[var(--color-text-muted)] font-mono">
            Grounded on commit <code className="font-bold text-[var(--color-brand-primary)]">{shortSha}</code>
          </span>

          <Button
            size="sm"
            onClick={() => handleSend()}
            disabled={!input.trim() || isSending}
            rightIcon={<Send className="w-3 h-3" />}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};
