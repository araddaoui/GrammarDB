import { CorrectionCandidate, Rule } from './types';
import { segmentSentences } from './segmenter';
import { IRREGULAR_VERBS } from '../data/irregularVerbs';
import { baseToPastTense } from './danglingModifiers';

// ============================================================================
// RULE DEFINITIONS (Schema-Validated Metadata for UI, Audit & Conflict Scoring)
// ============================================================================

export const SYNTAX_HARMONY_RULES: Rule[] = [
  {
    id: 'AGR-HEAD-PLURAL-001',
    category: 'AGR',
    tier: 'tier2-syntax',
    priority: 95,
    description:
      'Resolve long-distance plural subject-verb agreement across possessive determiners, intervening prepositional phrases, and non-restrictive relative clauses.',
    match: {
      type: 'dependency_pattern',
      relation: 'plural_head_noun_aux_agreement',
    },
    replacement: 'were / are / have',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer', 'dependency_parser'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [
        {
          input: "The committee's decisions regarding the budget was communicated late.",
          expected: "The committee's decisions regarding the budget were communicated late.",
        },
      ],
      negative: [
        {
          input: 'Each of the decisions regarding the budget was communicated late.',
          expected: 'Each of the decisions regarding the budget was communicated late.',
        },
      ],
    },
    provenance: 'IdiomOptima Layer 2 Long-Distance Plural Head Agreement.',
  },
  {
    id: 'TENSE-COORD-001',
    category: 'TNS',
    tier: 'tier2-syntax',
    priority: 94,
    description:
      'Enforce tense consistency across coordinated clauses sharing a past narrative frame (e.g., "entered the room and announces" -> "entered the room and announced").',
    match: {
      type: 'dependency_pattern',
      relation: 'coordinated_verb_tense_harmony',
    },
    replacement: '[Past Tense Verb]',
    confidence: 0.98,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer', 'tense-harmony-analyzer'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [
        {
          input: 'The CEO entered the room and announces the merger to everyone.',
          expected: 'The CEO entered the room and announced the merger to everyone.',
        },
      ],
      negative: [
        {
          input: 'The CEO signed the contract yesterday and now leads the division.',
          expected: 'The CEO signed the contract yesterday and now leads the division.',
        },
        {
          input: 'The committee reviewed the budgets and plans.',
          expected: 'The committee reviewed the budgets and plans.',
        },
      ],
    },
    provenance: 'IdiomOptima Layer 2 Coordinated Clause Tense Harmonizer.',
  },
  {
    id: 'SUBJ-MAND-MODAL-001',
    category: 'COND',
    tier: 'tier2-syntax',
    priority: 96,
    description:
      'Remove redundant deontic modal auxiliaries (must/should/have to/need to) in mandative subjunctive "that"-clauses governed by directive verbs or necessity adjectives.',
    match: {
      type: 'dependency_pattern',
      relation: 'mandative_subjunctive_redundant_modal',
    },
    replacement: '[Mandative Governor] that [Subject] [Base Verb]',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer', 'agency_tracking'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [
        {
          input: 'The board suggested that we must submit the report early.',
          expected: 'The board suggested that we submit the report early.',
        },
      ],
      negative: [
        {
          input: 'The data suggest that policies must change immediately.',
          expected: 'The data suggest that policies must change immediately.',
        },
      ],
    },
    provenance: 'IdiomOptima Layer 2 Mandative Subjunctive Engine.',
  },
  {
    id: 'SUBJ-MAND-VERB-001',
    category: 'COND',
    tier: 'tier2-syntax',
    priority: 95,
    description:
      'Convert third-person singular indicative verbs to the bare subjunctive base form in mandative "that"-clauses.',
    match: {
      type: 'dependency_pattern',
      relation: 'mandative_subjunctive_base_verb',
    },
    replacement: '[Mandative Governor] that [Subject] [Base Verb]',
    confidence: 0.98,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer', 'agency_tracking'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [
        {
          input: 'The board suggested that he submits the report early.',
          expected: 'The board suggested that he submit the report early.',
        },
      ],
      negative: [
        {
          input: 'The study suggests that exercise reduces cognitive decline.',
          expected: 'The study suggests that exercise reduces cognitive decline.',
        },
      ],
    },
    provenance: 'IdiomOptima Layer 2 Mandative Subjunctive Engine.',
  },
  {
    id: 'EMBED-QUESTION-REPORTED-001',
    category: 'SYN',
    tier: 'tier2-syntax',
    priority: 96,
    description:
      'Restore canonical Subject-Verb declarative word order in reported speech and embedded wh-questions across full noun phrases and prepositional modifiers.',
    match: {
      type: 'dependency_pattern',
      relation: 'embedded_wh_question_word_order',
    },
    replacement: '[Reporting Verb] [wh-phrase] [Subject NP] [Copula/Verb]',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [
        {
          input: 'The intern asked what was the deadline for the proposal.',
          expected: 'The intern asked what the deadline for the proposal was.',
        },
        {
          input: 'The manager asked why did the team delay the launch.',
          expected: 'The manager asked why the team delayed the launch.',
        },
      ],
      negative: [
        {
          input: 'The intern asked who was responsible.',
          expected: 'The intern asked who was responsible.',
        },
        {
          input: 'The intern asked, "What was the deadline?"',
          expected: 'The intern asked, "What was the deadline?"',
        },
      ],
    },
    provenance: 'IdiomOptima Layer 2 Reported Speech & Embedded Clause Un-inversion.',
  },
  {
    id: 'REL-HUMAN-WHO-001',
    category: 'PRON',
    tier: 'tier2-syntax',
    priority: 95,
    description:
      'Replace non-human relative pronoun "which" with "who" when governed by an individual human antecedent (preserving collective institutions, prepositional "which", and sentential clauses).',
    match: {
      type: 'dependency_pattern',
      relation: 'human_antecedent_relative_pronoun',
    },
    replacement: 'who',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [
        {
          input: 'The employees, which signed the petition, received no reply.',
          expected: 'The employees, who signed the petition, received no reply.',
        },
      ],
      negative: [
        {
          input: 'The committee, which met yesterday, approved the budget.',
          expected: 'The committee, which met yesterday, approved the budget.',
        },
        {
          input: 'The CEO announced the merger to the employees, which surprised everyone.',
          expected: 'The CEO announced the merger to the employees, which surprised everyone.',
        },
      ],
    },
    provenance: 'IdiomOptima Layer 2 Animacy & Relative Pronoun Agreement.',
  },
];

