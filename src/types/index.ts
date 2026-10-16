export type ThemeMode = 'light' | 'dark' | 'system';
export type UserMode = 'beginner' | 'enterprise';

export type EvidenceStatus = 
  | 'verified' 
  | 'inferred' 
  | 'unknown' 
  | 'failed' 
  | 'not-tested' 
  | 'partial';

export interface Evidence {
  id: string;
  claim: string;
  status: EvidenceStatus;
  sourcePath: string;
  lineNumber?: string | number;
  explanation: string;
  revision: string;
  limitations?: string;
  detectedAt?: string;
}

export interface AnalysisStage {
  id: string;
  title: string;
  status: 'completed' | 'in-progress' | 'warning' | 'pending' | 'failed';
  summary: string;
  evidenceCount: number;
}

export interface LanguageStat {
  name: string;
  bytes: number;
  percentage: number;
  color?: string;
}

export interface RepoContributor {
  login: string;
  avatarUrl: string;
  contributions: number;
  profileUrl: string;
}

export interface RepoCommit {
  sha: string;
  message: string;
  author: string;
  avatarUrl?: string;
  date: string;
  url?: string;
}

export interface RepoHealthMetric {
  name: string;
  score: number;
  max: number;
  status: 'good' | 'warning' | 'needs-attention';
  description: string;
}

export interface RepoHealthScore {
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  metrics: RepoHealthMetric[];
}

export interface CodebaseScaleStats {
  totalFiles: number;
  totalDirectories: number;
  estimatedLoc: number;
  averageFileDepth: number;
  openPullRequestsCount: number;
  daysSinceLastCommit: number;
}

export interface RepositoryMetadata {
  id: string;
  owner: string;
  name: string;
  fullName: string;
  url: string;
  description: string;
  defaultBranch: string;
  commitSha: string;
  primaryLanguage: string;
  license: string;
  licenseSpdxId?: string;
  stars: number;
  forks: number;
  watchersCount: number;
  openIssuesCount: number;
  sizeKb: number;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  analyzedAt: string;
  analysisStatus: 'idle' | 'analyzing' | 'completed' | 'partial_failure' | 'failed';
  stages: AnalysisStage[];
  tags: string[];
  languages: LanguageStat[];
  latestRelease?: {
    tagName: string;
    name: string;
    publishedAt: string;
  };
  latestCommit?: {
    sha: string;
    message: string;
    author: string;
    date: string;
  };
  hasWiki: boolean;
  hasDiscussions: boolean;
  isArchived: boolean;
  ciWorkflowsDetected: string[];
  manifestType: string;
  contributors?: RepoContributor[];
  recentCommits?: RepoCommit[];
  healthScore?: RepoHealthScore;
  codebaseStats?: CodebaseScaleStats;
  isSampleData?: boolean;
}

export interface TechStackItem {
  name: string;
  category: 'runtime' | 'framework' | 'database' | 'testing' | 'tooling' | 'styling';
  version?: string;
  evidence: Evidence;
  verifiedIn: string;
}

export interface DirectoryInfo {
  path: string;
  role: string;
  fileCount: number;
  primaryLanguage: string;
  isEntryPoint?: boolean;
}

export interface ArchitectureComponent {
  id: string;
  name: string;
  type: 'presentation' | 'service' | 'data' | 'routing' | 'infrastructure' | 'core';
  description: string;
  entryFiles: string[];
  evidence: Evidence;
  dependencies: string[];
}

export interface ReadingPathStep {
  step: number;
  path: string;
  title: string;
  purpose: string;
  keyConcepts: string[];
  estimatedMinutes: number;
}

export interface ProjectOverviewData {
  purpose: string;
  targetAudience: string;
  coreWorkflows: string[];
  techStack: TechStackItem[];
  keyDirectories: DirectoryInfo[];
  entryPoints: { path: string; purpose: string; evidence: Evidence }[];
  architectureComponents: ArchitectureComponent[];
  readingPath: ReadingPathStep[];
}

export interface SetupPrerequisite {
  name: string;
  versionRequirement: string;
  status: EvidenceStatus;
  detectedIn: string;
  installCommand?: string;
  notes?: string;
  evidence: Evidence;
}

export interface SetupCommand {
  command: string;
  purpose: string;
  source: 'documentation' | 'configuration' | 'inferred';
  status: 'verified' | 'untested' | 'mismatch' | 'failed';
  executionEnvironment?: string;
  notes?: string;
  evidence: Evidence;
}

export interface EnvironmentVariable {
  key: string;
  required: boolean;
  purpose: string;
  detectedIn: string;
  exampleValue?: string;
  isSecret: boolean;
  evidence: Evidence;
}

export interface DocumentationInconsistency {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high';
  docStatement: string;
  docSource: string;
  configReality: string;
  configSource: string;
  recommendation: string;
  evidence: Evidence;
}

export interface SetupDoctorData {
  prerequisites: SetupPrerequisite[];
  installCommands: SetupCommand[];
  testCommands: SetupCommand[];
  runCommands: SetupCommand[];
  envVars: EnvironmentVariable[];
  inconsistencies: DocumentationInconsistency[];
  executionDisclaimer: string;
}

export interface RecommendedIssue {
  id: string;
  number: number;
  title: string;
  url: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  labels: string[];
  requiredKnowledge: string[];
  matchReason: string;
  relevantFiles: { path: string; role: string; evidence: Evidence }[];
  relevantTests: { path: string; role: string; evidence: Evidence }[];
  assignedTo?: string;
  status: 'open' | 'closed';
  uncertaintyNotes?: string;
  commentsCount?: number;
  createdAt?: string;
  author?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  evidenceReferences?: Evidence[];
  suggestedFollowUps?: string[];
  tokensUsed?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface CodebaseNode {
  id: string;
  name: string;
  path: string;
  group: 'core' | 'service' | 'ui' | 'util' | 'config';
  loc: number;
  description: string;
  exports: string[];
  importsCount: number;
  importedByCount: number;
  x?: number;
  y?: number;
  status?: 'stable' | 'active' | 'legacy';
  layer?: number; // 0: Entry/UI, 1: Controllers/Services, 2: Core/Domain, 3: Engine/Data, 4: Utils/Config
  complexityScore?: number; // 1-100
  language?: string;
  isEntryPoint?: boolean;
}

export interface CodebaseEdge {
  id: string;
  source: string;
  target: string;
  type: 'imports' | 'implements' | 'configures' | 'calls' | 'renders';
  evidence: Evidence;
  label?: string;
  strength?: number;
}

export interface CodebaseGraphData {
  nodes: CodebaseNode[];
  edges: CodebaseEdge[];
}
