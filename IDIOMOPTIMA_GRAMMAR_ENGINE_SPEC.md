# IdiomOptima Linguistic Machinery
## Engineering specification and implementation handoff
Version 0.1.0 — 9 October 2026

## 1. Purpose and boundaries

Build a deterministic-first English correction subsystem for IdiomOptima. It should correct only errors supported by explicit, testable rules; preserve authorial meaning and voice; and defer ambiguous or semantic decisions to the existing AI layer. The objective is not to claim that a finite database contains all English grammar. The objective is to make high-confidence, repeatable corrections locally and cheaply, then measure where the deterministic system succeeds or fails.

This package is a starter engine specification, seed rule database, exception/guard database, and regression suite. It is not a production-ready parser and does not claim a measured coverage percentage. Runtime integration requires the existing Worker code and must be tested against it before deployment.

## 2. Design principles

1. **Conservative correction:** no automatic edit unless a rule has sufficient evidence and confidence.
2. **Meaning preservation:** avoid changing tense, modality, agency, negation, scope, or technical terminology without strong local evidence.
3. **Traceability:** every proposed edit carries a rule ID, matched text, replacement, rationale, confidence, and source span.
4. **Deterministic before generative:** use deterministic rules for narrow, repeatable errors; use the AI layer for ambiguity, discourse, semantics, and style.
5. **No silent cascades:** edits are applied in priority order, re-tokenized/re-evaluated when needed, and conflicts are logged.
6. **Protected text stays protected:** do not edit URLs, email addresses, code, citation keys, reference entries, quoted material if configured as immutable, footnotes/endnotes, superscripts, equations, or user-marked locked spans.
7. **Dialect-aware:** do not treat legitimate US/UK/other English variants as errors. Respect configured variety and style settings.
8. **Evidence before expansion:** add rules from observed errors, verified editorial judgments, or documented grammar facts—not from plausible-sounding examples alone.
9. **Reversible changes:** retain original text and provide a diff/undo path.
10. **Privacy by default:** do not retain user text for rule mining unless the user has clearly consented and the product's privacy terms permit it.

## 3. Processing pipeline

`protected-span scan → sentence segmentation → tokenization → lightweight morphology/POS/chunking → rule matching → exception/guard checks → candidate scoring → conflict resolution → conservative application → diff/provenance → optional AI escalation`

### 3.1 Required runtime interfaces

- `ProtectedSpan`: `{ start: number, end: number, kind: string }`
- `Token`: `{ text: string, start: number, end: number, lower: string, pos?: string, lemma?: string, features?: Record<string,string> }`
- `CorrectionCandidate`: `{ ruleId: string, start: number, end: number, original: string, replacement: string, confidence: number, category: string, rationale: string, requiresContext?: boolean }`
- `Rule`: `{ id, category, severity, priority, pattern, replacement, confidence, rationale, guards?, examples?, enabled }`

Do not require a heavyweight dependency at first. But do not pretend raw string replacement is a parser. A first implementation can use a tokenizer plus narrow local patterns; rules needing subject/object relations, clause boundaries, or long-distance agreement must declare that dependency and remain disabled until the required analyser exists.

### 3.2 Candidate policy

- `confidence >= 0.98`: eligible for automatic application only if the rule is explicitly marked `autoApply: true`, no guard fires, and no conflict exists.
- `0.90–0.979`: present as a suggested edit or send to AI review; do not silently apply.
- `< 0.90`: diagnostic/escalation only.
- These thresholds are initial engineering defaults, not empirically validated values. Tune them on annotated data.
- Never auto-apply overlapping candidates unless a documented rule precedence resolves the conflict.
- Never apply a rule whose match crosses a protected span.
- If an edit changes token boundaries, re-run local matching in the affected sentence; cap iterations to prevent loops and log each pass.

## 4. Error ontology

Use stable, machine-readable categories:
- `AGR`: subject–verb agreement
- `ART`: articles and determiners
- `NUM`: countability and number
- `TNS`: tense/aspect consistency
- `PREP`: prepositions and complementation
- `PRON`: pronouns and reference
- `WORD`: word form / derivation
- `COLL`: collocation and lexical selection
- `CLAUSE`: clause structure and subordination
- `PUN`: punctuation and spacing
- `SPELL`: spelling and typographical errors
- `L1-AR`: possible Arabic-transfer pattern
- `L1-FR`: possible French-transfer pattern
- `STYLE`: register, idiomaticity, and voice (not grammar correctness)
- `PROTECT`: immutable or excluded spans

An L1 label is a hypothesis about a recurring pattern, not an identity inference. Apply it only when a user explicitly selects the relevant learner-support mode or the text's error pattern itself is enough to justify the rule. Never infer a user's ethnicity or native language.