// ============================================================================
// 1. VERB MORPHOLOGY & LEXICONS FOR COORDINATED TENSE HARMONY
// ============================================================================

const PRES3_TO_PAST = new Map<string, string>();
const BASE_TO_PAST = new Map<string, string>();
const IRREGULAR_PAST_V2 = new Set<string>();

function toThirdSgPresent(v1: string): string {
  const lower = v1.toLowerCase();
  if (lower === 'have') return 'has';
  if (lower === 'be') return 'is';
  if (lower === 'do') return 'does';
  if (lower === 'go') return 'goes';
  if (/(?:s|sh|ch|x|z|o)$/.test(lower)) return lower + 'es';
  if (/[bcdfghjklmnpqrstvwxyz]y$/.test(lower)) return lower.slice(0, -1) + 'ies';
  return lower + 's';
}

// Populate from IRREGULAR_VERBS
for (const entry of IRREGULAR_VERBS) {
  const v1 = entry.v1.toLowerCase();
  const v2 = entry.v2.toLowerCase();
  if (v1 === 'be') continue;
  IRREGULAR_PAST_V2.add(v2);
  // Handle dual forms like "was/were" or "burnt/burned" cleanly
  const primaryV2 = v2.split('/')[0].trim();
  const pres3 = toThirdSgPresent(v1);
  if (!PRES3_TO_PAST.has(pres3)) PRES3_TO_PAST.set(pres3, primaryV2);
  if (!BASE_TO_PAST.has(v1)) BASE_TO_PAST.set(v1, primaryV2);
}

// Regular unambiguous reporting, cognitive, organizational, and action verbs
const REGULAR_VERBS_STRICT = [
  'accept', 'achieve', 'acquire', 'add', 'admit', 'adopt', 'advise', 'agree',
  'allocate', 'allow', 'analyze', 'analyse', 'announce', 'apologize', 'appear',
  'apply', 'appreciate', 'approve', 'argue', 'arrange', 'arrive', 'ask',
  'assemble', 'assess', 'assign', 'assist', 'assume', 'assure', 'attach',
  'attend', 'avoid', 'borrow', 'calculate', 'cancel', 'celebrate', 'clarify',
  'classify', 'clean', 'close', 'collaborate', 'collect', 'combine', 'communicate',
  'compare', 'compel', 'compile', 'complain', 'complete', 'comply', 'concede',
  'conclude', 'conduct', 'confirm', 'connect', 'consider', 'consist', 'consult',
  'contain', 'continue', 'contribute', 'convince', 'coordinate', 'correct',
  'create', 'criticize', 'decide', 'declare', 'decline', 'decrease', 'deduce',
  'defend', 'define', 'delegate', 'delete', 'deliver', 'demonstrate', 'deny',
  'depart', 'depend', 'describe', 'design', 'destroy', 'detect', 'determine',
  'develop', 'disagree', 'disappear', 'discover', 'discuss', 'dismiss',
  'distribute', 'divide', 'document', 'dominate', 'drop', 'edit', 'eliminate',
  'email', 'emerge', 'emphasize', 'enable', 'encourage', 'enforce', 'engage',
  'enhance', 'enjoy', 'ensure', 'enter', 'establish', 'estimate', 'evaluate',
  'examine', 'exceed', 'exclude', 'execute', 'exist', 'exit', 'expand',
  'expect', 'explain', 'explore', 'express', 'extend', 'fail', 'file',
  'finalize', 'finish', 'focus', 'follow', 'force', 'forget', 'formulate',
  'gather', 'generate', 'grab', 'greet', 'happen', 'hesitate', 'highlight',
  'hire', 'hurry', 'identify', 'ignore', 'illustrate', 'implement', 'imply',
  'improve', 'include', 'incorporate', 'increase', 'indicate', 'inform',
  'initiate', 'insist', 'inspect', 'install', 'instruct', 'integrate', 'intend',
  'interrupt', 'introduce', 'invest', 'investigate', 'invite', 'involve',
  'isolate', 'join', 'justify', 'laugh', 'launch', 'listen', 'locate',
  'manage', 'mention', 'modify', 'monitor', 'motivate', 'navigate', 'neglect',
  'negotiate', 'nod', 'notice', 'notify', 'object', 'observe', 'obtain',
  'occur', 'omit', 'open', 'operate', 'oppose', 'organize', 'organise',
  'outline', 'overcome', 'participate', 'pause', 'perceive', 'perform',
  'permit', 'persuade', 'plan', 'postpone', 'predict', 'prefer', 'prepare',
  'present', 'preserve', 'prevent', 'proceed', 'produce', 'prohibit', 'promote',
  'propose', 'protect', 'prove', 'provide', 'publish', 'pull', 'purchase',
  'pursue', 'push', 'qualify', 'quantify', 'react', 'realize', 'realise',
  'receive', 'recognize', 'recognise', 'recommend', 'reconcile', 'reduce',
  'refer', 'reflect', 'refuse', 'register', 'reject', 'relate', 'release',
  'relocate', 'rely', 'remain', 'remember', 'remind', 'remove', 'repair',
  'repeat', 'replace', 'reply', 'require', 'reschedule', 'rescue', 'resign',
  'resolve', 'respond', 'restore', 'resume', 'retain', 'retire', 'retreat',
  'retrieve', 'reveal', 'revise', 'rush', 'save', 'scan', 'schedule',
  'search', 'secure', 'select', 'separate', 'serve', 'settle', 'share',
  'smile', 'solve', 'specify', 'speculate', 'stabilize', 'start', 'state',
  'submit', 'succeed', 'suffer', 'suggest', 'summarize', 'summarise', 'supervise',
  'supply', 'suppose', 'survive', 'suspect', 'suspend', 'sustain', 'terminate',
  'thank', 'threaten', 'transfer', 'transform', 'translate', 'travel', 'trigger',
  'unlock', 'urge', 'utilize', 'validate', 'verify', 'violate', 'vote', 'wait',
  'walk', 'warn', 'wash', 'welcome', 'whisper', 'wonder', 'worry', 'yell',
];

