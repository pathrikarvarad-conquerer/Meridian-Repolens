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
  FileCode
} from 'lucide-react';
import { useRepo } from '../context/RepoContext';
import { useEvidenceDrawer } from '../context/EvidenceDrawerContext';
import { useToast } from '../context/ToastContext';
import { repoLensApi } from '../services/api';
import { ChatMessage, Evidence } from '../types';
import { EvidenceBadge } from '../components/primitives/EvidenceBadge';
import { Button } from '../components/primitives/Button';

export const AssistantPage: React.FC = () => {
  const { currentRepo, overview, setupDoctor, chatMessages, addChatMessage, clearChat } = useRepo();
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
        chatMessages
      );

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: assistantResult.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        evidenceReferences: assistantResult.evidence,
        suggestedFollowUps: assistantResult.suggestedFollowUps
      };

      addChatMessage(assistantMsg);
      setDraft(''); // Clear draft on success
    } catch (err: any) {
      setError(err?.message || 'Failed to generate response. Your prompt draft was preserved.');
      // Restore draft to input so user never loses their writing
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

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-4xl mx-auto space-y-4">
      {/* Top Context Banner */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs text-xs">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            Repository Assistant
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">·</span>
          <span className="font-mono text-neutral-600 dark:text-neutral-400">
            {currentRepo?.fullName}
          </span>
          <span className="hidden sm:inline text-neutral-400 font-mono text-[11px]">
            ({shortSha})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Chat</span>
          </button>
        </div>
      </div>

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
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-xl p-4 text-xs space-y-3 ${
                  isUser
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                    : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                  {msg.content}
                </div>

                {/* Evidence References in Assistant Messages */}
                {msg.evidenceReferences && msg.evidenceReferences.length > 0 && (
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-1.5">
                    <span className="text-[10px] uppercase font-semibold text-neutral-400 block tracking-wider">
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
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-1.5">
                    <span className="text-[10px] uppercase font-semibold text-neutral-400 block tracking-wider">
                      Suggested Follow-Ups:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedFollowUps.map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => handleSend(prompt)}
                          className="text-[11px] px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer text-left"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-[10px] text-neutral-400 text-right">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 text-xs text-neutral-500 shadow-2xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
              <span className="text-neutral-400 ml-1">Consulting repository static evidence...</span>
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
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 shadow-2xs">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder={`Ask about architecture, setup commands, or issue investigation in ${currentRepo?.name}... (Enter to send, Shift+Enter for new line)`}
          className="w-full text-xs sm:text-sm bg-transparent border-0 resize-none focus:outline-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
        />

        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <span className="text-[11px] text-neutral-400">
            Grounded on commit <code className="font-mono">{shortSha}</code>
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