## 5. Rule authoring contract

Every rule must include:
- `id`, `category`, `description`
- `match` expressed as a narrow, documented pattern
- `replacement` or a structured edit operation
- `confidence`, `priority`, `autoApply`
- `guards` for known false-positive conditions
- positive and negative examples
- test cases and a provenance note
- `requires` listing tokenizer/POS/chunker/parser capabilities
- `enabled` status

A rule is not ready for auto-application if it lacks negative examples. Pattern-based rules must use token boundaries and context; avoid global replacement of substrings such as `is`, `in`, `a`, or `the`.

## 6. Initial conservative rule families

### A. Safe mechanics
- repeated whitespace (outside protected spans)
- space before punctuation in standard prose
- missing space after punctuation when unambiguous
- duplicate adjacent word only when exact, adjacent, and not an intentional rhetorical repetition
- obvious doubled punctuation only where the selected style disallows it

### B. Agreement and form
- subject–verb agreement only when subject is reliably identified
- determiner/article corrections only for high-certainty local constructions
- singular/plural and countability only when lexical entry and syntactic context agree
- word-form corrections only where the intended lemma is strongly constrained

### C. Prepositions and collocations
- store candidate corrections as contextual patterns, not one-to-one global substitutions
- represent variants and regional acceptability
- never replace a preposition solely because one alternative is more frequent

### D. L1-informed patterns
- Arabic- and French-transfer rules may be added as opt-in support, grounded in observed learner data
- L1 labels do not automatically authorize a correction
- do not encode broad stereotypes such as “Arabic speakers always omit articles”

## 7. Exceptions and guards

Exception logic is first-class and checked before applying an edit. Guard examples:
- proper names, product names, abbreviations, quotations, and technical terms
- titles/headings and list fragments
- code, URLs, email addresses, citations, references, equations
- US/UK variants
- deliberate rhetorical fragments, dialogue, poetry, and creative writing
- domain-specific terminology and user-defined vocabulary
- modal, negation, tense, and conditional constructions
- parallel structures and coordinated subjects
- cases where two or more interpretations remain plausible

An exception should be specific enough not to suppress unrelated valid corrections. Store exceptions as data and version them alongside rules.

## 8. Measurement

Do not report “percent of grammar fixed” without a defined dataset and denominator. Track at least:
- **Precision:** true corrections / all applied corrections
- **Recall on annotated errors:** detected target errors / all annotated target errors
- **False-positive rate:** valid spans incorrectly changed / valid spans examined (define sampling method)
- **Auto-safe rate:** share of candidate corrections eligible for silent application
- **Escalation rate:** share sent to AI or user review
- **Regression rate:** previously passing tests broken by a change
- **Cost per 1,000 words:** deterministic runtime cost and AI fallback cost
- **Latency:** median and p95 per document

Build an evaluation set stratified by genre (academic, professional, creative, ESL learner text), proficiency, dialect, and error family. Include clean control texts so that “no change” is tested as a success.

## 9. Feedback loop

1. AI or user proposes a correction.
2. A reviewer validates that it is genuinely an error and that the correction preserves meaning.
3. The example is anonymized or used under appropriate consent.
4. A linguist/editor labels error category, context, correct alternatives, dialect, confidence, and false-positive risks.
5. A candidate rule is drafted with positive and negative examples.
6. The rule runs against the entire regression suite.
7. False positives are reviewed before enabling.
8. Deploy with versioned rollback and monitor metrics.

Do not automatically convert every AI output into a rule. AI outputs can be stylistic preferences, context-dependent choices, or outright errors.

## 10. Integration stages

**Stage 0 — Inventory:** inspect current Worker/API flow, current lexical databases, protection logic, scoring, Gemini calls, and UI expectations. No code changes.

**Stage 1 — Shadow mode:** run rules without modifying output; log candidate counts and compare to the current AI output on consented/approved test data.

**Stage 2 — Suggestion mode:** show deterministic edits with explanations and accept/reject controls.

**Stage 3 — Narrow auto-apply:** enable only rules with demonstrated precision on the evaluation set.

**Stage 4 — Cost-aware AI fallback:** batch only unresolved spans or sentences where feasible; do not send whole documents by default if the existing architecture can safely isolate uncertain passages.

**Stage 5 — Continuous evaluation:** rule versioning, regression testing, rollback, and monitoring.

## 11. Non-goals

- Replacing a full syntactic parser with regexes.
- Guaranteeing correctness for all possible English sentences.
- Automatically “humanizing” text through grammar rules.
- Rewriting authorial voice or academic argument.
- Claiming an accuracy/coverage percentage before evaluation.
- Learning from private user text without consent.