// Noun-verb homographs: only treat as coordinated verb when followed by a verbal complement
const HOMOPHONE_VERB_NOUNS = new Set([
  'answer', 'answers', 'approach', 'approaches', 'attack', 'attacks', 'back', 'backs',
  'break', 'breaks', 'call', 'calls', 'cause', 'causes', 'change', 'changes',
  'check', 'checks', 'claim', 'claims', 'control', 'controls', 'cost', 'costs',
  'count', 'counts', 'cover', 'covers', 'demand', 'demands', 'display', 'displays',
  'drive', 'drives', 'drop', 'drops', 'end', 'ends', 'face', 'faces',
  'fall', 'falls', 'handle', 'handles', 'hold', 'holds', 'issue', 'issues',
  'lead', 'leads', 'limit', 'limits', 'link', 'links', 'look', 'looks',
  'match', 'matches', 'measure', 'measures', 'move', 'moves', 'name', 'names',
  'need', 'needs', 'note', 'notes', 'offer', 'offers', 'order', 'orders',
  'pass', 'passes', 'place', 'places', 'plan', 'plans', 'point', 'points',
  'present', 'presents', 'promise', 'promises', 'question', 'questions', 'reach', 'reaches',
  'record', 'records', 'report', 'reports', 'request', 'requests', 'result', 'results',
  'return', 'returns', 'review', 'reviews', 'rise', 'rises', 'run', 'runs',
  'set', 'sets', 'shift', 'shifts', 'show', 'shows', 'sign', 'signs',
  'stay', 'stays', 'step', 'steps', 'stop', 'stops', 'study', 'studies',
  'support', 'supports', 'target', 'targets', 'test', 'tests', 'touch', 'touches',
  'treat', 'treats', 'turn', 'turns', 'update', 'updates', 'use', 'uses',
  'value', 'values', 'view', 'views', 'visit', 'visits', 'watch', 'watches',
  'wave', 'waves', 'work', 'works',
]);

for (const v1 of REGULAR_VERBS_STRICT) {
  const past = baseToPastTense(v1);
  const pres3 = toThirdSgPresent(v1);
  if (!PRES3_TO_PAST.has(pres3)) PRES3_TO_PAST.set(pres3, past);
  if (!BASE_TO_PAST.has(v1)) BASE_TO_PAST.set(v1, past);
}

for (const form of HOMOPHONE_VERB_NOUNS) {
  if (!form.endsWith('s')) {
    const past = baseToPastTense(form);
    const pres3 = toThirdSgPresent(form);
    if (!PRES3_TO_PAST.has(pres3)) PRES3_TO_PAST.set(pres3, past);
    if (!BASE_TO_PAST.has(form)) BASE_TO_PAST.set(form, past);
  }
}

// Explicit irregular pasts not reliably formed by suffix alone or missing from IRREGULAR_VERBS
const EXTRA_BASE_PAST: Record<string, string> = {
  read: 'read',
  hear: 'heard',
  put: 'put',
  set: 'set',
  cut: 'cut',
  hit: 'hit',
  shut: 'shut',
  split: 'split',
  quit: 'quit',
  let: 'let',
  announce: 'announced',
  enter: 'entered',
  open: 'opened',
  listen: 'listened',
  happen: 'happened',
  offer: 'offered',
  deliver: 'delivered',
  answer: 'answered',
  cover: 'covered',
  discover: 'discovered',
  remember: 'remembered',
  consider: 'considered',
  register: 'registered',
  transfer: 'transferred',
  refer: 'referred',
  occur: 'occurred',
  prefer: 'preferred',
  submit: 'submitted',
  admit: 'admitted',
  permit: 'permitted',
  omit: 'omitted',
  stop: 'stopped',
  drop: 'dropped',
  plan: 'planned',
  step: 'stepped',
  grab: 'grabbed',
  nod: 'nodded',
  cancel: 'canceled',
  travel: 'traveled',
};

for (const [v1, v2] of Object.entries(EXTRA_BASE_PAST)) {
  BASE_TO_PAST.set(v1, v2);
  PRES3_TO_PAST.set(toThirdSgPresent(v1), v2);
}

function isPastTenseToken(word: string): boolean {
  const lower = word.toLowerCase();
  if (IRREGULAR_PAST_V2.has(lower)) return true;
  if (
    lower.length >= 4 &&
    lower.endsWith('ed') &&
    !/^(?:hundred|naked|wicked|sacred|beloved|learned|aged|alleged|crooked|dogged|jagged|ragged|rugged|wretched|blessed|cursed|indeed|exceed|proceed|succeed|speed|need|feed|seed|bleed|breed|greed|weed|steed|deed|reed|creed|bed|red|shed|sled|wed|shred|fled|bled|bred|fed|led|sped)$/.test(
      lower
    )
  ) {
    return true;
  }
  return false;
}

const TEMPORAL_OR_MODAL_SHIFT_GUARD =
  /\b(?:now|today|currently|presently|nowadays|still|always|usually|often|sometimes|normally|generally|typically|frequently|occasionally|every\s+(?:day|week|month|year|morning|night)|lately|recently|henceforth|will|would|can|could|may|might|shall|should|must|going\s+to)\b/i;

const PERCEPTION_OR_CAUSATIVE_PAST = new Set([
  'saw', 'heard', 'watched', 'felt', 'noticed', 'observed', 'made', 'let', 'had', 'helped', 'bade',
]);

