# Implementation prompt: integrate IdiomOptima linguistic machinery

You are modifying the existing IdiomOptima codebase. Preserve current behavior unless a change is explicitly authorized. Do not rewrite the app or replace the existing AI/humanization pipeline.

## Objective
Integrate a conservative, deterministic-first grammar subsystem into the existing Cloudflare Worker/API, using the supplied:
- `IDIOMOPTIMA_GRAMMAR_ENGINE_SPEC.md`
- `grammar_rules.json`
- `grammar_exceptions.json`
- `grammar_test_suite.json`

## Mandatory first step: inspect, do not edit
1. Map the current request path from UI to Worker to Gemini and back.
2. Identify current nativization/humanization databases, spelling/grammar logic, protection of citations/footnotes/superscripts/references, score generation, rate limits, and error handling.
3. Identify the exact runtime language/build system and current deployment constraints.
4. Report the relevant files/functions and a minimal patch plan. Do not edit files until the plan is reported and approved.

## Implementation constraints
- TypeScript/JavaScript compatible with the existing Cloudflare Worker.
- No new paid dependency. Do not add a package unless justified and approved.
- Never use global string replacement for grammatical words.
- Build a protected-span scan before rule matching. Reuse existing protection logic where reliable.
- Start with shadow mode: detect and log rule candidates without changing user-visible output.
- Only the mechanical punctuation/spacing rules may be enabled initially, and only after confirming they do not corrupt code, citations, reference formatting, footnotes, superscripts, URLs, or intentional spacing.
- Agreement, articles, prepositions, lexical frames, and L1-informed rules remain disabled until a suitable analyser/lexicon and evaluation data exist.
- Rules and exceptions must be loaded from versioned JSON. Validate schema on load and fail closed if malformed.
- Each candidate must include rule ID, source span, original, proposed replacement, confidence, category, and rationale.
- Apply conflict resolution: protected spans first; then guards; then priority; reject overlapping edits unless precedence is explicitly documented.
- Add a hard maximum number of edit passes and detect oscillation.
- Add unit tests for every rule, negative controls, protected text, Unicode, curly quotes, em dashes, and unchanged valid prose.
- Add a feature flag to disable the engine instantly without redeploying if existing configuration supports it; otherwise use a safe deploy-time flag.
- Preserve original text and existing original↔native/edit controls.
- Do not change scoring semantics or Gemini prompts as part of the first integration patch.
- Do not send whole documents to Gemini merely because one deterministic rule is uncertain. Use the current AI path unless a safe sentence/span-level fallback can be added without breaking context.
- Never retain raw user text for analytics/rule mining without appropriate consent and policy support.

## Evaluation and rollout
1. Run the regression suite and the existing test suite.
2. Test against clean control texts and annotated errors across academic, professional, creative, and learner genres.
3. Compare shadow candidates with current AI edits; report precision, recall where annotation exists, false positives, escalation rate, latency, and approximate AI-cost impact.
4. Do not claim a percentage of errors solved without a defined test corpus.
5. Enable suggestion mode before automatic corrections.
6. Auto-apply only rules with demonstrated precision on representative evaluation data.
7. Provide rollback instructions and a short change log.

## Deliverables
- A file-by-file implementation report before editing.
- Minimal patch set with no unrelated refactoring.
- Tests and their actual results (do not fabricate test results).
- Updated rule/exception JSON only when changes are justified by tests.
- Clear list of unresolved limitations.

## Safety checks
Do not modify citation/reference text, footnotes, endnotes, superscripts, equations, URLs, code, or locked spans.
Do not silently alter negation, modality, tense, aspect, agency, quantifier scope, or technical terminology.
Do not treat US/UK variants as errors.
Do not infer user identity or native language. L1 support is an explicit mode only.
