# RepoLens: Tier 1 Stabilization, Multi-Provider Copilot & Repo Reels

RepoLens transforms complex open-source repositories into transparent, verifiable onboarding experiences for developers. This plan details the emergency stabilization of live analysis data integrity, root-cause resolution of repetitive chatbot responses with multi-provider routing (Gemini + Ollama adapter), sandbox safety guarantees, and the introduction of Repo Reels.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed during Phase 1 clarification:
> - **Phase Prioritization**: Full Tier 1 stabilization first, followed immediately by Repo Reels and Tier 2 onboarding features.
> - **AI Provider Strategy**: Server-side Gemini (`@google/genai`) as the primary intelligence engine, backed by a local Ollama adapter and grounded semantic intent engine to guarantee zero downtime and eliminate repetitive canned fallbacks.
> - **Execution Boundary**: Arbitrary repository code execution is strictly prohibited; all claims, commands, and dependency graphs rely strictly on verified static analysis and authenticated manifest parsing.

- **Confirmed Decision 1 (Repetitive Chatbot Fix)**: Remove naive substring pattern triggers (`q.includes('what is')`) in `server.ts` and `api.ts`. Inject temporal context (current date/time), conversational intent detection, and dynamic token usage telemetry.
- **Confirmed Decision 2 (Evidence Integrity)**: Live analysis will never fabricate commit SHAs, file paths, issue numbers, or test results. Findings strictly use three claim states: `Verified`, `Inferred`, or `Unknown`.
- **Confirmed Decision 3 (Repo Reels)**: Interactive, slide-and-code walkthrough module that breaks complex architectural journeys into bite-sized visual chapters with pinned source links.

---

### 1. Overview & Core Concept

- **What It Does**: RepoLens ingests public GitHub repositories, validates permissions, pins analysis to a deterministic full commit SHA, parses dependency manifests and AST-level directory trees, and generates an interactive architectural map, setup guide, contribution pipeline, and grounded AI assistant.
- **Target Audience / Persona**: Open-source contributors, engineering leads evaluating libraries, and developers seeking immediate local onboarding without wading through thousands of lines of code.
- **Key Value**: Replaces guesswork and stale documentation with reproducible, pinned evidence and an intelligent codebase assistant that never hallucinates facts or repeats generic responses.

---

### 2. User Experience & Visual Design

Following the **SaaS & Developer Console** visual guidelines (`references/3_saas_dashboard.md`), RepoLens delivers a high-density, utilitarian interface:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  REPOLENS  │  Overview   Codebase Graph   Issues   Assistant   Reels  │ ⟳ SHA│
├──────────────────────────────────────────────────────────────────────────────┤
│  ┌─ Active Target ────────────────────────────────────────────────────────┐  │
│  │ facebook/react · commit 7f3b89a · Node.js / Yarn Workspaces · 14.2k LOC │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│  ┌─ Main Workspace ───────────────────┐  ┌─ Verified Evidence Inspector ───┐ │
│  │ 01. Architecture & Core Flow        │  │ Status: Verified               │ │
│  │ Pinned Entry: packages/react/index │  │ Target: packages/react/index.js │ │
│  │                                    │  │ Line: L1-L45                   │ │
│  │ [ Launch Repo Reel ] [ Ask AI ]    │  │ Hash: 7f3b89a02...             │ │
│  └────────────────────────────────────┘  └────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Key User Flows**:
  1. *Repository Input & Goal Triage*: User inputs a valid GitHub URL; an optional 3-step modal lets the user select their goal (e.g., "First PR", "Architecture audit"), experience level, and reading focus.
  2. *Deterministic Analysis Pipeline*: The app resolves the default branch full SHA, pulls directory trees, locates manifests (`package.json`, `Cargo.toml`, `go.mod`), and extracts setup commands.
  3. *Assistant & Reels Hub*: Developer interacts with the AI Copilot with real-time token tracking (`prompt` · `completion` · `total`) and launches interactive Repo Reels for stepped code tours.