function extractCoordinatedTenseCandidates(
  sentenceText: string,
  sentenceStart: number
): CorrectionCandidate[] {
  const candidates: CorrectionCandidate[] = [];

  // Guard: If sentence contains a conditional "If ... " or future/present frame, or temporal shift cue
  if (/^\s*(?:If|Unless|When|Whenever)\b/i.test(sentenceText)) return candidates;
  if (TEMPORAL_OR_MODAL_SHIFT_GUARD.test(sentenceText)) return candidates;

  // Find candidate finite past-tense matrix verbs followed later in the sentence by `and|or|then <verb>`
  const tokenRegex = /\b([A-Za-z]+)\b/g;
  const tokens: Array<{ word: string; lower: string; start: number; end: number }> = [];
  let tm: RegExpExecArray | null;
  while ((tm = tokenRegex.exec(sentenceText)) !== null) {
    tokens.push({
      word: tm[1],
      lower: tm[1].toLowerCase(),
      start: tm.index,
      end: tm.index + tm[1].length,
    });
  }

  for (let i = 0; i < tokens.length; i++) {
    const v1 = tokens[i];
    if (!isPastTenseToken(v1.lower)) continue;

    // Skip if preceded by auxiliary, modal, infinitive marker, or determiner (e.g. "the submitted", "was rejected", "having analyzed", "did not enter")
    const prev = i > 0 ? tokens[i - 1].lower : '';
    if (
      /^(?:the|a|an|this|that|these|those|my|your|his|her|its|our|their|is|are|was|were|be|been|being|has|have|had|having|do|does|did|didn|don|doesn|not|never|to|will|would|can|could|may|might|shall|should|must|more|most|less|very)$/.test(
        prev
      )
    ) {
      continue;
    }
    // Skip if v1 is at the very start of the sentence (must have a subject before it)
    if (i === 0) continue;

    // Look ahead for a coordinating conjunction joining a second verb in the same clause
    for (let j = i + 1; j < tokens.length - 1; j++) {
      const conj = tokens[j];
      const between = sentenceText.slice(v1.end, conj.start);

      // Stop if crossing sentence/clause boundaries or subordinators
      if (/[;!?]/.test(between)) break;
      if (/\b(?:because|although|though|since|while|when|where|if|unless|whereas|that|which|who|whom|whose|after|before|until)\b/i.test(between)) {
        break;
      }

      if (conj.lower !== 'and' && conj.lower !== 'then') continue;

      // Optional single adverb or pronoun immediately after `and` (e.g., "and immediately announces", "and she announces")
      let v2Idx = j + 1;
      if (
        v2Idx + 1 < tokens.length &&
        /^(?:also|immediately|suddenly|quickly|slowly|quietly|calmly|briefly|unexpectedly|promptly|then|he|she|they|we|it)$/i.test(
          tokens[v2Idx].lower
        )
      ) {
        v2Idx++;
      }

      const v2 = tokens[v2Idx];
      if (!v2) continue;
      // Ensure nothing like punctuation separates conj and v2
      const gapConjToV2 = sentenceText.slice(conj.end, v2.start);
      if (/[.,;:!?]/.test(gapConjToV2)) continue;

      const afterV2Text = sentenceText.slice(v2.end);
      const nextTokenLower = v2Idx + 1 < tokens.length ? tokens[v2Idx + 1].lower : '';

      // Case A: 3rd-person singular present tense verb (e.g., "announces")
      if (PRES3_TO_PAST.has(v2.lower)) {
        const pastForm = PRES3_TO_PAST.get(v2.lower)!;
        if (pastForm === v2.lower) continue;

        // If V2 is a noun-verb homograph ("plans", "reports", "notes", "issues", "signs"),
        // require an unmistakable direct verbal complement right after V2 (e.g. "the merger", "to ...", "that ...")
        if (HOMOPHONE_VERB_NOUNS.has(v2.lower)) {
          const hasVerbalComplement =
            /^\s+(?:the|a|an|this|that|these|those|my|your|his|her|its|our|their|every|each|all|some|no|many|several|him|her|them|it|us|me|to|what|how|why|when|where|whether)\b/i.test(
              afterV2Text
            );
          if (!hasVerbalComplement) continue;
        }

        const replacement = /^[A-Z]/.test(v2.word)
          ? pastForm.charAt(0).toUpperCase() + pastForm.slice(1)
          : pastForm;

        candidates.push({
          ruleId: 'TENSE-COORD-001',
          start: sentenceStart + v2.start,
          end: sentenceStart + v2.end,
          original: v2.word,
          replacement,
          confidence: 0.98,
          category: 'TNS',
          rationale: `Coordinated verb '${v2.word}' conflicts with past-tense matrix verb '${v1.word}'; harmonized to '${replacement}'.`,
          provenance: 'IdiomOptima Layer 2 Coordinated Clause Tense Harmonizer',
        });
        break;
      }

      // Case B: Unambiguous plural/base present verb after non-causative/non-perception past verb
      // Guard: Skip if V1 is perception/causative ("saw him enter and leave") or if V2 is a homograph noun
      if (
        !PERCEPTION_OR_CAUSATIVE_PAST.has(v1.lower) &&
        BASE_TO_PAST.has(v2.lower) &&
        !HOMOPHONE_VERB_NOUNS.has(v2.lower) &&
        !/^(?:to|will|would|can|could|may|might|shall|should|must|do|does|did)$/.test(nextTokenLower) &&
        /^\s+(?:the|a|an|this|that|these|those|my|your|his|her|its|our|their|him|her|them|it|us|me|to\s+[a-z]+|[.,;!?]|$)/i.test(
          afterV2Text
        )
      ) {
        const pastForm = BASE_TO_PAST.get(v2.lower)!;
        if (pastForm === v2.lower) continue;

        const replacement = /^[A-Z]/.test(v2.word)
          ? pastForm.charAt(0).toUpperCase() + pastForm.slice(1)
          : pastForm;

        candidates.push({
          ruleId: 'TENSE-COORD-001',
          start: sentenceStart + v2.start,
          end: sentenceStart + v2.end,
          original: v2.word,
          replacement,
          confidence: 0.975,
          category: 'TNS',
          rationale: `Coordinated verb '${v2.word}' harmonized with past-tense verb '${v1.word}' to '${replacement}'.`,
          provenance: 'IdiomOptima Layer 2 Coordinated Clause Tense Harmonizer',
        });
        break;
      }
    }
  }

  return candidates;
}

// ============================================================================
// 2. MANDATIVE SUBJUNCTIVE (REDUNDANT MODALS & 3SG VERBS)
// ============================================================================

