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
  stars: number;
  forks: number;
  openIssuesCount: number;
  analyzedAt: string;
  analysisStatus: 'idle' | 'analyzing' | 'completed' | 'partial_failure' | 'failed';
  stages: AnalysisStage[];
  tags: string[];
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
  type: 'presentation' | 'service' | 'data' | 'routing' | 'infrastructure';
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
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  evidenceReferences?: Evidence[];
  suggestedFollowUps?: string[];
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
}

export interface CodebaseEdge {
  id: string;
  source: string;
  target: string;
  type: 'imports' | 'implements' | 'configures' | 'calls';
  evidence: Evidence;
}

export interface CodebaseGraphData {
  nodes: CodebaseNode[];
  edges: CodebaseEdge[];
}