- **Visual Identity & Theme**:
  - *Palette*: Deep slate canvas (`#0B0F19`), structural neutral slate surfaces (`#111827`), hairline borders (`#1F2937`), and crisp cyan/blue accent (`#3B82F6`) for primary interactive targets.
  - *Anti-Slop Discipline*: Zero floating scoreboards, zero pill tags on static metadata (clean unboxed text with `·` separators), no decorative pulsating dots, and single-elevation cards.
  - *Typography*: Clean display typography (`Plus Jakarta Sans`) paired with tabular monospace numerals (`font-mono tabular-nums`) for commits, line numbers, and token counters.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual-Tier Multi-Provider AI Architecture**
  - *Chosen Approach*: Primary calls route through server-side Gemini (`@google/genai`). If unconfigured or rate-limited, the system seamlessly routes through a local Ollama adapter (`http://localhost:11434`), falling back finally to an enriched semantic synthesis engine.
  - *Why*: Guarantees high-fidelity reasoning when cloud connectivity exists while preserving zero-downtime offline operation without repeating identical templates.
  - *Alternatives Considered*: Pure cloud-only (fails without keys) or static mock fallback (caused the user's reported repetition bug).

- **Decision 2: Strict Tri-State Evidence Standard**
  - *Chosen Approach*: Findings must be tagged as `Verified` (exact file/line match in commit), `Inferred` (derived from heuristic or doc mention), or `Unknown` (unconfirmed).
  - *Why*: Builds developer trust. No fake PRs, fake test runs, or hallucinated issue `#142`.

- **Decision 3: Safe Static Analysis Sandbox**
  - *Chosen Approach*: Commands discovered in READMEs or manifests are categorized as `Documented` or `Detected statically`. Execution of arbitrary shell scripts is blocked by design in the web sandbox.
  - *Why*: Eliminates security vulnerabilities when analyzing untrusted open-source code.

- **Decision 4: Repo Reels Component**
  - *Chosen Approach*: A focused, step-by-step visual story view featuring 3–5 key architectural checkpoints per repository, accompanied by code highlights and narrative walkthroughs.
  - *Why*: Accelerates code comprehension 10x compared to reading raw directory hierarchies.

---

### 4. Technical Architecture & Data Strategy

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (React SPA)                              │
│  ┌─────────────────┐  ┌───────────────────┐  ┌────────────────────────────┐  │
│  │ RepoContext     │  │ AssistantPage     │  │ RepoReelsModal / Viewer    │  │
│  │ - Normalized SHA│  │ - Token Counter   │  │ - 4-Act Story Walkthrough  │  │
│  │ - AbortController  │ - Context Banner  │  │ - Pinned Code Highlights   │  │
│  └────────┬────────┘  └─────────┬─────────┘  └─────────────┬──────────────┘  │
└───────────┼─────────────────────┼──────────────────────────┼─────────────────┘
            │                     │                          │
            ▼                     ▼                          ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           SERVER (Express server.ts)                         │
│  ┌───────────────────────┐  ┌─────────────────┐  ┌────────────────────────┐  │
│  │ Rate Limiter & Guard  │  │ /api/chat Proxy │  │ /api/ollama Proxy      │  │
│  │ - IP Rate Limits      │  │ - Gemini 3.8    │  │ - Local Ollama Bridge  │  │
│  │ - Context Truncation  │  │ - Usage Tokens  │  │ - Stream & Fallback    │  │
│  └───────────────────────┘  └─────────────────┘  └────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Interactive State Mapping**:
  - `RepoContext`: Manages repository URL normalization, GitHub rate limit handling, active commit SHA pinning, and immediate request abort propagation via `AbortController`.
  - `AssistantState`: Handles prompt dispatch, conversational history, provider status (Gemini / Ollama / Semantic), and token aggregation.
  - `ReelPlaybackState`: Handles chapter navigation, code highlight ranges, and transition effects.