const EPISTEMIC_INANIMATE_SUBJECTS = new Set([
  'data', 'result', 'results', 'finding', 'findings', 'evidence', 'study', 'studies',
  'analysis', 'analyses', 'report', 'reports', 'research', 'experiment', 'experiments',
  'survey', 'surveys', 'observation', 'observations', 'model', 'models', 'statistics',
  'number', 'numbers', 'trend', 'trends', 'pattern', 'patterns', 'correlation',
  'outcome', 'outcomes', 'figure', 'figures', 'chart', 'charts', 'table', 'tables',
  'graph', 'graphs', 'telemetry', 'metric', 'metrics', 'symptom', 'symptoms',
  'this', 'that', 'these', 'those', 'it', 'what', 'which',
]);

const NON_VERB_AFTER_MODAL_GUARD = new Set([
  'be', // handled carefully: "must be submitted" -> "be submitted" IS valid!
]);
void NON_VERB_AFTER_MODAL_GUARD;

const BASE_VERB_3SG_MAP = new Map<string, string>();
for (const entry of IRREGULAR_VERBS) {
  const v1 = entry.v1.toLowerCase();
  if (v1 === 'be') continue;
  BASE_VERB_3SG_MAP.set(toThirdSgPresent(v1), v1);
}
for (const v1 of REGULAR_VERBS_STRICT) {
  BASE_VERB_3SG_MAP.set(toThirdSgPresent(v1), v1);
}
for (const form of HOMOPHONE_VERB_NOUNS) {
  if (!form.endsWith('s')) {
    BASE_VERB_3SG_MAP.set(toThirdSgPresent(form), form);
  }
}

function isEpistemicSuggestSubject(governorClauseBeforeVerb: string, govVerbLower: string): boolean {
  if (!/^suggest(?:s|ed)?$|^indicate(?:s|ed)?$/i.test(govVerbLower)) {
    return false;
  }
  // Extract head word immediately before governor verb (e.g. "The preliminary results strongly")
  const stripped = governorClauseBeforeVerb
    .replace(/\b(?:also|strongly|clearly|initially|strongly|consistently|often|always)\s*$/i, '')
    .trim();
  const tokens = stripped.split(/\s+/);
  const lastWord = tokens[tokens.length - 1]?.toLowerCase().replace(/[^a-z-]/g, '') || '';
  return EPISTEMIC_INANIMATE_SUBJECTS.has(lastWord);
}

function extractMandativeSubjunctiveCandidates(
  sentenceText: string,
  sentenceStart: number
): CorrectionCandidate[] {
  const candidates: CorrectionCandidate[] = [];

  // Pattern A: Mandative verb governor + that + Subject + redundant modal + [not?] + base verb
  // e.g. "The board suggested that we must submit the report early." -> "...that we submit..."
  const mandModalRegex =
    /(\b(recommended|recommend|recommends|suggested|suggest|suggests|demanded|demand|demands|insisted|insist|insists|required|require|requires|requested|request|requests|urged|urge|urges|ordered|order|orders|proposed|propose|proposes|mandated|mandate|mandates|stipulated|stipulate|stipulates|decreed|decree|decrees|advised|advise|advises|directed|direct|directs)\s+that\s+(?:I|we|you|he|she|they|it|everyone|everybody|anyone|anybody|someone|somebody|no\s+one|nobody|(?:the|a|an|this|that|these|those|our|their|your|my|his|her|its|each|every|all)\s+[A-Za-z0-9'-]+(?:\s+[A-Za-z0-9'-]+){0,3})\s+)(must|should|have\s+to|has\s+to|had\s+to|need\s+to|needs\s+to|ought\s+to)\s+(?:(not)\s+)?([a-z]{2,})\b/gi;

  let m: RegExpExecArray | null;
  while ((m = mandModalRegex.exec(sentenceText)) !== null) {
    const prefixBeforeModal = m[1];
    const govVerb = m[2];
    const modalPhrase = m[3];
    const negWord = m[4];
    const baseVerb = m[5];

    const preGovernor = sentenceText.slice(0, m.index);
    if (isEpistemicSuggestSubject(preGovernor, govVerb.toLowerCase())) {
      continue;
    }

    const modalOffset = prefixBeforeModal.length;
    const removeStart = sentenceStart + m.index + modalOffset;
    const afterModalChar = sentenceText[m.index + modalOffset + modalPhrase.length];
    const removeEnd = removeStart + modalPhrase.length + (afterModalChar === ' ' ? 1 : 0);

    candidates.push({
      ruleId: 'SUBJ-MAND-MODAL-001',
      start: removeStart,
      end: removeEnd,
      original: sentenceText.slice(removeStart - sentenceStart, removeEnd - sentenceStart),
      replacement: '',
      confidence: 0.985,
      category: 'COND',
      rationale: `Mandative subjunctive governed by '${govVerb}' takes the bare subjunctive ('${negWord ? `not ${baseVerb}` : baseVerb}') without redundant deontic modal '${modalPhrase}'.`,
      provenance: 'IdiomOptima Layer 2 Mandative Subjunctive Engine',
    });
  }

  // Pattern A2: Mandative adjective governor ("It is essential/vital/crucial/imperative/necessary/important that [Subj] must/should [Verb]")
  const mandAdjModalRegex =
    /(\b(?:is|was|remains?|became|seems?)\s+(?:very\s+|absolutely\s+|critically\s+)?(essential|vital|crucial|imperative|important|necessary|mandatory|obligatory|advisable|urgent)\s+that\s+(?:I|we|you|he|she|they|it|everyone|everybody|anyone|anybody|someone|somebody|(?:the|a|an|this|that|these|those|our|their|your|my|his|her|its|each|every|all)\s+[A-Za-z0-9'-]+(?:\s+[A-Za-z0-9'-]+){0,3})\s+)(must|should|have\s+to|has\s+to|need\s+to|needs\s+to|ought\s+to)\s+(?:(not)\s+)?([a-z]{2,})\b/gi;

  while ((m = mandAdjModalRegex.exec(sentenceText)) !== null) {
    const prefixBeforeModal = m[1];
    const adj = m[2];
    const modalPhrase = m[3];
    const negWord = m[4];
    const baseVerb = m[5];

    const modalOffset = prefixBeforeModal.length;
    const removeStart = sentenceStart + m.index + modalOffset;
    const afterModalChar = sentenceText[m.index + modalOffset + modalPhrase.length];
    const removeEnd = removeStart + modalPhrase.length + (afterModalChar === ' ' ? 1 : 0);

    candidates.push({
      ruleId: 'SUBJ-MAND-MODAL-001',
      start: removeStart,
      end: removeEnd,
      original: sentenceText.slice(removeStart - sentenceStart, removeEnd - sentenceStart),
      replacement: '',
      confidence: 0.985,
      category: 'COND',
      rationale: `Mandative adjective '${adj}' governs bare subjunctive ('${negWord ? `not ${baseVerb}` : baseVerb}') without modal '${modalPhrase}'.`,
      provenance: 'IdiomOptima Layer 2 Mandative Subjunctive Engine',
    });
  }

  // Pattern B: Mandative governor + that + singular subject + 3sg -s verb -> bare base verb
  // e.g., "The board suggested that he submits the report early." -> "...that he submit..."
  const mandVerbRegex =
    /\b(recommended|recommend|recommends|suggested|suggest|suggests|demanded|demand|demands|insisted|insist|insists|required|require|requires|requested|request|requests|urged|urge|urges|ordered|order|orders|proposed|propose|proposes|mandated|mandate|mandates|stipulated|stipulate|stipulates|decreed|decree|decrees)\s+that\s+(he|she|it|everyone|everybody|anyone|anybody|someone|somebody|each\s+[a-z-]+|(?:the|a|an|this|that|our|their|your|my|his|her)\s+[A-Za-z0-9'-]+(?:\s+[A-Za-z0-9'-]+){0,2})\s+([a-z]+s)\b/gi;

  while ((m = mandVerbRegex.exec(sentenceText)) !== null) {
    const govVerb = m[1];
    const verb3sg = m[3];
    const verbLower = verb3sg.toLowerCase();

    const preGovernor = sentenceText.slice(0, m.index);
    if (isEpistemicSuggestSubject(preGovernor, govVerb.toLowerCase())) {
      continue;
    }

    const baseVerb = BASE_VERB_3SG_MAP.get(verbLower);
    if (!baseVerb || baseVerb === verbLower) continue;

    const verbOffset = m[0].lastIndexOf(verb3sg);
    if (verbOffset === -1) continue;

    const vStart = sentenceStart + m.index + verbOffset;
    const vEnd = vStart + verb3sg.length;

    candidates.push({
      ruleId: 'SUBJ-MAND-VERB-001',
      start: vStart,
      end: vEnd,
      original: verb3sg,
      replacement: baseVerb,
      confidence: 0.98,
      category: 'COND',
      rationale: `Mandative subjunctive governed by '${govVerb}' requires base verb '${baseVerb}' rather than indicative '${verb3sg}'.`,
      provenance: 'IdiomOptima Layer 2 Mandative Subjunctive Engine',
    });
  }

  return candidates;
}

