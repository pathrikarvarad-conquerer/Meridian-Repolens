import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  RepositoryMetadata,
  ProjectOverviewData,
  SetupDoctorData,
  RecommendedIssue,
  CodebaseGraphData,
  ChatMessage
} from '../types';
import { parseGitHubUrl, repoLensApi, AnalysisResponse } from '../services/api';
import { SAMPLE_REPOSITORIES } from '../services/mockData';

export interface RecentRepoItem {
  fullName: string;
  analyzedAt: string;
  stars: number;
  primaryLanguage: string;
}

interface RepoContextType {
  currentRepo: RepositoryMetadata | null;
  overview: ProjectOverviewData | null;
  setupDoctor: SetupDoctorData | null;
  issues: RecommendedIssue[];
  graph: CodebaseGraphData | null;
  recentRepos: RecentRepoItem[];
  isAnalyzing: boolean;
  analysisProgress: { stageIndex: number; stageTitle: string } | null;
  error: string | null;
  chatMessages: ChatMessage[];
  analyzeRepo: (input: string) => Promise<boolean>;
  loadSampleRepo: (fullName: string) => void;
  cancelAnalysis: () => void;
  addChatMessage: (msg: ChatMessage) => void;
  updateLastAssistantMessage: (content: string) => void;
  clearChat: () => void;
}

const RepoContext = createContext<RepoContextType | undefined>(undefined);

const RECENT_REPOS_KEY = 'repolens-recent-repos';

