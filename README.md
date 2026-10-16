# RepoLens — Frontend

> **Understand your codebase, faster.**  
> Intelligent repository analysis, setup doctor, issue discovery, codebase intelligence, and onboarding guide export with verified evidence traceability.

---

## 1. Quick Start

### Prerequisites
- Node.js `>= 20.0.0`
- npm `>= 10.0.0` or pnpm `>= 9.0.0`

### Installation
```bash
npm install
```

### Development Server
Runs Vite development server on port 3000:
```bash
npm run dev
```

### Production Build
Typechecks with TypeScript and compiles production bundles with Vite:
```bash
npm run build
```

### Type Checking & Linting
```bash
npm run lint
```

---

## 2. Architecture & Design System

RepoLens is built according to the **RepoLens Frontend UI Master Bible** and universal design principles:

- **Design Tokens**: Semantic tokens defined in `src/index.css` supporting **Light**, **Dark**, and **System** themes with zero-flash persistence.
- **Evidence & Verification System**:
  - `Verified`: Source file and line reference validated against repository AST.
  - `Inferred`: Derived from package dependencies and script wrappers.
  - `Not Tested`: Documented in manifest but not executed locally (strict static analysis honesty).
  - `Unknown`, `Failed`, `Partial`: Graceful state representation.
- **Dual User Personas**:
  - **Beginner Mode**: Plain-language explanations, guided 5-step reading paths, step-by-step setup guides, and first-time contribution issues.
  - **Enterprise Mode**: Commit SHA & revision badges, evidence traceability matrices, dependency security & license analysis, configuration inconsistency audits.
- **Application Shell**:
  - Reusable top bar with active repository switcher, branch and commit indicators, ⌘K search bar, mode toggle, and theme menu.
  - Collapsible sidebar with navigation routes.
  - Slide-over **Evidence Inspector Drawer** displaying source paths, line numbers, commit revisions, detection rationale, and verification scope limitations.
  - Accessible **Toast Notification System** for live user feedback.

---

## 3. Implemented Routes & Capabilities

| Route | View | Description |
| :--- | :--- | :--- |
| `/` | **Home / Landing Dashboard** | Prominent GitHub repository URL input with real-time validation, featured open-source samples (`facebook/react`, `tailwindlabs/tailwindcss`), recent history, and capabilities summary. |
| `/overview` | **Project Overview** | Purpose, core runtime workflows, tech stack with evidence links, important directories, entry points, architecture components, and 5-step recommended reading path. |
| `/setup` | **Setup Doctor** | Environment prerequisites, documented install and test commands with copy affordances, safe environment variables audit (no secrets), and README vs manifest inconsistency detection. |
| `/issues` | **Recommended Issues** | Curated issues based on modular isolation, difficulty filtering (Beginner, Intermediate, Advanced), matching rationale, mapped files & tests, and "Investigate with AI" action. |
| `/assistant` | **Repository AI Assistant** | Grounded contextual assistant calibrated to the active repository & commit SHA, suggested follow-ups, verified source citations, and draft preservation on failure. |
| `/graph` | **Codebase Graph** | Interactive module relationship explorer with layer filters (`core`, `service`, `ui`, `util`), relationship legend, selected node inspector, and accessible **Textual Alternative** view. |
| `/export` | **Export Onboarding Guide** | Formatted preview and raw markdown view with zero secrets policy, table of contents, and one-click working download of `ONBOARDING.md`. |
| `/settings` | **Settings & Preferences** | Light / Dark / System theme switcher, Beginner vs Enterprise mode toggle, analysis engine verification status, and cache management. |

---

## 4. Verification & Testing

- ✅ **Build verification**: `npm run build` succeeds cleanly.
- ✅ **TypeScript check**: `npm run lint` (`tsc --noEmit`) passes with zero errors.
- ✅ **Theme Switching**: Tested across Light, Dark, and System modes.
- ✅ **Static Analysis Honesty**: Commands and claims are explicitly labeled as static analysis; arbitrary remote code execution is never simulated.