// ============================================================================
// 3. REPORTED SPEECH / EMBEDDED WH-QUESTION WORD ORDER
// ============================================================================

const INTERVENING_FINITE_VERBS =
  /\b(?:is|are|was|were|am|be|been|has|have|had|do|does|did|will|would|can|could|may|might|shall|should|must|made|took|gave|said|told|asked|announced|reported|rejected|accepted|approved|signed|wrote|read|saw|heard|found)\b/i;

const REPORTING_VERBS_PATTERN =
  '(?:asked|asks|ask|asking|wondered|wonders|wonder|wondering|inquired|inquires|inquire|inquiring|questioned|questions|question|questioning|explained|explains|explain|explaining|knew|know|knows|knowing|understood|understand|understands|understanding|remembered|remember|remembers|forgot|forget|forgets|checked|check|checks|checking|verified|verify|verifies|verifying|noticed|notice|notices|discovered|discover|discovers|discovering|determined|determine|determines|determining|clarified|clarify|clarifies|clarifying|revealed|reveal|reveals|indicated|indicate|indicates|saw|see|sees|realized|realizes|realize|told|tells|tell|telling|showed|shows|show|showing|learned|learns|learn|learning|investigated|investigates|investigate|investigating|examined|examines|examine|examining|analyzed|analyzes|analyze|analyzing|analysed|analyses|analyse|analysing|explored|explores|explore|exploring|evaluated|evaluates|evaluate|evaluating|assessed|assesses|assess|assessing|discussed|discusses|discuss|discussing|found\\s+out|find\\s+out|wanted\\s+to\\s+know|wants\\s+to\\s+know|want\\s+to\\s+know|wasn\'t\\s+sure|was\\s+not\\s+sure|weren\'t\\s+sure|were\\s+not\\s+sure|isn\'t\\s+sure|is\\s+not\\s+sure|couldn\'t\\s+tell|could\\s+not\\s+tell|didn\'t\\s+know|did\\s+not\\s+know)';

const WH_PHRASE_PATTERN =
  '(?:what|where|when|why|who|whom|whose(?:\\s+[a-z-]+){1,3}|which(?:\\s+[a-z-]+){0,3}|how(?:\\s+(?:many|much|long|often|far|old|soon|late|early|high|low|important|critical|significant|relevant|effective|accurate|reliable|feasible|urgent|difficult|complex|expensive))?)';

const NP_WITH_PP_PATTERN =
  '(?:(?:the|a|an|this|that|these|those|my|your|his|her|its|our|their|each|every|some|no|many|several|both|all)\\s+[A-Za-z0-9\'-]+(?:\\s+[A-Za-z0-9\'-]+){0,3}(?:\\s+(?:of|for|in|on|at|to|from|with|by|about|regarding|concerning|between|among|under|over|during|before|after)\\s+(?:the|a|an|this|that|these|those|my|your|his|her|its|our|their|each|every|some|[A-Za-z0-9\'-]+)(?:\\s+[A-Za-z0-9\'-]+){0,3})*|I|he|she|we|they|you|it)';

