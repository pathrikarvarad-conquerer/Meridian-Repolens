# Chatbot Intelligence & Response Diversification Plan

## Problem Diagnosis
The chatbot was returning the exact same response ("Architecture & Project Overview: facebook/react") for queries like `"What is today date"` due to two critical issues:
1. **Brittle Substring Match:** Both `server.ts` and `src/services/api.ts` used `if (q.includes('what is') || ...) { return architectureOverview; }`. This erroneously mapped any question starting with "What is..." (including dates, definitions, general questions) into the static Architecture Overview template.
2. **Fallback Cascading:** Substring checks for `read`, `how to`, `test`, and `scale` similarly collapsed hundreds of different questions into just 4 or 5 static templates whenever Gemini failed over to local reasoning.
3. **Missing Temporal & General Query Awareness:** Neither Gemini's system prompt nor the local fallback engine had current date/time context or conversational handlers to distinguish general queries from repository-specific technical questions.

---

## Proposed Changes

### 1. Server-Side AI Copilot (`server.ts`)
- **System Prompt & Temporal Grounding:**
  - Inject the live environment date/time (e.g., `Current Date & Time: 2026-10-16`) into Gemini's system instructions.
  - Clarify the copilot's dual role: expert repository architect for codebase queries, and helpful, direct conversationalist for general programming, date/time, and general inquiries.
- **Model Configuration:**
  - Ensure `gemini-3.8-flash` is configured with optimal temperature (0.3) for natural variation and strict grounding.
  - Capture real token usage metadata (`promptTokenCount`, `candidatesTokenCount`, `totalTokenCount`) on every response.

### 2. Intelligent Dynamic Intent Parser (`server.ts` & `src/services/api.ts`)
- **Eliminate Brittle Substring Matching:**
  - Remove broad substring triggers like `q.includes('what is')`, `q.includes('read')`, and `q.includes('path')`.
  - Replace with bounded regexes and semantic intent detection:
    - **General Conversation / Temporal:** Date, time, greetings, assistant identity, general programming concepts.
    - **Issue Resolution:** Exact issue identifiers (`#\d+` or `issue \d+`) with dedicated reproduction tests and patches.
    - **Setup & Environment:** Specific queries requesting installation, prerequisites, or run commands.
    - **Testing & Verification:** Dedicated test execution queries referencing verified npm/make/cargo scripts.
    - **Architecture & Modules:** Specific architectural queries referencing directory paths, entry points, or components.
    - **Codebase Scale & Contributors:** Specific statistics queries referencing LOC, health scores, or commit history.
- **Dynamic Answer Synthesis:**
  - Generate bespoke, query-specific answers for unknown or mixed queries rather than defaulting to the architecture overview.
  - Return context-appropriate follow-up questions tailored to the specific query topic.

### 3. Assistant UI & Verification Feedback (`src/pages/AssistantPage.tsx`)
- Ensure responses render clear markdown with code highlighting.
- Maintain transparent token usage badges (`totalTokens`, `promptTokens`, `completionTokens`) on all responses.
- Verify quick prompts and custom prompts yield unique, non-repetitive answers.

---

## Verification Plan

### Automated Build & Syntax Verification
- Run `compile_applet` to ensure zero compilation or TypeScript errors.

### Manual Intent & Query Testing
1. **General / Date Query:**
   - Prompt: `"What is today date"`
   - Expected Result: Accurately states current date (`October 16, 2026`) and conversational greeting; **no** architecture dump.
2. **General Programming Query:**
   - Prompt: `"What is a debounce function and how does it work?"`
   - Expected Result: Explains debouncing with clear code examples.
3. **Repository Architecture Query:**
   - Prompt: `"Explain the architecture of this repository"`
   - Expected Result: Provides the structured breakdown of the analyzed repository.
4. **Issue Query:**
   - Prompt: `"How do I fix issue #12?"`
   - Expected Result: Provides reproduction test and patch for the specific issue.
5. **Token Metric Verification:**
   - Confirm token counter updates accurately on both the header banner and the individual message footer.
