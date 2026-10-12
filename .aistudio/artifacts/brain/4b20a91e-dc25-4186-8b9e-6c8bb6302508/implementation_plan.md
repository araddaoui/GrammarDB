# Across-the-Board Layer 1 Conditional Harmonization

Comprehensive architectural plan to overhaul Layer 1 deterministic conditional transformations, fix engine replacement evaluation issues, and systematically harmonize protasis-apodosis structures across all conditional types.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed during Phase 1 clarification:
> - **Modal Auxiliary Selection**: Apodosis modal auxiliaries for past counterfactual conditions will be determined dynamically by temporal markers (e.g. `today`, `now` -> `would [verb]`; completed past outcomes -> `would have [verb-ed]`).
> - **Execution Architecture**: Layer 1 will use a dedicated **Systematic Clause Analysis with Apodosis Modal Harmonization** subsystem rather than fragile standalone regex lookbehinds.
> - **Matrix Scope**: Complete conditional matrix coverage across all types (Zero, First, Second, Third, Mixed, and Inverted).

- **Confirmed Decision 1**: Apodosis modal auxiliary transforms to `would + base` when present time markers (`today`, `now`, `currently`) are detected with a past condition (`had + past participle`), and `would have + past participle` for purely past counterfactuals.
- **Confirmed Decision 2**: Systematic clause segmentation analyzing protasis and apodosis relationships in both standard (`If [P], [Q]`) and inverted/reverse orders (`[Q] if [P]`, `Had [S] [V]...`).
- **Confirmed Decision 3**: Fix the regex replacement offset/evaluation bug in `src/engine/engine.ts` where lookbehinds caused candidate replacements to fail re-evaluation against matched slices.

---

### 1. Overview & Core Concept

- **What It Does**: IdiomOptima's Layer 1 deterministic engine will reliably parse and harmonize complex conditional sentences across all permutations without requiring case-by-case patches. When an antecedent (protasis) establishes a counterfactual or hypothetical condition, the consequent (apodosis) is automatically brought into grammatical harmony.
- **Target Persona & Context**: Writers, ESL learners, academic authors, and professionals needing deterministic, explainable grammar correction where conditional logic and tense agreement must be ironclad.
- **Key Value**: Deterministic accuracy, zero regression, and complete coverage of multi-clause conditionals with accurate pedagogical rationale and confidence scores.

---

### 2. User Experience & Visual Design

- **Key User Flow**:
  1. User enters text containing misaligned conditionals (e.g., *"If the government had invested more money in renewable energy last year, pollution levels will drop significantly today."*).
  2. The analyzer runs in real-time or upon click, identifying the clause structure across the sentence boundary.
  3. The correction card displays the identified conditional category (*Mixed Conditional (Past Condition -> Present Consequence)*), highlights `will drop`, and proposes `would drop`.
  4. Auto-apply updates the text cleanly with highlighted diff and detailed linguistic explanation.
- **Visual Presentation**:
  - Distinct badge for **Conditional Harmonization (Layer 1)**.
  - Clear rationale showing protasis trigger (*"had invested ... last year"*) and temporal anchor (*"today"*).
  - One-click accept/reject and full undo/redo support.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dedicated Conditional Clause Analyzer vs. Complex Regexes**
  - *Chosen Approach*: Implement a dedicated `analyzeConditionals` pipeline in `src/engine/conditionals.ts` paired with updated declarative rules in `src/engine/rules.ts`.
  - *Why*: Regex lookbehinds in JavaScript cannot easily span arbitrary clause lengths with punctuation and nested modifiers, leading to brittle matches or silent failures. A clause-aware analyzer tokenizes clauses, detects temporal anchors, and accurately identifies the exact token span of the auxiliary verb.
  - *Alternatives Considered*: Writing dozens of individual regexes with variable lookbehinds. Rejected due to maintainability issues and catastrophic backtracking risks.

- **Decision 2: Fixing Engine Match Replacement Evaluation**
  - *Chosen Approach*: Update `src/engine/engine.ts` so that rules with lookbehinds or complex match contexts don't rely on `original.replace(new RegExp(rule.match.pattern), rule.replacement)`. Instead, calculate replacement strings using the full sentence context or direct substitution templates.
  - *Why*: In `engine.ts`, `original` was only the substring matched by the outer regex slice (`match[0]`), stripping the prefix matched by lookbehind assertions and causing `original === replacementStr` checks to drop valid corrections.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        IDIOMOPTIMA ENGINE (L1)                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌──────────────────────────────┐          ┌──────────────────────────────┐
│  Clause & Sentence Analyzer  │          │   Conditional Matrix Core    │
│  - Sentence Boundary Detect  │          │  - Protasis Tense Detector   │
│  - Subordinate Clause Split  │─────────▶│  - Temporal Marker Analyzer  │
│  - Protasis/Apodosis Order   │          │  - Apodosis Modal Harmonizer │
└──────────────────────────────┘          └──────────────┬───────────────┘
                                                         │
                                                         ▼
                                          ┌──────────────────────────────┐
                                          │   Candidate Generation       │
                                          │  - Exact Character Offsets   │
                                          │  - Linguistic Rationale      │
                                          │  - Confidence: 0.96 - 0.99   │
                                          └──────────────┬───────────────┘
                                                         │
                                                         ▼
                                          ┌──────────────────────────────┐
                                          │   Engine Execution Loop      │
                                          │  - Conflict Resolution       │
                                          │  - Oscillation Guard         │
                                          │  - Text Patch Application    │
                                          └──────────────────────────────┘
```

#### Conditional Matrix Rules

| Protasis (Condition) | Apodosis Markers | Harmonized Apodosis | Classification | Example Transform |
| :--- | :--- | :--- | :--- | :--- |
| `had + V3` (Past Perfect) | `today`, `now`, `currently` | `would + base` | Mixed (Past -> Present) | `will drop` ➔ `would drop` |
| `had + V3` (Past Perfect) | (General / Past) | `would have + V3` | Third Conditional | `will arrive` ➔ `would have arrived` |
| `were` / `V-ed` (Past Simple) | Any | `would + base` | Second Conditional | `will sign` ➔ `would sign` |
| `V-present` (Present Simple) | Future | `will + base` | First Conditional | Protected against incorrect changes |
| `Had [subject] [V3]` (Inversion) | `today`, `now` | `would + base` | Inverted Mixed | `will be` ➔ `would be` |
| Reverse Order: `[Q] if [P]` | Matching above | Matching above | Clause Inversion | Handled symmetrically |

#### Engine Patch Details
1. **`src/engine/engine.ts`**:
   - Ensure `rule.replacement` string evaluation executes against the whole clause or uses capture groups directly instead of re-running the lookbehind regex against the isolated match slice.
   - Integrate `analyzeConditionals` into the Layer 1 deterministic pass.
2. **`src/engine/conditionals.ts`**:
   - Comprehensive conditional harmonization module that handles all permutations, punctuation variations, modal auxiliaries (`will`, `can`, `shall`, `may`), and irregular verbs.
3. **`src/engine/rules.ts` & `src/rules/grammarRules.ts`**:
   - Enhance declarative conditional rules with robust capture groups and explicit replacement templates.
4. **Automated Verification**:
   - Run automated test scripts covering the user's sentence, inverted sentences, reverse clause order, and all conditional types.