function extractEmbeddedQuestionCandidates(
  sentenceText: string,
  sentenceStart: number
): CorrectionCandidate[] {
  const candidates: CorrectionCandidate[] = [];

  // 3A. Copular un-inversion: [Reporting Verb] ([indirect obj]) [wh-phrase] [is|are|was|were] [Subject NP (+ PP tail)]
  // No comma/quote between reporting verb and wh-phrase so direct speech ("He asked, 'What was...'") is strictly untouched.
  const embedCopulaRegex = new RegExp(
    `(\\b${REPORTING_VERBS_PATTERN}(?:\\s+(?:me|us|him|her|them|you|the\\s+[a-z-]+))?\\s+)(${WH_PHRASE_PATTERN})\\s+(is|are|was|were)\\s+(${NP_WITH_PP_PATTERN})(?=[.,;!?]|\\s+(?:and|or|but|because|although|though|since|while|when|if|unless|so|yet)\\b|$)`,
    'gi'
  );

  let m: RegExpExecArray | null;
  while ((m = embedCopulaRegex.exec(sentenceText)) !== null) {
    const prefixBeforeWh = m[1];
    const whPhrase = m[2];
    const copula = m[3];
    const subjectNP = m[4];

    // Guard against dummy "there" or finite verb swallowed inside subjectNP
    if (/^there\b/i.test(subjectNP.trim())) continue;
    if (INTERVENING_FINITE_VERBS.test(subjectNP)) continue;

    const whStartInMatch = prefixBeforeWh.length;
    const editStart = sentenceStart + m.index + whStartInMatch;
    const editEnd = sentenceStart + m.index + m[0].length;
    const originalSlice = sentenceText.slice(editStart - sentenceStart, editEnd - sentenceStart);
    const replacementSlice = `${whPhrase} ${subjectNP} ${copula.toLowerCase()}`;

    if (originalSlice === replacementSlice) continue;

    candidates.push({
      ruleId: 'EMBED-QUESTION-REPORTED-001',
      start: editStart,
      end: editEnd,
      original: originalSlice,
      replacement: replacementSlice,
      confidence: 0.985,
      category: 'SYN',
      rationale: `Indirect/reported question requires declarative Subject-Verb word order ('${replacementSlice}') rather than inverted '${originalSlice}'.`,
      provenance: 'IdiomOptima Layer 2 Reported Speech & Embedded Clause Un-inversion',
    });
  }

  // 3B. Do/does/did un-inversion in reported speech:
  // e.g., "The manager asked why did the team delay the launch." -> "...why the team delayed the launch."
  const doSubjectNP =
    '(?:(?:the|a|an|this|that|these|those|my|your|his|her|its|our|their|each|every|some|no|many|several|both|all)\\s+(?:[A-Za-z0-9\'-]+\\s+){0,2}?[A-Za-z0-9\'-]+|I|he|she|we|they|you|it)';
  const embedDoRegex = new RegExp(
    `(\\b${REPORTING_VERBS_PATTERN}(?:\\s+(?:me|us|him|her|them|you|the\\s+[a-z-]+))?\\s+)(${WH_PHRASE_PATTERN})\\s+(did|do|does)\\s+(${doSubjectNP})\\s+([a-z]{2,})\\b`,
    'gi'
  );

  while ((m = embedDoRegex.exec(sentenceText)) !== null) {
    const prefixBeforeWh = m[1];
    const whPhrase = m[2];
    const doAux = m[3].toLowerCase();
    const subjectNP = m[4];
    const baseVerb = m[5];

    if (/^(?:not|never|always|also)$/i.test(baseVerb)) continue;
    if (INTERVENING_FINITE_VERBS.test(subjectNP)) continue;
    // Ensure the token right before baseVerb is not a determiner (prevents capturing an object noun as verb)
    const subjTokens = subjectNP.trim().split(/\s+/);
    const lastSubjTok = subjTokens[subjTokens.length - 1]?.toLowerCase() || '';
    if (/^(?:the|a|an|this|that|these|those|my|your|his|her|its|our|their|each|every|some|no)$/.test(lastSubjTok)) {
      continue;
    }

    let finiteVerb = baseVerb.toLowerCase();
    if (doAux === 'did') {
      finiteVerb = baseToPastTense(finiteVerb);
    } else if (doAux === 'does') {
      finiteVerb = toThirdSgPresent(finiteVerb);
    }

    const whStartInMatch = prefixBeforeWh.length;
    const editStart = sentenceStart + m.index + whStartInMatch;
    const editEnd = sentenceStart + m.index + m[0].length;
    const originalSlice = sentenceText.slice(editStart - sentenceStart, editEnd - sentenceStart);
    const replacementSlice = `${whPhrase} ${subjectNP} ${finiteVerb}`;

    candidates.push({
      ruleId: 'EMBED-QUESTION-REPORTED-001',
      start: editStart,
      end: editEnd,
      original: originalSlice,
      replacement: replacementSlice,
      confidence: 0.98,
      category: 'SYN',
      rationale: `Reported wh-clause drops auxiliary '${doAux}' and inflects main verb ('${replacementSlice}').`,
      provenance: 'IdiomOptima Layer 2 Reported Speech & Embedded Clause Un-inversion',
    });
  }

  return candidates;
}

// ============================================================================
// 4. HUMAN INDIVIDUAL ANTECEDENT RELATIVE PRONOUN (WHICH -> WHO)
// ============================================================================

const HUMAN_INDIVIDUAL_NOUNS = new Set([
  'person', 'people', 'human', 'humans', 'individual', 'individuals',
  'man', 'men', 'woman', 'women', 'child', 'children', 'boy', 'boys', 'girl', 'girls',
  'adult', 'adults', 'parent', 'parents', 'mother', 'father',
  'employee', 'employees', 'worker', 'workers', 'intern', 'interns',
  'colleague', 'colleagues', 'manager', 'managers', 'director', 'directors',
  'executive', 'executives', 'ceo', 'founder', 'founders', 'supervisor', 'supervisors',
  'leader', 'leaders', 'member', 'members', 'candidate', 'candidates',
  'applicant', 'applicants', 'participant', 'participants', 'researcher', 'researchers',
  'scientist', 'scientists', 'scholar', 'scholars', 'author', 'authors',
  'writer', 'writers', 'editor', 'editors', 'reviewer', 'reviewers',
  'analyst', 'analysts', 'investigator', 'investigators', 'engineer', 'engineers',
  'developer', 'developers', 'designer', 'designers', 'technician', 'technicians',
  'doctor', 'doctors', 'physician', 'physicians', 'clinician', 'clinicians',
  'nurse', 'nurses', 'surgeon', 'surgeons', 'patient', 'patients',
  'student', 'students', 'teacher', 'teachers', 'professor', 'professors',
  'instructor', 'instructors', 'lecturer', 'lecturers', 'lawyer', 'lawyers',
  'attorney', 'attorneys', 'judge', 'judges', 'officer', 'officers',
  'driver', 'drivers', 'passenger', 'passengers', 'customer', 'customers',
  'client', 'clients', 'user', 'users', 'consumer', 'consumers',
  'citizen', 'citizens', 'resident', 'residents', 'voter', 'voters',
  'guest', 'guests', 'visitor', 'visitors', 'tourist', 'tourists',
  'volunteer', 'volunteers', 'witness', 'witnesses', 'expert', 'experts',
  'consultant', 'consultants', 'advisor', 'advisors', 'assistant', 'assistants',
  'journalist', 'journalists', 'reporter', 'reporters', 'friend', 'friends',
  'neighbor', 'neighbors', 'neighbour', 'neighbours', 'partner', 'partners',
  'specialist', 'specialists', 'coordinator', 'coordinators', 'representative', 'representatives',
]);