export const RepoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRepo, setCurrentRepo] = useState<RepositoryMetadata | null>(() => {
    // Default to 'facebook/react' for immediate rich preview
    const defaultData = SAMPLE_REPOSITORIES['facebook/react'];
    return defaultData ? defaultData.metadata : null;
  });

  const [overview, setOverview] = useState<ProjectOverviewData | null>(() => {
    const defaultData = SAMPLE_REPOSITORIES['facebook/react'];
    return defaultData ? defaultData.overview : null;
  });

  const [setupDoctor, setSetupDoctor] = useState<SetupDoctorData | null>(() => {
    const defaultData = SAMPLE_REPOSITORIES['facebook/react'];
    return defaultData ? defaultData.setupDoctor : null;
  });

  const [issues, setIssues] = useState<RecommendedIssue[]>(() => {
    const defaultData = SAMPLE_REPOSITORIES['facebook/react'];
    return defaultData ? defaultData.issues : [];
  });

  const [graph, setGraph] = useState<CodebaseGraphData | null>(() => {
    const defaultData = SAMPLE_REPOSITORIES['facebook/react'];
    return defaultData ? defaultData.graph : null;
  });

  const [recentRepos, setRecentRepos] = useState<RecentRepoItem[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_REPOS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return [
      { fullName: 'facebook/react', analyzedAt: '2026-10-15T20:30:00Z', stars: 228400, primaryLanguage: 'JavaScript' },
      { fullName: 'tailwindlabs/tailwindcss', analyzedAt: '2026-10-15T21:10:00Z', stars: 84300, primaryLanguage: 'TypeScript' }
    ];
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<{ stageIndex: number; stageTitle: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: 'Welcome to RepoLens Assistant. Ask me anything about the repository architecture, setup prerequisites, test commands, or recommended issues with full evidence references.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowUps: [
        'How do I set up this repository locally?',
        'Where are the main entry points?',
        'Which issue should I begin contributing to?'
      ]
    }
  ]);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Save recent repos to localStorage
  const saveRecentRepo = useCallback((meta: RepositoryMetadata) => {
    setRecentRepos((prev) => {
      const filtered = prev.filter((r) => r.fullName.toLowerCase() !== meta.fullName.toLowerCase());
      const updated: RecentRepoItem[] = [
        {
          fullName: meta.fullName,
          analyzedAt: new Date().toISOString(),
          stars: meta.stars,
          primaryLanguage: meta.primaryLanguage
        },
        ...filtered
      ].slice(0, 10);
      try {
        localStorage.setItem(RECENT_REPOS_KEY, JSON.stringify(updated));
      } catch {
        // Ignored
      }
      return updated;
    });
  }, []);

  const cancelAnalysis = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsAnalyzing(false);
    setAnalysisProgress(null);
  }, []);

  const applyAnalysisResponse = useCallback((res: AnalysisResponse) => {
    setCurrentRepo(res.metadata);
    setOverview(res.overview);
    setSetupDoctor(res.setupDoctor);
    setIssues(res.issues);
    setGraph(res.graph);
    saveRecentRepo(res.metadata);
    setError(null);
    setIsAnalyzing(false);
    setAnalysisProgress(null);

    // Reset chat with repository welcome message
    setChatMessages([
      {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `I am now calibrated to **${res.metadata.fullName}** (commit \`${res.metadata.commitSha.substring(0, 7)}\`). You can ask questions about the architecture, setup, or issues.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: [
          'What are the setup prerequisites?',
          'What is the recommended file reading path?',
          'What are the recommended first issues?'
        ]
      }
    ]);
  }, [saveRecentRepo]);

  const analyzeRepo = useCallback(async (input: string): Promise<boolean> => {
    setError(null);
    const parsed = parseGitHubUrl(input);
    if (!parsed.isValid || !parsed.owner || !parsed.repo) {
      setError(parsed.error || 'Invalid repository URL.');
      return false;
    }

    setIsAnalyzing(true);
    setAnalysisProgress({ stageIndex: 0, stageTitle: 'Initializing repository analyzer...' });

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await repoLensApi.analyzeRepository(
        {
          owner: parsed.owner,
          repo: parsed.repo,
          signal: controller.signal
        },
        (stageIndex, stageTitle) => {
          setAnalysisProgress({ stageIndex, stageTitle });
        }
      );

      applyAnalysisResponse(response);
      return true;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        setError('Analysis was stopped by the user.');
      } else {
        setError(err?.message || 'Failed to analyze repository. Please check the URL or try again.');
      }
      setIsAnalyzing(false);
      setAnalysisProgress(null);
      return false;
    }
  }, [applyAnalysisResponse]);

  const loadSampleRepo = useCallback((fullName: string) => {
    const key = fullName.toLowerCase();
    if (SAMPLE_REPOSITORIES[key]) {
      applyAnalysisResponse(SAMPLE_REPOSITORIES[key]);
    } else {
      const [owner, repo] = fullName.split('/');
      if (owner && repo) {
        analyzeRepo(fullName);
      }
    }
  }, [analyzeRepo, applyAnalysisResponse]);

  const addChatMessage = useCallback((msg: ChatMessage) => {
    setChatMessages((prev) => [...prev, msg]);
  }, []);

  const updateLastAssistantMessage = useCallback((content: string) => {
    setChatMessages((prev) => {
      const copy = [...prev];
      const lastIdx = copy.length - 1;
      if (lastIdx >= 0 && copy[lastIdx].role === 'assistant') {
        copy[lastIdx] = { ...copy[lastIdx], content };
      }
      return copy;
    });
  }, []);

  const clearChat = useCallback(() => {
    setChatMessages([
      {
        id: `msg-cleared-${Date.now()}`,
        role: 'assistant',
        content: `Chat history cleared. What would you like to investigate in **${currentRepo?.fullName || 'the repository'}**?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [currentRepo]);

  return (
    <RepoContext.Provider
      value={{
        currentRepo,
        overview,
        setupDoctor,
        issues,
        graph,
        recentRepos,
        isAnalyzing,
        analysisProgress,
        error,
        chatMessages,
        analyzeRepo,
        loadSampleRepo,
        cancelAnalysis,
        addChatMessage,
        updateLastAssistantMessage,
        clearChat
      }}
    >
      {children}
    </RepoContext.Provider>
  );
};

export const useRepo = () => {
  const context = useContext(RepoContext);
  if (!context) throw new Error('useRepo must be used within RepoProvider');
  return context;
};