// Verbs typical of sentential ", which ..." clauses referring to a whole previous event rather than the preceding noun
const SENTENTIAL_EVENT_PREDICATES = new Set([
  'is', 'was', 'means', 'meant', 'caused', 'surprised', 'shocked', 'upset',
  'led', 'resulted', 'shows', 'showed', 'indicates', 'indicated', 'suggests', 'suggested',
  'proves', 'proved', 'demonstrates', 'demonstrated', 'highlights', 'highlighted',
  'confirms', 'confirmed', 'remains', 'remained', 'occurred', 'happened',
  'complicated', 'delayed', 'prompted', 'triggered', 'allowed', 'enabled', 'forced',
]);

const REL_PREPOSITIONS = new Set([
  'in', 'on', 'at', 'by', 'for', 'of', 'to', 'from', 'with', 'about', 'among',
  'between', 'through', 'under', 'over', 'against', 'without', 'toward', 'towards',
  'within', 'beyond', 'upon', 'regarding', 'concerning',
]);

function extractHumanRelativePronounCandidates(
  sentenceText: string,
  sentenceStart: number
): CorrectionCandidate[] {
  const candidates: CorrectionCandidate[] = [];

  const relWhichRegex = /\b([A-Za-z-]+)(,?)\s+(which)\b(?:\s+(?:(?:had|have|has|were|was|are|is|will|would|can|could|did|not|also|already)\s+)?([a-z]+))?/gi;

  let m: RegExpExecArray | null;
  while ((m = relWhichRegex.exec(sentenceText)) !== null) {
    const nounRaw = m[1];
    const nounLower = nounRaw.toLowerCase();
    const hasComma = m[2] === ',';
    const whichWord = m[3];
    const nextVerb = m[4]?.toLowerCase() || '';

    // 1. Must be an individual human noun (not collective committee/board/company)
    if (!HUMAN_INDIVIDUAL_NOUNS.has(nounLower)) continue;

    // 2. Skip prepositional `which` ("among which", "by which") or resumptive "which it" (handled by SYN-RESUMP-001)
    if (REL_PREPOSITIONS.has(nounLower)) continue;
    if (nextVerb === 'it' || nextVerb === 'they') continue;

    const beforeNoun = sentenceText.slice(0, m.index).trim();
    const beforeNounWords = beforeNoun.split(/\s+/).filter(Boolean);
    const prevWordBeforeNoun = beforeNounWords[beforeNounWords.length - 1]?.toLowerCase() || '';
    if (REL_PREPOSITIONS.has(prevWordBeforeNoun) && !beforeNoun) continue;

    // 3. Disambiguate non-restrictive ", which" vs sentential event ", which surprised everyone"
    if (hasComma) {
      const hasFiniteVerbBeforeNoun = INTERVENING_FINITE_VERBS.test(beforeNoun);
      const afterWhich = sentenceText.slice(m.index + m[0].length);
      const hasClosingAppositiveComma = /^[^.!?;\n]+,\s+[a-z]/i.test(afterWhich);

      // If preceded by a finite verb (e.g. "announced the merger to the employees, which surprised everyone")
      // AND not a closed appositive relative clause AND followed by a sentential event predicate, preserve!
      if (hasFiniteVerbBeforeNoun && !hasClosingAppositiveComma && SENTENTIAL_EVENT_PREDICATES.has(nextVerb)) {
        continue;
      }
      // Even without a closing comma, if preceded by a preposition ("to the employees, which surprised..."), guard event verbs
      if (REL_PREPOSITIONS.has(prevWordBeforeNoun) && SENTENTIAL_EVENT_PREDICATES.has(nextVerb)) {
        continue;
      }
    }

    const whichOffset = m[0].indexOf(whichWord, nounRaw.length);
    if (whichOffset === -1) continue;

    const wStart = sentenceStart + m.index + whichOffset;
    const wEnd = wStart + whichWord.length;
    const replacement = /^[A-Z]/.test(whichWord) ? 'Who' : 'who';

    candidates.push({
      ruleId: 'REL-HUMAN-WHO-001',
      start: wStart,
      end: wEnd,
      original: whichWord,
      replacement,
      confidence: 0.985,
      category: 'PRON',
      rationale: `Human antecedent '${nounRaw}' requires personal relative pronoun '${replacement}' instead of '${whichWord}'.`,
      provenance: 'IdiomOptima Layer 2 Animacy & Relative Pronoun Agreement',
    });
  }

  return candidates;
}

// ============================================================================
// UNIFIED LAYER 2 DISPATCHER
// ============================================================================

export function analyzeSyntaxHarmonies(fullText: string): CorrectionCandidate[] {
  const candidates: CorrectionCandidate[] = [];
  const sentences = segmentSentences(fullText);

  for (const sentence of sentences) {
    const text = sentence.text;
    if (!text.trim()) continue;

    candidates.push(...extractCoordinatedTenseCandidates(text, sentence.start));
    candidates.push(...extractMandativeSubjunctiveCandidates(text, sentence.start));
    candidates.push(...extractEmbeddedQuestionCandidates(text, sentence.start));
    candidates.push(...extractHumanRelativePronounCandidates(text, sentence.start));
  }

  return candidates;
}
