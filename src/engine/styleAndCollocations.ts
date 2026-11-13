import { CorrectionCandidate, Rule } from './types';
import { v3ToBase, gerundToBase, baseToGerund } from './danglingModifiers';
import { IRREGULAR_VERBS } from '../data/irregularVerbs';

// ============================================================================
// LEXICAL HELPERS
// ============================================================================

const IRREGULAR_V3_SET = new Set<string>();
for (const entry of IRREGULAR_VERBS) {
  IRREGULAR_V3_SET.add(entry.v3.toLowerCase());
}

const NON_PARTICIPLE_ED_WORDS = new Set([
  'red', 'bed', 'shed', 'sled', 'wed', 'fed', 'led', 'fled', 'bled', 'bred', 'sped',
  'seed', 'need', 'feed', 'heed', 'weed', 'deed', 'reed', 'greed', 'speed', 'steed',
  'hundred', 'wicked', 'naked', 'sacred', 'rugged', 'beloved', 'alleged', 'crooked',
]);

function isLikelyPastParticiple(word: string): boolean {
  const lower = word.toLowerCase();
  if (IRREGULAR_V3_SET.has(lower)) return true;
  if (NON_PARTICIPLE_ED_WORDS.has(lower)) return false;
  if (lower.length >= 4 && lower.endsWith('ed')) return true;
  if (
    lower.length >= 5 &&
    /(?:en|wn|ne)$/.test(lower) &&
    !/^(?:when|then|even|often|open|green|screen|between|teen|queen|seven|eleven|women|human|person|reason|season|lesson|common|cotton|button|nation|action|station|option|question|section|mention|condition|position|decision|opinion|million|billion|region|domain|certain|remain|obtain|contain|maintain|explain|complain|sustain|retain|attain)$/.test(lower)
  ) {
    return true;
  }
  return false;
}

function preserveInitialCase(sample: string, target: string): string {
  if (!sample || !target) return target;
  if (/^[A-Z]/.test(sample)) {
    return target.charAt(0).toUpperCase() + target.slice(1);
  }
  return target.charAt(0).toLowerCase() + target.slice(1);
}

function lowercaseLeadingDet(np: string): string {
  return np.replace(
    /^(The|A|An|This|That|These|Those|My|Our|Their|His|Her|Its)\b/,
    (m) => m.toLowerCase()
  );
}

function isAtSentenceStart(fullText: string, index: number): boolean {
  if (index === 0) return true;
  const before = fullText.slice(0, index);
  return /(?:^|[.!?]\s+|\n+\s*)$/.test(before);
}

function isLikelyPluralMassOrCount(word: string): boolean {
  const lower = word.toLowerCase();
  if (/^(?:people|children|men|women|criteria|phenomena|analyses|hypotheses|theses|data|staff|resources|options|factors|issues|items|studies|errors|tools|tasks|members|steps|rules|cases|examples|reasons|methods|results|benefits|challenges|opportunities)$/.test(lower)) {
    return true;
  }
  if (lower.endsWith('s') && !/(?:ss|us|is|news|chaos|ethics|physics|economics|statistics|mathematics|politics)$/.test(lower)) {
    return true;
  }
  return false;
}

const FINITE_VERB_OR_AUX = new Set([
  'is', 'are', 'was', 'were', 'am', 'be', 'been', 'being',
  'has', 'have', 'had', 'do', 'does', 'did',
  'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must',
  'shows', 'show', 'showed', 'makes', 'make', 'made', 'takes', 'take', 'took',
  'gives', 'give', 'gave', 'gets', 'get', 'got', 'goes', 'go', 'went',
  'comes', 'come', 'came', 'sees', 'see', 'saw', 'says', 'say', 'said',
  'tells', 'tell', 'told', 'asks', 'ask', 'asked', 'finds', 'find', 'found',
  'keeps', 'keep', 'kept', 'leaves', 'leave', 'left', 'brings', 'bring', 'brought',
  'holds', 'hold', 'held', 'writes', 'write', 'wrote', 'reads', 'read',
  'runs', 'run', 'ran', 'sits', 'sit', 'sat', 'stands', 'stand', 'stood',
  'becomes', 'become', 'became', 'remains', 'remain', 'remained',
  'appears', 'appear', 'appeared', 'seems', 'seem', 'seemed',
  'requires', 'require', 'required', 'allows', 'allow', 'allowed',
  'decides', 'decide', 'decided', 'reviews', 'review', 'reviewed',
  'receives', 'receive', 'received', 'signs', 'sign', 'signed',
  'announces', 'announce', 'announced', 'enters', 'enter', 'entered',
  'moves', 'move', 'moved', 'adapts', 'adapt', 'adapted',
  'speaks', 'speak', 'spoke', 'suffer', 'suffers', 'suffered',
  'allocates', 'allocate', 'allocated', 'completes', 'complete', 'completed',
  'rejects', 'reject', 'rejected', 'provides', 'provide', 'provided',
  'suggests', 'suggest', 'suggested', 'covers', 'cover', 'covered',
]);

// ============================================================================
// RULE DEFINITIONS (Schema-Validated Metadata)
// ============================================================================

export const STYLE_COLLOCATION_RULES: Rule[] = [
  // ---- Transitive Verbs with Spurious Prepositions ----
  {
    id: 'PREP-TRANS-EMPHASISE-001',
    category: 'PREP',
    tier: 'tier1-local',
    priority: 90,
    description:
      'Prune redundant preposition "on" after direct transitive verb "emphasise/emphasize".',
    match: {
      type: 'regex',
      pattern: '\\b(emphasise|emphasize|emphasises|emphasizes|emphasised|emphasized|emphasising|emphasizing)\\s+on\\b',
      caseInsensitive: true,
    },
    replacement: '$1',
    confidence: 0.99,
    autoApply: true,
    enabled: true,
    requires: ['local_regex'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [
        { input: 'The director emphasised on the need for change.', expected: 'The director emphasised the need for change.' },
        { input: 'The speaker emphasized on clarity.', expected: 'The speaker emphasized clarity.' },
      ],
      negative: [
        { input: 'The director placed emphasis on the need for change.', expected: 'The director placed emphasis on the need for change.' },
      ],
    },
    provenance: 'Direct transitive verb "emphasise/emphasize" takes no preposition.',
  },
  {
    id: 'PREP-TRANS-STRESS-001',
    category: 'PREP',
    tier: 'tier2-syntax',
    priority: 89,
    description:
      'Prune redundant preposition "on" after verb "stress" while preserving nominal "place/put stress on".',
    match: { type: 'dependency_pattern', relation: 'transitive_verb_spurious_prep' },
    replacement: '$1',
    confidence: 0.98,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [{ input: 'The report stressed on the urgency.', expected: 'The report stressed the urgency.' }],
      negative: [{ input: 'The report placed heavy stress on the urgency.', expected: 'The report placed heavy stress on the urgency.' }],
    },
    provenance: 'Transitive verb "stress" governs direct object without "on".',
  },
  {
    id: 'PREP-TRANS-MENTION-001',
    category: 'PREP',
    tier: 'tier2-syntax',
    priority: 89,
    description: 'Prune redundant preposition "about" after direct transitive verb "mention".',
    match: { type: 'dependency_pattern', relation: 'transitive_verb_spurious_prep' },
    replacement: '$1',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [{ input: 'She mentioned about the budget.', expected: 'She mentioned the budget.' }],
      negative: [{ input: 'There was no mention about the budget.', expected: 'There was no mention about the budget.' }],
    },
    provenance: 'Transitive verb "mention" takes a direct nominal or clausal object.',
  },
  {
    id: 'PREP-TRANS-AWAIT-001',
    category: 'PREP',
    tier: 'tier1-local',
    priority: 90,
    description: 'Prune redundant preposition "for" after direct transitive verb "await".',
    match: {
      type: 'regex',
      pattern: '\\b(await|awaits|awaited|awaiting)\\s+for\\b',
      caseInsensitive: true,
    },
    replacement: '$1',
    confidence: 0.99,
    autoApply: true,
    enabled: true,
    requires: ['local_regex'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [{ input: 'We are awaiting for your response.', expected: 'We are awaiting your response.' }],
      negative: [{ input: 'We are waiting for your response.', expected: 'We are waiting for your response.' }],
    },
    provenance: '"Await" is strictly transitive without "for".',
  },
  {
    id: 'PREP-TRANS-INVESTIGATE-001',
    category: 'PREP',
    tier: 'tier1-local',
    priority: 90,
    description: 'Prune redundant preposition "into" after direct transitive verb "investigate".',
    match: {
      type: 'regex',
      pattern: '\\b(investigate|investigates|investigated|investigating)\\s+into\\b',
      caseInsensitive: true,
    },
    replacement: '$1',
    confidence: 0.99,
    autoApply: true,
    enabled: true,
    requires: ['local_regex'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [{ input: 'The committee will investigate into the delay.', expected: 'The committee will investigate the delay.' }],
      negative: [{ input: 'An investigation into the delay began.', expected: 'An investigation into the delay began.' }],
    },
    provenance: 'Verb "investigate" takes direct object; noun "investigation" takes "into".',
  },
  {
    id: 'PREP-TRANS-REQUEST-001',
    category: 'PREP',
    tier: 'tier2-syntax',
    priority: 89,
    description: 'Prune redundant preposition "for" after finite transitive verb "request" (preserving noun "a request for").',
    match: { type: 'dependency_pattern', relation: 'transitive_verb_spurious_prep' },
    replacement: '$1',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [{ input: 'The team requested for additional funding.', expected: 'The team requested additional funding.' }],
      negative: [{ input: 'The team submitted a request for additional funding.', expected: 'The team submitted a request for additional funding.' }],
    },
    provenance: 'Verb "request" takes a direct object without "for".',
  },
  {
    id: 'PREP-TRANS-REGRET-001',
    category: 'PREP',
    tier: 'tier2-syntax',
    priority: 89,
    description: 'Prune redundant preposition "about" after verb "regret" (preserving noun "regret about").',
    match: { type: 'dependency_pattern', relation: 'transitive_verb_spurious_prep' },
    replacement: '$1',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [{ input: 'They regretted about the oversight.', expected: 'They regretted the oversight.' }],
      negative: [{ input: 'They expressed deep regret about the oversight.', expected: 'They expressed deep regret about the oversight.' }],
    },
    provenance: 'Transitive verb "regret" takes direct object.',
  },
  {
    id: 'PREP-TRANS-COMPRISE-001',
    category: 'PREP',
    tier: 'tier1-local',
    priority: 91,
    description: 'Prune erroneous preposition "of" after active verb "comprise".',
    match: {
      type: 'regex',
      pattern: '\\b(comprise|comprises|comprising)\\s+of\\b',
      caseInsensitive: true,
    },
    replacement: '$1',
    confidence: 0.99,
    autoApply: true,
    enabled: true,
    requires: ['local_regex'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [{ input: 'The system comprises of three phases.', expected: 'The system comprises three phases.' }],
      negative: [{ input: 'The system comprises three phases.', expected: 'The system comprises three phases.' }],
    },
    provenance: 'The whole comprises the parts (no "of").',
  },
  {
    id: 'PREP-TRANS-ENTER-001',
    category: 'PREP',
    tier: 'tier2-syntax',
    priority: 89,
    description: 'Prune spurious "into" after "enter" before physical places or markets (preserving idioms like "enter into an agreement").',
    match: { type: 'dependency_pattern', relation: 'transitive_verb_spurious_prep' },
    replacement: '$1 $2',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [{ input: 'The CEO entered into the boardroom.', expected: 'The CEO entered the boardroom.' }],
      negative: [{ input: 'The firms entered into an agreement.', expected: 'The firms entered into an agreement.' }],
    },
    provenance: 'Spatial "enter" is directly transitive without "into".',
  },
  {
    id: 'PREP-TRANS-CONTACT-001',
    category: 'PREP',
    tier: 'tier2-syntax',
    priority: 89,
    description: 'Prune spurious "with" after transitive verb "contact" (preserving noun phrases like "in contact with").',
    match: { type: 'dependency_pattern', relation: 'transitive_verb_spurious_prep' },
    replacement: '$1 $2',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [{ input: 'Please contact with the director today.', expected: 'Please contact the director today.' }],
      negative: [{ input: 'She stayed in contact with the director.', expected: 'She stayed in contact with the director.' }],
    },
    provenance: 'Verb "contact" takes a direct object without "with".',
  },
  {
    id: 'PREP-TRANS-REACH-001',
    category: 'PREP',
    tier: 'tier2-syntax',
    priority: 89,
    description: 'Prune spurious "at" after transitive verb "reach" before destinations/conclusions (preserving "at least/most/random").',
    match: { type: 'dependency_pattern', relation: 'transitive_verb_spurious_prep' },
    replacement: '$1 $2',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [{ input: 'The team reached at the office early.', expected: 'The team reached the office early.' }],
      negative: [{ input: 'Scores can reach at least ninety percent.', expected: 'Scores can reach at least ninety percent.' }],
    },
    provenance: '"Reach" takes direct destination/milestone object.',
  },
  {
    id: 'PREP-COPE-UP-001',
    category: 'PREP',
    tier: 'tier1-local',
    priority: 91,
    description: 'Correct non-standard phrasal verb "cope up with" to "cope with".',
    match: {
      type: 'regex',
      pattern: '\\b(cope|copes|coped|coping)\\s+up\\s+with\\b',
      caseInsensitive: true,
    },
    replacement: '$1 with',
    confidence: 0.99,
    autoApply: true,
    enabled: true,
    requires: ['local_regex'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [{ input: 'The staff struggled to cope up with the workload.', expected: 'The staff struggled to cope with the workload.' }],
      negative: [{ input: 'The staff struggled to cope with the workload.', expected: 'The staff struggled to cope with the workload.' }],
    },
    provenance: 'Standard English idiomatic verb is "cope with".',
  },
  {
    id: 'PREP-RETURN-BACK-001',
    category: 'PREP',
    tier: 'tier1-local',
    priority: 89,
    description: 'Prune pleonastic "back" after verb "return".',
    match: {
      type: 'regex',
      pattern: '(?<!\\bin\\s+)\\b(return|returns|returned|returning)\\s+back\\b',
      caseInsensitive: true,
    },
    replacement: '$1',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['local_regex'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [{ input: 'They returned back to the office.', expected: 'They returned to the office.' }],
      negative: [{ input: 'They returned to the office.', expected: 'They returned to the office.' }],
    },
    provenance: 'Verb "return" already encodes backward motion.',
  },

  // ---- Usage Solecisms ----
  {
    id: 'USAGE-COMPRISE-001',
    category: 'USAGE',
    tier: 'tier1-local',
    priority: 92,
    description: 'Correct passive usage solecism "be comprised of" to standard "be composed of".',
    match: {
      type: 'regex',
      pattern: '\\b(is|are|was|were|be|being|been)\\s+comprised\\s+of\\b',
      caseInsensitive: true,
    },
    replacement: '$1 composed of',
    confidence: 0.99,
    autoApply: true,
    enabled: true,
    requires: ['local_regex'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [{ input: 'The system was comprised of three phases.', expected: 'The system was composed of three phases.' }],
      negative: [{ input: 'The system was composed of three phases.', expected: 'The system was composed of three phases.' }],
    },
    provenance: 'Whole composes parts / is composed of parts ("comprise" is active, not "comprised of").',
  },
  {
    id: 'USAGE-IRREGARDLESS-001',
    category: 'USAGE',
    tier: 'tier1-local',
    priority: 93,
    description: 'Correct non-standard double-negative adverb "irregardless" to "regardless".',
    match: {
      type: 'regex',
      pattern: '\\birregardless\\b',
      caseInsensitive: true,
    },
    replacement: 'regardless',
    confidence: 0.995,
    autoApply: true,
    enabled: true,
    requires: ['local_regex'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [{ input: 'Irregardless of cost, we must proceed.', expected: 'Regardless of cost, we must proceed.' }],
      negative: [{ input: 'Regardless of cost, we must proceed.', expected: 'Regardless of cost, we must proceed.' }],
    },
    provenance: 'Standard formal English lexical usage.',
  },
  {
    id: 'USAGE-SUPPOSED-TO-001',
    category: 'USAGE',
    tier: 'tier1-local',
    priority: 92,
    description: 'Correct missing participial "-d" in semi-modal "be suppose to" -> "be supposed to".',
    match: {
      type: 'regex',
      pattern: '\\b(is|are|was|were|am)\\s+suppose\\s+to\\b',
      caseInsensitive: true,
    },
    replacement: '$1 supposed to',
    confidence: 0.99,
    autoApply: true,
    enabled: true,
    requires: ['local_regex'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [{ input: 'The proposal was suppose to pass.', expected: 'The proposal was supposed to pass.' }],
      negative: [{ input: 'The proposal was supposed to pass.', expected: 'The proposal was supposed to pass.' }],
    },
    provenance: 'Deontic passive construction requires participial "supposed".',
  },

  // ---- Collocations & Uncountable Nouns ----
  {
    id: 'COLLOC-RESEARCH-MAKE-001',
    category: 'COLLOC',
    tier: 'tier2-syntax',
    priority: 92,
    description: 'Correct non-idiomatic "make a research" to standard collocation "conduct research".',
    match: { type: 'dependency_pattern', relation: 'light_verb_uncountable_collocation' },
    replacement: 'conduct research',
    confidence: 0.99,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [{ input: 'The staff made a research on competitors.', expected: 'The staff conducted research on competitors.' }],
      negative: [{ input: 'The staff conducted research on competitors.', expected: 'The staff conducted research on competitors.' }],
    },
    provenance: '"Research" is uncountable and collocates with "conduct" or "do", not "make a".',
  },
  {
    id: 'COLLOC-RESEARCH-ART-001',
    category: 'COLLOC',
    tier: 'tier1-local',
    priority: 91,
    description: 'Remove erroneous indefinite article before uncountable "research" after research verbs.',
    match: {
      type: 'regex',
      pattern: '\\b(do|does|did|doing|conduct|conducts|conducted|conducting|undertake|undertakes|undertaken|undertaking|perform|performs|performed|performing|carry\\s+out|carries\\s+out|carried\\s+out|carrying\\s+out)\\s+(?:a|an)\\s+research\\b',
      caseInsensitive: true,
    },
    replacement: '$1 research',
    confidence: 0.99,
    autoApply: true,
    enabled: true,
    requires: ['local_regex'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [{ input: 'They conducted a research on climate.', expected: 'They conducted research on climate.' }],
      negative: [{ input: 'They conducted a research study on climate.', expected: 'They conducted a research study on climate.' }],
    },
    provenance: 'Uncountable mass noun "research" takes zero indefinite article.',
  },
  {
    id: 'COLLOC-LIGHTVERB-DO-MAKE-001',
    category: 'COLLOC',
    tier: 'tier2-syntax',
    priority: 91,
    description: 'Correct non-idiomatic "do/did + decision/mistake/effort/progress" light-verb collocations to "make/made".',
    match: { type: 'dependency_pattern', relation: 'light_verb_do_make_collocation' },
    replacement: 'made a decision / made progress',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [
        { input: 'The committee did a decision yesterday.', expected: 'The committee made a decision yesterday.' },
        { input: 'The team made a progress today.', expected: 'The team made progress today.' },
      ],
      negative: [
        { input: 'The committee made a decision yesterday.', expected: 'The committee made a decision yesterday.' },
      ],
    },
    provenance: 'Standard English light-verb collocation selection.',
  },
  {
    id: 'COLLOC-UNCOUNT-ART-001',
    category: 'COLLOC',
    tier: 'tier2-syntax',
    priority: 91,
    description: 'Remove erroneous indefinite article before uncountable mass nouns (advice, feedback, information, evidence, equipment, software).',
    match: { type: 'dependency_pattern', relation: 'uncountable_noun_indefinite_article' },
    replacement: '$1 $2',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [{ input: 'She gave an advice to the team.', expected: 'She gave advice to the team.' }],
      negative: [{ input: 'She gave a feedback session to the team.', expected: 'She gave a feedback session to the team.' }],
    },
    provenance: 'Uncountable mass nouns do not take singular indefinite articles unless heading a countable noun.',
  },

  // ---- Convoluted Expletive & Double Passive Simplification ----
  {
    id: 'SYN-EXPLETIVE-PASSIVE-001',
    category: 'SYN',
    tier: 'tier2-syntax',
    priority: 95,
    description: 'Convert bureaucratic expletive passive ("it was decided by X that") to direct active voice ("X decided that").',
    match: { type: 'dependency_pattern', relation: 'expletive_passive_agent_that' },
    replacement: '[Agent] [Verb] that',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [
        {
          input: 'And it was decided by the steering committee that the proposal was acceptable.',
          expected: 'And the steering committee decided that the proposal was acceptable.',
        },
      ],
      negative: [
        {
          input: 'The steering committee decided that the proposal was acceptable.',
          expected: 'The steering committee decided that the proposal was acceptable.',
        },
      ],
    },
    provenance: 'Active-voice agency restoration from dummy-it passive clauses.',
  },
  {
    id: 'SYN-PASSIVE-TOBE-BY-001',
    category: 'SYN',
    tier: 'tier2-syntax',
    priority: 94,
    description: 'Convert convoluted passive infinitive ("X was to be reviewed by Y") to direct active voice ("Y would review X").',
    match: { type: 'dependency_pattern', relation: 'passive_to_be_agent_by' },
    replacement: '[Agent] would [Verb] [Patient]',
    confidence: 0.98,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [
        {
          input: 'The proposal was to be reviewed by the director.',
          expected: 'The director would review the proposal.',
        },
      ],
      negative: [
        {
          input: 'The director would review the proposal.',
          expected: 'The director would review the proposal.',
        },
      ],
    },
    provenance: 'Direct active voice simplification for prospective agentive passives.',
  },

  // ---- Staccato Repetitive Sentence Combining ----
  {
    id: 'SYN-STACCATO-MERGE-001',
    category: 'SYN',
    tier: 'tier2-syntax',
    priority: 93,
    description: 'Combine 3+ consecutive choppy sentences sharing an identical "[Subject] [Copula] [Adjective]" pattern into one parallel series.',
    match: { type: 'dependency_pattern', relation: 'staccato_copula_sentence_merge' },
    replacement: '[Subject] [Copula] [Adj1], [Adj2], and [Adj3].',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer', 'segmenter'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [
        {
          input: 'It is essential. It is urgent. It is unavoidable.',
          expected: 'It is essential, urgent, and unavoidable.',
        },
      ],
      negative: [
        {
          input: 'It is essential. However, it takes time.',
          expected: 'It is essential. However, it takes time.',
        },
      ],
    },
    provenance: 'Syntactic sentence combining for repetitive staccato predications.',
  },

  // ---- Conciseness, Pleonasms & AI-Cliché Tightening ----
  {
    id: 'CONCISE-EXPLETIVE-NOTE-001',
    category: 'CONCISE',
    tier: 'tier2-syntax',
    priority: 92,
    description: 'Remove throat-clearing expletive hedges ("It is important to note that", "It should be noted that", "It goes without saying that").',
    match: { type: 'dependency_pattern', relation: 'expletive_hedging_opener' },
    replacement: '[Direct Clause]',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [
        {
          input: 'It is important to note that the system was stable.',
          expected: 'The system was stable.',
        },
      ],
      negative: [
        {
          input: 'Why is it important to note that the system was stable?',
          expected: 'Why is it important to note that the system was stable?',
        },
      ],
    },
    provenance: 'Eliminate redundant dummy-it metadiscourse openers.',
  },
  {
    id: 'CONCISE-IN-ORDER-TO-001',
    category: 'CONCISE',
    tier: 'tier2-syntax',
    priority: 88,
    description: 'Tighten wordy infinitive phrase "in order to [verb]" to "to [verb]" (preserving "in order not to" and literal ordering).',
    match: { type: 'dependency_pattern', relation: 'wordy_in_order_to' },
    replacement: 'to $1',
    confidence: 0.98,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [
        { input: 'He reviewed the timeline in order to complete the work.', expected: 'He reviewed the timeline to complete the work.' },
      ],
      negative: [
        { input: 'He left early in order not to miss the train.', expected: 'He left early in order not to miss the train.' },
      ],
    },
    provenance: 'Concise infinitive of purpose.',
  },
  {
    id: 'CONCISE-REGARDING-001',
    category: 'CONCISE',
    tier: 'tier1-local',
    priority: 90,
    description: 'Replace wordy prepositional phrases "with regard(s) to", "in regard(s) to", and "with respect to" with "regarding".',
    match: {
      type: 'regex',
      pattern: '\\b(?:(?:with|in)\\s+regards?\\s+to|with\\s+respect\\s+to)\\b',
      caseInsensitive: true,
    },
    replacement: 'regarding',
    confidence: 0.99,
    autoApply: true,
    enabled: true,
    requires: ['local_regex'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [
        { input: 'With regard to the budget, we agreed.', expected: 'Regarding the budget, we agreed.' },
      ],
      negative: [
        { input: 'Regarding the budget, we agreed.', expected: 'Regarding the budget, we agreed.' },
      ],
    },
    provenance: 'Concise prepositional phrasing.',
  },
  {
    id: 'CONCISE-IN-THE-EVENT-001',
    category: 'CONCISE',
    tier: 'tier1-local',
    priority: 90,
    description: 'Replace wordy conditional conjunction "in the event that" with "if".',
    match: {
      type: 'regex',
      pattern: '\\bin\\s+the\\s+event\\s+that\\b',
      caseInsensitive: true,
    },
    replacement: 'if',
    confidence: 0.99,
    autoApply: true,
    enabled: true,
    requires: ['local_regex'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [{ input: 'In the event that the deadline moves, tell us.', expected: 'If the deadline moves, tell us.' }],
      negative: [{ input: 'If the deadline moves, tell us.', expected: 'If the deadline moves, tell us.' }],
    },
    provenance: 'Concise conditional subordinator.',
  },
  {
    id: 'CONCISE-ABILITY-001',
    category: 'CONCISE',
    tier: 'tier2-syntax',
    priority: 90,
    description: 'Replace circumlocution "has/have/had the ability to [verb]" with modal "can/could [verb]".',
    match: { type: 'dependency_pattern', relation: 'wordy_has_ability_to' },
    replacement: 'can / could',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [{ input: 'The team has the ability to adapt.', expected: 'The team can adapt.' }],
      negative: [{ input: 'They need to develop the ability to adapt.', expected: 'They need to develop the ability to adapt.' }],
    },
    provenance: 'Concise modal expression of capability.',
  },
  {
    id: 'CONCISE-BECAUSE-001',
    category: 'CONCISE',
    tier: 'tier1-local',
    priority: 91,
    description: 'Replace wordy causal phrases "due to the fact that", "owing to the fact that", "on account of the fact that", "in light of the fact that" with "because".',
    match: {
      type: 'regex',
      pattern: '\\b(?:due\\s+to|owing\\s+to|on\\s+account\\s+of|because\\s+of|in\\s+light\\s+of)\\s+the\\s+fact\\s+that\\b',
      caseInsensitive: true,
    },
    replacement: 'because',
    confidence: 0.99,
    autoApply: true,
    enabled: true,
    requires: ['local_regex'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [{ input: 'Due to the fact that the tools are new, test them.', expected: 'Because the tools are new, test them.' }],
      negative: [{ input: 'Because the tools are new, test them.', expected: 'Because the tools are new, test them.' }],
    },
    provenance: 'Eliminate bureaucratic "the fact that" circumlocution.',
  },
  {
    id: 'CONCISE-NEEDLESS-001',
    category: 'CONCISE',
    tier: 'tier2-syntax',
    priority: 92,
    description: 'Remove pleonastic filler "needless to say" cleanly along with surrounding parenthetical punctuation.',
    match: { type: 'dependency_pattern', relation: 'pleonastic_needless_to_say' },
    replacement: '',
    confidence: 0.99,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [
        { input: 'Because the tools are new, needless to say, they require testing.', expected: 'Because the tools are new, they require testing.' },
        { input: 'Needless to say, the tools require testing.', expected: 'The tools require testing.' },
      ],
      negative: [
        { input: 'The tools require testing.', expected: 'The tools require testing.' },
      ],
    },
    provenance: 'Pleonastic metadiscourse deletion.',
  },
  {
    id: 'CONCISE-PLETHORA-001',
    category: 'CONCISE',
    tier: 'tier2-syntax',
    priority: 90,
    description: 'Replace overblown quantifier cliché "a plethora of" with concise "numerous" (count nouns) or "ample" (mass nouns).',
    match: { type: 'dependency_pattern', relation: 'cliche_plethora_of' },
    replacement: 'numerous / ample',
    confidence: 0.98,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [{ input: 'The committee allocated a plethora of resources.', expected: 'The committee allocated numerous resources.' }],
      negative: [{ input: 'The committee allocated numerous resources.', expected: 'The committee allocated numerous resources.' }],
    },
    provenance: 'Direct plain-language quantifier.',
  },
  {
    id: 'CONCISE-ULTIMATELY-001',
    category: 'CONCISE',
    tier: 'tier1-local',
    priority: 90,
    description: 'Replace cliché discourse filler "at the end of the day," with "ultimately," (preserving literal time-of-day references).',
    match: {
      type: 'regex',
      pattern: '\\bat\\s+the\\s+end\\s+of\\s+the\\s+day(?=,)',
      caseInsensitive: true,
    },
    replacement: 'ultimately',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['local_regex'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [{ input: 'At the end of the day, the results speak for themselves.', expected: 'Ultimately, the results speak for themselves.' }],
      negative: [{ input: 'The technicians locked the lab at the end of the day.', expected: 'The technicians locked the lab at the end of the day.' }],
    },
    provenance: 'Cliché idiom replacement with precise adverb.',
  },
  {
    id: 'CONCISE-CLICHE-DELVE-001',
    category: 'CONCISE',
    tier: 'tier2-syntax',
    priority: 90,
    description: 'Replace overused AI cliché "delve into" with clear direct verb "examine".',
    match: { type: 'dependency_pattern', relation: 'cliche_delve_into' },
    replacement: 'examine',
    confidence: 0.98,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [{ input: 'This framework allows the team to delve into the complexities.', expected: 'This framework allows the team to examine the complexities.' }],
      negative: [{ input: 'This framework allows the team to examine the complexities.', expected: 'This framework allows the team to examine the complexities.' }],
    },
    provenance: 'AI boilerplate elimination.',
  },
  {
    id: 'CONCISE-CLICHE-PIVOTAL-001',
    category: 'CONCISE',
    tier: 'tier2-syntax',
    priority: 90,
    description: 'Tighten cliché "play a pivotal/crucial/vital/key role in [gerund]" to direct "help [base verb]".',
    match: { type: 'dependency_pattern', relation: 'cliche_pivotal_role_in' },
    replacement: 'help(s) [verb]',
    confidence: 0.98,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [{ input: 'The platform plays a pivotal role in shaping digital finance.', expected: 'The platform helps shape digital finance.' }],
      negative: [{ input: 'She plays a supporting role in the committee.', expected: 'She plays a supporting role in the committee.' }],
    },
    provenance: 'Verbose AI boilerplate tightening.',
  },
  {
    id: 'CONCISE-PLEONASM-TIME-001',
    category: 'CONCISE',
    tier: 'tier1-local',
    priority: 88,
    description: 'Replace bureaucratic pleonasms ("at this point in time", "until such time as", "each and every", "for all intents and purposes", "in close proximity to").',
    match: { type: 'dependency_pattern', relation: 'wordy_pleonastic_phrases' },
    replacement: 'now / until / each / essentially / near',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [{ input: 'At this point in time, each and every step is clear.', expected: 'Now, each step is clear.' }],
      negative: [{ input: 'Now, each step is clear.', expected: 'Now, each step is clear.' }],
    },
    provenance: 'Plain-English conciseness.',
  },

  // ---- Serial / Oxford Comma ----
  {
    id: 'PUN-OXFORD-001',
    category: 'PUN',
    tier: 'tier2-syntax',
    priority: 87,
    description: 'Insert missing Oxford/serial comma before "and/or" in 3+ item parallel noun/adjective series (avoiding appositives and clause commas).',
    match: { type: 'dependency_pattern', relation: 'serial_oxford_comma' },
    replacement: ', $1',
    confidence: 0.98,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [
        {
          input: 'The team reviewed the budget, the schedule and the staffing plan.',
          expected: 'The team reviewed the budget, the schedule, and the staffing plan.',
        },
        {
          input: 'The report covered several topics, including deadlines, budgets and staffing.',
          expected: 'The report covered several topics, including deadlines, budgets, and staffing.',
        },
      ],
      negative: [
        {
          input: 'After entering the room, she opened the report and signed it.',
          expected: 'After entering the room, she opened the report and signed it.',
        },
        {
          input: 'Dr. Smith, the director and the lead engineer, arrived.',
          expected: 'Dr. Smith, the director and the lead engineer, arrived.',
        },
      ],
    },
    provenance: 'Consistent serial comma clarity in formal and academic prose.',
  },

  // ---- Object Pronoun Case, Preposition + Gerund, Progressive Be + Base Verb, Pleonastic Etc. ----
  {
    id: 'PRON-OBJ-CASE-001',
    category: 'PRON',
    tier: 'tier2-syntax',
    priority: 95,
    description: 'Correct subject pronouns (I/he/she/we/they) to object case (me/him/her/us/them) when governed by a transitive verb or preposition.',
    match: { type: 'dependency_pattern', relation: 'object_pronoun_case' },
    replacement: 'me / him / her / us / them',
    confidence: 0.99,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [
        { input: 'I invite you to join I in exploring the topic.', expected: 'I invite you to join me in exploring the topic.' },
        { input: 'Please send the draft to he and she.', expected: 'Please send the draft to him and her.' },
      ],
      negative: [
        { input: 'They told us he arrived early.', expected: 'They told us he arrived early.' },
        { input: 'I know I should verify the figures.', expected: 'I know I should verify the figures.' },
      ],
    },
    provenance: 'Objective case required for direct verbal and prepositional complements.',
  },
  {
    id: 'PREP-GERUND-001',
    category: 'PREP',
    tier: 'tier2-syntax',
    priority: 94,
    description: 'Convert bare infinitive verb forms following prepositions (e.g., "in explore", "by compare", "without examine") to gerund "-ing" complements.',
    match: { type: 'dependency_pattern', relation: 'preposition_gerund_complement' },
    replacement: '[Preposition] [Verb-ing]',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [
        { input: 'Thank you for joining me in explore the effects.', expected: 'Thank you for joining me in exploring the effects.' },
        { input: 'They improved accuracy by compare the models.', expected: 'They improved accuracy by comparing the models.' },
      ],
      negative: [
        { input: 'We left early in order to arrive on time.', expected: 'We left early in order to arrive on time.' },
        { input: 'They worked in support of the policy.', expected: 'They worked in support of the policy.' },
      ],
    },
    provenance: 'Prepositions govern nominalized gerund (-ing) verb complements.',
  },
  {
    id: 'AUX-BE-PROG-001',
    category: 'MODAL',
    tier: 'tier2-syntax',
    priority: 95,
    description: 'Convert bare base verbs following progressive auxiliary "am/is/are/was/were" (e.g., "I am compare") to present participle "-ing" forms.',
    match: { type: 'dependency_pattern', relation: 'progressive_be_participle' },
    replacement: '[am/is/are/was/were] [Verb-ing]',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [
        { input: 'To drive this point home, I am compare the effects.', expected: 'To drive this point home, I am comparing the effects.' },
        { input: 'She is analyze the dataset now.', expected: 'She is analyzing the dataset now.' },
      ],
      negative: [
        { input: 'What we need to do is compare the effects.', expected: 'What we need to do is compare the effects.' },
        { input: 'The result is clear and ready.', expected: 'The result is clear and ready.' },
      ],
    },
    provenance: 'Progressive aspect auxiliary "be" requires present participle "-ing".',
  },
  {
    id: 'CONCISE-ETC-PLEONASM-001',
    category: 'CONCISE',
    tier: 'tier2-syntax',
    priority: 91,
    description: 'Remove redundant ", etc." after non-exhaustive introducers ("such as", "including", "for example", "e.g.") or closing ", and [Item]".',
    match: { type: 'dependency_pattern', relation: 'redundant_etc_in_nonexhaustive_list' },
    replacement: '[List without etc.]',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer'],
    guards: ['not_inside_protected_span'],
    examples: {
      positive: [
        {
          input: 'LLMs such as GPT 4o, Copilot, and Claude, etc. affect writing.',
          expected: 'LLMs such as GPT 4o, Copilot, and Claude affect writing.',
        },
        {
          input: 'Examples include tools such as A, B, and C, etc.',
          expected: 'Examples include tools such as A, B, and C.',
        },
      ],
      negative: [
        {
          input: 'The kit includes cables, adapters, batteries, etc.',
          expected: 'The kit includes cables, adapters, batteries, etc.',
        },
      ],
    },
    provenance: '"Such as" / "including" / "and [last item]" already mark list scope without "etc.".',
  },
];

// ============================================================================
// CONTEXTUAL ANALYZER FOR STYLE, COLLOCATIONS, PASSIVES, OXFORD COMMA & MERGE
// ============================================================================

function makeCand(
  ruleId: string,
  start: number,
  end: number,
  original: string,
  replacement: string,
  category: string,
  confidence: number,
  rationale: string,
  provenance: string
): CorrectionCandidate {
  return {
    ruleId,
    start,
    end,
    original,
    replacement,
    confidence,
    category,
    rationale,
    provenance,
  };
}

function containsFiniteVerb(phrase: string): boolean {
  const words = phrase.toLowerCase().match(/[a-z']+/g) || [];
  for (const w of words) {
    if (FINITE_VERB_OR_AUX.has(w)) return true;
  }
  return false;
}

const CLAUSE_INTRODUCER_HEADS = new Set([
  'after', 'before', 'while', 'when', 'since', 'because', 'although', 'though',
  'unless', 'until', 'if', 'as', 'despite', 'having', 'walking', 'assuming',
  'considering', 'regarding', 'however', 'moreover', 'furthermore', 'therefore',
  'ultimately', 'unfortunately', 'meanwhile', 'initially', 'finally', 'instead',
  'due', 'owing', 'given', 'during', 'following',
]);

export function analyzeStyleAndCollocations(fullText: string): CorrectionCandidate[] {
  const candidates: CorrectionCandidate[] = [];

  // --------------------------------------------------------------------------
  // 1. Guarded Transitive Verbs + Spurious Prepositions
  // --------------------------------------------------------------------------

  // 1a. stress/stresses/stressed/stressing on (guard against nominal "place stress on", "heavy stress on")
  {
    const rx = /\b(stress|stresses|stressed|stressing)\s+on\b/gi;
    let m: RegExpExecArray | null;
    while ((m = rx.exec(fullText)) !== null) {
      const before = fullText.slice(Math.max(0, m.index - 35), m.index);
      if (/\b(?:place|places|placed|placing|put|puts|putting|lay|lays|laid|great|heavy|much|no|less|high|low|mental|financial|undue|special|extra|the|a|an|of|under|with|without|to)\s+$/i.test(before)) {
        continue;
      }
      candidates.push(
        makeCand(
          'PREP-TRANS-STRESS-001',
          m.index,
          m.index + m[0].length,
          m[0],
          m[1],
          'PREP',
          0.985,
          'Verb "stress" is direct transitive and takes no preposition "on".',
          'IdiomOptima Transitive Frame Analyzer.'
        )
      );
    }
  }

  // 1b. mention(s|ed|ing) about (guard against noun "a/the/no mention about")
  {
    const rx = /\b(mention|mentions|mentioned|mentioning)\s+about\b/gi;
    let m: RegExpExecArray | null;
    while ((m = rx.exec(fullText)) !== null) {
      const before = fullText.slice(Math.max(0, m.index - 25), m.index);
      if (/\b(?:a|an|the|no|any|some|brief|make|made|making)\s+$/i.test(before)) continue;
      candidates.push(
        makeCand(
          'PREP-TRANS-MENTION-001',
          m.index,
          m.index + m[0].length,
          m[0],
          m[1],
          'PREP',
          0.985,
          'Verb "mention" governs a direct object without "about".',
          'IdiomOptima Transitive Frame Analyzer.'
        )
      );
    }
  }

  // 1c. request(s|ed|ing) for (guard against noun "a/the/formal request for")
  {
    const rx = /\b(request|requests|requested|requesting)\s+for\b/gi;
    let m: RegExpExecArray | null;
    while ((m = rx.exec(fullText)) !== null) {
      const before = fullText.slice(Math.max(0, m.index - 35), m.index);
      if (/\b(?:a|an|the|this|that|these|those|my|our|their|his|her|your|its|no|any|every|formal|written|special|urgent|official|subsequent|submit|submitted|send|sent|make|made|receive|received|approve|approved|deny|denied|of|on|upon)\s+$/i.test(before)) {
        continue;
      }
      candidates.push(
        makeCand(
          'PREP-TRANS-REQUEST-001',
          m.index,
          m.index + m[0].length,
          m[0],
          m[1],
          'PREP',
          0.985,
          'Transitive verb "request" takes a direct object without "for".',
          'IdiomOptima Transitive Frame Analyzer.'
        )
      );
    }
  }

  // 1d. regret(s|ted|ting) about
  {
    const rx = /\b(regret|regrets|regretted|regretting)\s+about\b/gi;
    let m: RegExpExecArray | null;
    while ((m = rx.exec(fullText)) !== null) {
      const before = fullText.slice(Math.max(0, m.index - 25), m.index);
      if (/\b(?:no|any|much|deep|great|sincere|a|the|express|expressed|expressing|with|without)\s+$/i.test(before)) {
        continue;
      }
      candidates.push(
        makeCand(
          'PREP-TRANS-REGRET-001',
          m.index,
          m.index + m[0].length,
          m[0],
          m[1],
          'PREP',
          0.985,
          'Transitive verb "regret" takes a direct object without "about".',
          'IdiomOptima Transitive Frame Analyzer.'
        )
      );
    }
  }

  // 1e. enter(s|ed|ing) into [physical place / market]
  {
    const rx =
      /\b(enter|enters|entered|entering)\s+into\s+((?:the|a|an|this|that|our|their|his|her)\s+(?:room|boardroom|building|office|house|hall|lab|laboratory|auditorium|classroom|facility|market|stadium|theater|theatre|airport|station|venue))\b/gi;
    let m: RegExpExecArray | null;
    while ((m = rx.exec(fullText)) !== null) {
      candidates.push(
        makeCand(
          'PREP-TRANS-ENTER-001',
          m.index,
          m.index + m[0].length,
          m[0],
          `${m[1]} ${m[2]}`,
          'PREP',
          0.985,
          'Spatial "enter" governs a direct location noun phrase without "into".',
          'IdiomOptima Transitive Frame Analyzer.'
        )
      );
    }
  }

  // 1f. contact(s|ed|ing) with [human/org/pronoun]
  {
    const rx =
      /\b(contact|contacts|contacted|contacting)\s+with\s+(me|him|her|them|us|you|the\s+(?:team|staff|director|manager|client|clients|committee|board|department|office|author|authors|editor|editors|lead|researcher|researchers))\b/gi;
    let m: RegExpExecArray | null;
    while ((m = rx.exec(fullText)) !== null) {
      const before = fullText.slice(Math.max(0, m.index - 35), m.index);
      if (/\b(?:in|out\s+of|have|has|had|having|make|made|making|keep|kept|lose|lost|maintain|eye|close|direct|physical|personal|regular|daily|no|any)\s+$/i.test(before)) {
        continue;
      }
      candidates.push(
        makeCand(
          'PREP-TRANS-CONTACT-001',
          m.index,
          m.index + m[0].length,
          m[0],
          `${m[1]} ${m[2]}`,
          'PREP',
          0.985,
          'Transitive verb "contact" takes a direct object without "with".',
          'IdiomOptima Transitive Frame Analyzer.'
        )
      );
    }
  }

  // 1g. reach(es|ed|ing) at [place / conclusion]
  {
    const rx =
      /\b(reach|reaches|reached|reaching)\s+at\s+((?:the|a|an|this|that|our|their)\s+(?:office|airport|station|building|room|hotel|destination|conclusion|decision|agreement|consensus|venue|site|laboratory|lab))\b/gi;
    let m: RegExpExecArray | null;
    while ((m = rx.exec(fullText)) !== null) {
      candidates.push(
        makeCand(
          'PREP-TRANS-REACH-001',
          m.index,
          m.index + m[0].length,
          m[0],
          `${m[1]} ${m[2]}`,
          'PREP',
          0.985,
          'Transitive verb "reach" takes a direct destination or conclusion without "at".',
          'IdiomOptima Transitive Frame Analyzer.'
        )
      );
    }
  }

  // --------------------------------------------------------------------------
  // 2. Light-Verb + Uncountable / Collocation Fixes
  // --------------------------------------------------------------------------

  // 2a. make/makes/made/making a research -> conduct/conducts/conducted/conducting research
  {
    const rx = /\b(make|makes|made|making)\s+(?:a|an)\s+research\b/gi;
    let m: RegExpExecArray | null;
    while ((m = rx.exec(fullText)) !== null) {
      const vLower = m[1].toLowerCase();
      const map: Record<string, string> = {
        make: 'conduct',
        makes: 'conducts',
        made: 'conducted',
        making: 'conducting',
      };
      const replacementVerb = preserveInitialCase(m[1], map[vLower] || 'conduct');
      candidates.push(
        makeCand(
          'COLLOC-RESEARCH-MAKE-001',
          m.index,
          m.index + m[0].length,
          m[0],
          `${replacementVerb} research`,
          'COLLOC',
          0.99,
          'Uncountable "research" collocates with "conduct" rather than "make a".',
          'IdiomOptima Collocation Engine.'
        )
      );
    }
  }

  // 2b. do/does/did/doing + a/an + decision/mistake/effort/... & progress
  {
    const rx =
      /\b(do|does|did|doing)\s+(a|an)\s+(decision|mistake|effort|improvement|contribution|promise|attempt|compromise|suggestion|difference)\b/gi;
    let m: RegExpExecArray | null;
    while ((m = rx.exec(fullText)) !== null) {
      const vLower = m[1].toLowerCase();
      const map: Record<string, string> = {
        do: 'make',
        does: 'makes',
        did: 'made',
        doing: 'making',
      };
      const replacementVerb = preserveInitialCase(m[1], map[vLower] || 'make');
      candidates.push(
        makeCand(
          'COLLOC-LIGHTVERB-DO-MAKE-001',
          m.index,
          m.index + m[0].length,
          m[0],
          `${replacementVerb} ${m[2].toLowerCase()} ${m[3]}`,
          'COLLOC',
          0.985,
          `Noun "${m[3]}" collocates with light verb "make" rather than "do".`,
          'IdiomOptima Collocation Engine.'
        )
      );
    }

    const progRx = /\b(make|makes|made|making|have|has|had|do|does|did|doing)\s+(?:a|an)\s+progress\b/gi;
    while ((m = progRx.exec(fullText)) !== null) {
      const vLower = m[1].toLowerCase();
      const doToMake: Record<string, string> = {
        do: 'make',
        does: 'makes',
        did: 'made',
        doing: 'making',
      };
      const replacementVerb = doToMake[vLower]
        ? preserveInitialCase(m[1], doToMake[vLower])
        : m[1];
      candidates.push(
        makeCand(
          'COLLOC-LIGHTVERB-DO-MAKE-001',
          m.index,
          m.index + m[0].length,
          m[0],
          `${replacementVerb} progress`,
          'COLLOC',
          0.99,
          'Uncountable noun "progress" takes zero indefinite article.',
          'IdiomOptima Collocation Engine.'
        )
      );
    }
  }

  // 2c. give/provide/offer + a/an + uncountable noun (guarded against compound countable heads)
  {
    const rx1 =
      /\b(give|gives|gave|given|giving|offer|offers|offered|offering|provide|provides|provided|providing)\s+(?:a|an)\s+(advice|feedback|evidence|information|guidance|assistance)\b(?!\s+(?:session|sessions|loop|loops|system|systems|letter|letters|column|columns|article|articles|report|reports|tool|tools|sheet|sheets|form|forms|note|notes|document|documents|mechanism|mechanisms|channel|channels|portal|portals|item|items|piece|pieces|packet|packets)\b)/gi;
    let m: RegExpExecArray | null;
    while ((m = rx1.exec(fullText)) !== null) {
      candidates.push(
        makeCand(
          'COLLOC-UNCOUNT-ART-001',
          m.index,
          m.index + m[0].length,
          m[0],
          `${m[1]} ${m[2]}`,
          'COLLOC',
          0.985,
          `Uncountable noun "${m[2]}" does not take an indefinite article.`,
          'IdiomOptima Collocation Engine.'
        )
      );
    }

    const rx2 =
      /\b(buy|buys|bought|purchase|purchases|purchased|need|needs|needed|use|uses|used|lack|lacks|lacked|have|has|had|bring|brings|brought)\s+(?:a|an)\s+(equipment|furniture|luggage|baggage|software|homework)\b(?!\s+(?:item|items|piece|pieces|unit|units|set|sets|kit|kits|package|packages|tool|tools|system|systems|program|programs|application|applications|suite|suites|module|modules|company|companies|vendor|vendors|manual|manuals|guide|guides|license|licenses)\b)/gi;
    while ((m = rx2.exec(fullText)) !== null) {
      candidates.push(
        makeCand(
          'COLLOC-UNCOUNT-ART-001',
          m.index,
          m.index + m[0].length,
          m[0],
          `${m[1]} ${m[2]}`,
          'COLLOC',
          0.985,
          `Uncountable noun "${m[2]}" does not take an indefinite article.`,
          'IdiomOptima Collocation Engine.'
        )
      );
    }
  }

  // --------------------------------------------------------------------------
  // 3. Expletive & Double Passive Active-Voice Simplification
  // --------------------------------------------------------------------------

  // 3a. "it was [decided/agreed/...] by [Agent NP] that" -> "[Agent NP] decided that"
  {
    const rx =
      /\b(it)\s+(was|is)\s+(decided|agreed|determined|concluded|approved|recommended|proposed|suggested|resolved|noted|announced|reported|confirmed)\s+by\s+((?:the|a|an|this|that|these|those|our|their|his|her|its)\s+(?:[A-Za-z0-9-]+\s+){0,2}[A-Za-z0-9-]+)\s+that\b/gi;
    let m: RegExpExecArray | null;
    while ((m = rx.exec(fullText)) !== null) {
      const aux = m[2].toLowerCase();
      const vParticiple = m[3].toLowerCase();
      const agentRaw = m[4];

      // Convert past participle to finite verb
      let finiteVerb = vParticiple;
      if (aux === 'is') {
        const base = v3ToBase(vParticiple);
        const lastAgentWord = agentRaw.split(/\s+/).pop() || '';
        const isPlural = isLikelyPluralMassOrCount(lastAgentWord) && !/^(?:committee|board|team|panel|staff|company|department|office|agency|ministry|government)$/i.test(lastAgentWord);
        if (isPlural) {
          finiteVerb = base;
        } else {
          finiteVerb = /(?:s|sh|ch|x|z|o)$/.test(base) ? base + 'es' : /[bcdfghjklmnpqrstvwxyz]y$/.test(base) ? base.slice(0, -1) + 'ies' : base + 's';
        }
      }

      const agentFormatted =
        isAtSentenceStart(fullText, m.index) || /^[A-Z]/.test(m[1])
          ? isAtSentenceStart(fullText, m.index)
            ? agentRaw.charAt(0).toUpperCase() + agentRaw.slice(1)
            : lowercaseLeadingDet(agentRaw)
          : lowercaseLeadingDet(agentRaw);

      candidates.push(
        makeCand(
          'SYN-EXPLETIVE-PASSIVE-001',
          m.index,
          m.index + m[0].length,
          m[0],
          `${agentFormatted} ${finiteVerb} that`,
          'SYN',
          0.985,
          'Replaced bureaucratic dummy-"it" passive clause with direct active voice.',
          'IdiomOptima Active Agency Restorer.'
        )
      );
    }
  }

  // 3b. "[Patient NP] was/were to be [V3] by [Agent NP]" -> "[Agent NP] would [V_base] [Patient NP]"
  {
    const rx =
      /(?:^|(?<=(?:that|;|,|\band|\bbut|\bor|[.!?])\s+))((?:the|a|an|this|that|these|those|my|our|their|his|her|its)\s+(?:[A-Za-z0-9-]+\s+){0,2}[A-Za-z0-9-]+)\s+(was|were)\s+to\s+be\s+([a-z]+)\s+by\s+((?:the|a|an|this|that|these|those|my|our|their|his|her|its)\s+(?:[A-Za-z0-9-]+\s+){0,2}[A-Za-z0-9-]+)(?=\s*(?:[.,;!?]|$|\s+(?:before|after|by|within|during|for|on|in|at|to|that|which|who|and|but|so|next|soon|later|immediately|promptly|today|tomorrow)\b))/gi;
    let m: RegExpExecArray | null;
    while ((m = rx.exec(fullText)) !== null) {
      const patient = m[1];
      const v3 = m[3];
      const agent = m[4];
      if (!isLikelyPastParticiple(v3)) continue;

      const baseVerb = v3ToBase(v3);
      const sentStart = isAtSentenceStart(fullText, m.index);
      const agentOut = sentStart
        ? agent.charAt(0).toUpperCase() + agent.slice(1)
        : lowercaseLeadingDet(agent);
      const patientOut = lowercaseLeadingDet(patient);

      candidates.push(
        makeCand(
          'SYN-PASSIVE-TOBE-BY-001',
          m.index,
          m.index + m[0].length,
          m[0],
          `${agentOut} would ${baseVerb} ${patientOut}`,
          'SYN',
          0.98,
          'Converted convoluted passive infinitive construction to direct active voice.',
          'IdiomOptima Active Agency Restorer.'
        )
      );
    }
  }

  // --------------------------------------------------------------------------
  // 4. Conciseness, Wordiness, Pleonasms & AI Clichés
  // --------------------------------------------------------------------------

  // 4a. "It is important to note that [clause]" / "It should be noted that..."
  {
    const rx =
      /\b(?:It\s+is\s+(?:important|worth|essential|necessary|critical|helpful|useful|interesting)\s+to\s+note\s+that|It\s+should\s+be\s+noted\s+that|It\s+is\s+worth\s+noting\s+that|It\s+goes\s+without\s+saying\s+that)\s+([a-zA-Z])/gi;
    let m: RegExpExecArray | null;
    while ((m = rx.exec(fullText)) !== null) {
      const before = fullText.slice(Math.max(0, m.index - 20), m.index);
      // Guard against interrogative or embedded ("Why is it important to note that...")
      if (/\b(?:why|whether|how|is|was|makes|make|made|find|found|believe|think)\s+$/i.test(before)) {
        continue;
      }
      const nextChar = isAtSentenceStart(fullText, m.index) ? m[1].toUpperCase() : m[1];
      candidates.push(
        makeCand(
          'CONCISE-EXPLETIVE-NOTE-001',
          m.index,
          m.index + m[0].length,
          m[0],
          nextChar,
          'CONCISE',
          0.985,
          'Removed throat-clearing expletive hedge opener for direct prose.',
          'IdiomOptima Conciseness Engine.'
        )
      );
    }
  }

  // 4b. "in order to [verb]" -> "to [verb]"
  {
    const rx = /\b(in\s+order\s+to)\s+(?!not\b)([a-z]+)\b/gi;
    let m: RegExpExecArray | null;
    while ((m = rx.exec(fullText)) !== null) {
      const before = fullText.slice(Math.max(0, m.index - 35), m.index);
      // Preserve literal sequence/ordering ("put the files in order to review them")
      if (/\b(?:put|puts|putting|arrange|arranged|arranging|place|placed|placing|keep|kept|sort|sorted|list|listed|rank|ranked|are|is|was|were)\s+(?:[a-z]+\s+){1,3}$/i.test(before) && !/\b(?:discussed|reviewed|worked|acted|met|designed|built|wrote|planned)\b/i.test(before)) {
        continue;
      }
      const toWord = preserveInitialCase(m[1], 'to');
      candidates.push(
        makeCand(
          'CONCISE-IN-ORDER-TO-001',
          m.index,
          m.index + m[0].length,
          m[0],
          `${toWord} ${m[2]}`,
          'CONCISE',
          0.98,
          'Tightened wordy "in order to" to direct infinitive "to".',
          'IdiomOptima Conciseness Engine.'
        )
      );
    }
  }

  // 4c. "has/have/had the ability to [verb]" -> "can/could [verb]"
  {
    const rx = /\b(has|have|had)\s+the\s+ability\s+to\s+([a-z]+)\b/gi;
    let m: RegExpExecArray | null;
    while ((m = rx.exec(fullText)) !== null) {
      const before = fullText.slice(Math.max(0, m.index - 25), m.index);
      if (/\b(?:has|have|had|will|would|could|should|may|might|must|to|not|no|never)\s+$/i.test(before)) {
        continue;
      }
      const modal = m[1].toLowerCase() === 'had' ? 'could' : 'can';
      candidates.push(
        makeCand(
          'CONCISE-ABILITY-001',
          m.index,
          m.index + m[0].length,
          m[0],
          `${preserveInitialCase(m[1], modal)} ${m[2]}`,
          'CONCISE',
          0.985,
          'Replaced circumlocution "have the ability to" with concise modal auxiliary.',
          'IdiomOptima Conciseness Engine.'
        )
      );
    }
  }

  // 4d. ", needless to say," and sentence-initial "Needless to say,"
  {
    const midRx = /,\s*needless\s+to\s+say,\s*/gi;
    let m: RegExpExecArray | null;
    while ((m = midRx.exec(fullText)) !== null) {
      candidates.push(
        makeCand(
          'CONCISE-NEEDLESS-001',
          m.index,
          m.index + m[0].length,
          m[0],
          ', ',
          'CONCISE',
          0.99,
          'Removed parenthetical pleonasm "needless to say".',
          'IdiomOptima Conciseness Engine.'
        )
      );
    }

    const startRx = /(?:^|(?<=[.!?]\s+))Needless\s+to\s+say,\s*([a-zA-Z])/g;
    while ((m = startRx.exec(fullText)) !== null) {
      candidates.push(
        makeCand(
          'CONCISE-NEEDLESS-001',
          m.index,
          m.index + m[0].length,
          m[0],
          m[1].toUpperCase(),
          'CONCISE',
          0.99,
          'Removed sentence-initial pleonasm "Needless to say".',
          'IdiomOptima Conciseness Engine.'
        )
      );
    }
  }

  // 4e. "a plethora of [noun]" -> "numerous [plural]" / "ample [mass]"
  {
    const rx = /\b(a)\s+plethora\s+of\s+([a-z]+)\b/gi;
    let m: RegExpExecArray | null;
    while ((m = rx.exec(fullText)) !== null) {
      const quantifier = isLikelyPluralMassOrCount(m[2]) ? 'numerous' : 'ample';
      candidates.push(
        makeCand(
          'CONCISE-PLETHORA-001',
          m.index,
          m.index + m[0].length,
          m[0],
          `${preserveInitialCase(m[1], quantifier)} ${m[2]}`,
          'CONCISE',
          0.98,
          'Replaced overused quantifier cliché "a plethora of" with plain English.',
          'IdiomOptima Conciseness Engine.'
        )
      );
    }
  }

  // 4f. "delve(s|d|ing) (deeply) into" -> "examine(s|d|ing)"
  {
    const rx = /\b(delve|delves|delved|delving)\s+(?:deeply\s+)?into\b/gi;
    let m: RegExpExecArray | null;
    while ((m = rx.exec(fullText)) !== null) {
      const map: Record<string, string> = {
        delve: 'examine',
        delves: 'examines',
        delved: 'examined',
        delving: 'examining',
      };
      const replacement = preserveInitialCase(m[1], map[m[1].toLowerCase()] || 'examine');
      candidates.push(
        makeCand(
          'CONCISE-CLICHE-DELVE-001',
          m.index,
          m.index + m[0].length,
          m[0],
          replacement,
          'CONCISE',
          0.98,
          'Replaced AI cliché "delve into" with direct verb "examine".',
          'IdiomOptima Conciseness Engine.'
        )
      );
    }
  }

  // 4g. "play(s|ed|ing) a (pivotal|crucial|vital|key) role in [gerund]" -> "help(s|ed|ing) [base]"
  {
    const rx = /\b(play|plays|played|playing)\s+a\s+(?:pivotal|crucial|vital|key)\s+role\s+in\s+([a-z]+ing)\b/gi;
    let m: RegExpExecArray | null;
    while ((m = rx.exec(fullText)) !== null) {
      const verbMap: Record<string, string> = {
        play: 'help',
        plays: 'helps',
        played: 'helped',
        playing: 'helping',
      };
      const helpVerb = preserveInitialCase(m[1], verbMap[m[1].toLowerCase()] || 'help');
      const baseAction = gerundToBase(m[2]);
      candidates.push(
        makeCand(
          'CONCISE-CLICHE-PIVOTAL-001',
          m.index,
          m.index + m[0].length,
          m[0],
          `${helpVerb} ${baseAction}`,
          'CONCISE',
          0.98,
          'Tightened verbose boilerplate "play a pivotal role in [gerund]" to direct verb phrase.',
          'IdiomOptima Conciseness Engine.'
        )
      );
    }
  }

  // 4h. Bureaucratic wordy time/quantifier phrases
  {
    const phraseReplacements: Array<{ rx: RegExp; rep: string }> = [
      { rx: /\bat\s+this\s+point\s+in\s+time\b/gi, rep: 'now' },
      { rx: /\buntil\s+such\s+time\s+as\b/gi, rep: 'until' },
      { rx: /\beach\s+and\s+every\b/gi, rep: 'each' },
      { rx: /\bfor\s+all\s+intents\s+and\s+purposes\b/gi, rep: 'essentially' },
      { rx: /\bin\s+close\s+proximity\s+to\b/gi, rep: 'near' },
    ];
    for (const { rx, rep } of phraseReplacements) {
      let m: RegExpExecArray | null;
      while ((m = rx.exec(fullText)) !== null) {
        candidates.push(
          makeCand(
            'CONCISE-PLEONASM-TIME-001',
            m.index,
            m.index + m[0].length,
            m[0],
            preserveInitialCase(m[0], rep),
            'CONCISE',
            0.985,
            `Replaced wordy phrase "${m[0]}" with concise "${rep}".`,
            'IdiomOptima Conciseness Engine.'
          )
        );
      }
    }
  }

  // --------------------------------------------------------------------------
  // 5. Serial / Oxford Comma (PUN-OXFORD-001)
  // --------------------------------------------------------------------------
  {
    // Match ", <item2> (and|or) <item3>" and inspect preceding <item1> carefully
    const serialTailRx =
      /,\s+([A-Za-z0-9'-]+(?:\s+[A-Za-z0-9'-]+){0,3})\s+(and|or)\s+([A-Za-z0-9'-]+(?:\s+[A-Za-z0-9'-]+){0,3})(?=(?:\s*[.,;!?)]|$))/g;

    let m: RegExpExecArray | null;
    while ((m = serialTailRx.exec(fullText)) !== null) {
      const commaIndex = m.index;
      const item2 = m[1].trim();
      const conj = m[2];
      const item3 = m[3].trim();

      // Reject if item2 or item3 contains finite verb or looks like a clause
      if (containsFiniteVerb(item2) || containsFiniteVerb(item3)) continue;

      // Reject if item2 starts with clause conjunction/preposition/article mismatch indicators
      if (/^(?:and|or|but|so|yet|for|nor|that|which|who|where|when|while|if|because|since|although|as|despite|however|therefore|moreover)\b/i.test(item2)) {
        continue;
      }

      // Check immediately after the match: if followed by ", <finiteVerb>" it may be a parenthetical appositive
      // e.g. "Dr. Smith, the director and the CEO, arrived."
      const afterText = fullText.slice(m.index + m[0].length);
      if (/^,\s+(?:is|are|was|were|has|have|had|will|would|can|could|may|might|must|did|does|do|[a-z]+ed|[a-z]+s)\b/i.test(afterText)) {
        continue;
      }

      // Scan leftward from commaIndex to locate <item1> before the comma
      const leftChunk = fullText.slice(Math.max(0, commaIndex - 120), commaIndex);
      // Extract the current sentence tail before comma
      const sentSplit = leftChunk.split(/[.!?;:\n]/);
      const localLeft = sentSplit[sentSplit.length - 1];

      // Check if there is an earlier list boundary (including, such as, like, between, among, preposition, or finite verb)
      // or an earlier serial comma (", <itemK>")
      const boundaryMatch = localLeft.match(
        /(?:^|\b(?:including|covered|reviewed|discussed|examined|analyzed|analysed|listed|provided|allocated|used|needed|required|tested|built|created|offered|shared|signed|read|wrote|found|saw|showed|has|have|had|is|are|was|were|will|would|can|could|may|might|must|of|for|with|from|to|in|on|at|by|among|between|like|such\s+as)|,)\s+([A-Za-z0-9'-]+(?:\s+[A-Za-z0-9'-]+){0,3})$/i
      );

      if (!boundaryMatch) continue;
      const item1 = boundaryMatch[1].trim();
      const firstWord1 = item1.split(/\s+/)[0].toLowerCase();

      // Reject if item1 begins with a clause/adverbial opener or contains a finite verb
      if (CLAUSE_INTRODUCER_HEADS.has(firstWord1)) continue;
      if (containsFiniteVerb(item1)) continue;

      // Reject if item1 is preceded directly by sentence start with no verb/prep/comma (e.g. "The director, the manager and the staff" before a verb would match trailing check above, or require subject parallelism)
      const boundaryIndexInLocal = localLeft.lastIndexOf(item1);
      const textBeforeItem1 = localLeft.slice(0, boundaryIndexInLocal).trim();
      // If textBeforeItem1 is empty (sentence start), only allow if item1, item2, item3 share determiner/bare structure and aren't appositive
      if (!textBeforeItem1) {
        const hasDet1 = /^(?:the|a|an|my|our|their|his|her|its|this|that|these|those)\b/i.test(item1);
        const hasDet2 = /^(?:the|a|an|my|our|their|his|her|its|this|that|these|those)\b/i.test(item2);
        if (hasDet1 !== hasDet2) continue;
      }

      // Parallelism sanity check:
      // Reject if item1 has determiner + noun while item2 is something mismatched like pronoun/adverb,
      // OR if item1 is "several topics" and item2 is "including ..." (already blocked above),
      // OR if item1 is a proper name and item2 starts with "the" (appositive pattern: "Alice, the manager and the CEO")
      const startsWithDet1 = /^(?:the|a|an|this|that|these|those|my|our|their|his|her|its)\b/i.test(item1);
      const startsWithDet2 = /^(?:the|a|an|this|that|these|those|my|our|their|his|her|its)\b/i.test(item2);
      const startsWithDet3 = /^(?:the|a|an|this|that|these|those|my|our|their|his|her|its)\b/i.test(item3);

      // If item2 has determiner and item3 has determiner, item1 should also have determiner (unless preceded by another comma item)
      if (startsWithDet2 && startsWithDet3 && !startsWithDet1 && !textBeforeItem1.endsWith(',')) {
        continue;
      }

      // Compute exact span of whitespace + conjunction (" and" / " or") inside m[0]
      const conjMatch = m[0].match(new RegExp(`\\s+${conj}(?=\\s)`));
      if (!conjMatch || conjMatch.index === undefined) continue;
      const spanStart = commaIndex + conjMatch.index;
      const spanEnd = spanStart + conjMatch[0].length;

      candidates.push(
        makeCand(
          'PUN-OXFORD-001',
          spanStart,
          spanEnd,
          fullText.slice(spanStart, spanEnd),
          `, ${conj}`,
          'PUN',
          0.98,
          `Inserted serial (Oxford) comma before "${conj}" in parallel series ("${item1}, ${item2}, ${conj} ${item3}").`,
          'IdiomOptima Serial Punctuation Analyzer.'
        )
      );
    }
  }

  // --------------------------------------------------------------------------
  // 6. Staccato Repetitive Sentence Merging (SYN-STACCATO-MERGE-001)
  // --------------------------------------------------------------------------
  {
    // Match consecutive short sentences of form: "<Subject> <is|are|was|were> <adj>."
    const sentRx = /([A-Z][A-Za-z-]*(?:\s+[a-z][A-Za-z-]*){0,2})\s+(is|are|was|were)\s+([a-z]+(?:-[a-z]+)*)\./g;
    interface StaccatoMatch {
      start: number;
      end: number;
      prefix: string;
      prefixKey: string;
      adj: string;
    }

    const matches: StaccatoMatch[] = [];
    let m: RegExpExecArray | null;
    while ((m = sentRx.exec(fullText)) !== null) {
      const adj = m[3].toLowerCase();
      // Skip non-adjective pronouns/adverbs/nouns or progressive participles unless known participial adjectives
      if (/^(?:here|there|now|then|today|tomorrow|yesterday|home|away|done|gone|over|in|on|up|down|out|it|this|that|mine|yours|hers|ours|theirs)$/.test(adj)) {
        continue;
      }
      if (adj.endsWith('ing') && !/^(?:promising|compelling|engaging|interesting|surprising|concerning|alarming|encouraging|challenging|demanding|rewarding|outstanding|lasting|ongoing|emerging|cutting-edge|overwhelming|convincing)$/.test(adj)) {
        continue;
      }
      const prefix = `${m[1]} ${m[2]}`;
      matches.push({
        start: m.index,
        end: m.index + m[0].length,
        prefix,
        prefixKey: prefix.toLowerCase().replace(/\s+/g, ' '),
        adj,
      });
    }

    let i = 0;
    while (i < matches.length) {
      let j = i;
      while (j + 1 < matches.length) {
        const gap = fullText.slice(matches[j].end, matches[j + 1].start);
        // Only merge adjacent sentences separated by horizontal spaces (not newlines or extra sentences)
        if (/^[ \t]+$/.test(gap) && matches[j + 1].prefixKey === matches[i].prefixKey) {
          j++;
        } else {
          break;
        }
      }

      const runLen = j - i + 1;
      if (runLen >= 3) {
        const group = matches.slice(i, j + 1);
        const adjs = group.map((g) => g.adj);
        const merged = `${group[0].prefix} ${adjs.slice(0, -1).join(', ')}, and ${adjs[adjs.length - 1]}.`;
        const spanStart = group[0].start;
        const spanEnd = group[group.length - 1].end;

        candidates.push(
          makeCand(
            'SYN-STACCATO-MERGE-001',
            spanStart,
            spanEnd,
            fullText.slice(spanStart, spanEnd),
            merged,
            'SYN',
            0.985,
            `Combined ${runLen} choppy repetitive "${group[0].prefix} ..." sentences into one parallel series.`,
            'IdiomOptima Discourse Cohesion Combiner.'
          )
        );
        i = j + 1;
      } else {
        i++;
      }
    }
  }

  // --------------------------------------------------------------------------
  // 7. Object Pronoun Case After Prepositions & Transitive Verbs (PRON-OBJ-CASE-001)
  // --------------------------------------------------------------------------
  {
    const OBJ_MAP: Record<string, string> = {
      I: 'me',
      he: 'him',
      she: 'her',
      we: 'us',
      they: 'them',
    };

    const SUBJ_TO_OBJ_PRON_FOLLOW_FINITE =
      /^\s+(?:am|is|are|was|were|have|has|had|do|does|did|will|would|can|could|may|might|shall|should|must|'m|'re|'ve|'ll|'d|'s|’m|’re|’ve|’ll|’d|’s|also|only|just|still|always|never|often|actually|really|already|recently|previously|currently|now|[a-z]+ed|[a-z]+s)\b/i;

    const GOV_PREFIX =
      '\\b(?:with|for|from|by|at|between|among|against|beside|around|toward|towards|about|without|near|except|to|join|joins|joined|joining|help|helps|helped|helping|assist|assists|assisted|assisting|support|supports|supported|supporting|invite|invites|invited|inviting|contact|contacts|contacted|contacting|thank|thanks|thanked|thanking|trust|trusts|trusted|trusting|follow|follows|followed|following|accompany|accompanies|accompanied|accompanying|visit|visits|visited|visiting|call|calls|called|calling|email|emails|emailed|emailing|notify|notifies|notified|notifying|inform|informs|informed|informing|guide|guides|guided|guiding|teach|teaches|taught|teaching|let|lets|letting|watch|watches|watched|watching|meet|meets|met|meeting|excuse|excuses|excused|excusing|pardon|pardons|pardoned|pardoning|criticize|criticizes|criticized|praise|praises|praised|blame|blames|blamed|reward|rewards|rewarded|hire|hires|hired|appoint|appoints|appointed|interview|interviews|interviewed|encourage|encourages|encouraged|persuade|persuades|persuaded|convince|convinces|convinced|remind|reminds|reminded|warn|warns|warned|tell|tells|told|telling|ask|asks|asked|asking|show|shows|showed|shown|showing|give|gives|gave|given|giving|send|sends|sent|sending|bring|brings|brought|bringing|see|sees|saw|seen|seeing|hear|hears|heard|hearing)\\b';

    // 7a. Single object pronoun: "[Verb/Prep] (I|he|she|we|they)"
    const singleRx = new RegExp(`${GOV_PREFIX}\\s+(I|he|she|we|they)\\b`, 'g');
    let m: RegExpExecArray | null;
    while ((m = singleRx.exec(fullText)) !== null) {
      const govToken = m[0].split(/\s+/)[0].toLowerCase();
      const pronRaw = m[1];
      const pronKey = pronRaw === 'I' ? 'I' : pronRaw.toLowerCase();
      const objForm = OBJ_MAP[pronKey];
      if (!objForm) continue;

      const afterPron = fullText.slice(m.index + m[0].length);
      // If pronoun is subject of a finite clause ("told us he arrived", "think he left"), skip!
      if (SUBJ_TO_OBJ_PRON_FOLLOW_FINITE.test(afterPron)) continue;
      // Guard coordinated clause subject: "told Tom he and Sarah arrived"
      if (/^\s+and\s+/i.test(afterPron) && SUBJ_TO_OBJ_PRON_FOLLOW_FINITE.test(afterPron.replace(/^\s+and\s+(?:the\s+|my\s+|our\s+|his\s+|her\s+)?[A-Za-z]+/, ''))) {
        continue;
      }

      const pronStart = m.index + m[0].length - pronRaw.length;
      const pronEnd = m.index + m[0].length;
      candidates.push(
        makeCand(
          'PRON-OBJ-CASE-001',
          pronStart,
          pronEnd,
          pronRaw,
          objForm,
          'PRON',
          0.99,
          `Corrected nominative pronoun "${pronRaw}" to object case "${objForm}" after "${govToken}".`,
          'IdiomOptima Case Governance Analyzer.'
        )
      );
    }

    // 7b. Coordinated pronoun complement: "[Verb/Prep] [NP/Pronoun] and (I|he|she|we|they)"
    const coordRx = new RegExp(
      `${GOV_PREFIX}\\s+(?:you|me|him|her|us|them|(?:(?:the|a|an|my|our|your|his|her|their|this|that)\\s+)?(?:[A-Za-z]+\\s+){0,2}[A-Za-z]+)\\s+and\\s+(I|he|she|we|they)\\b`,
      'g'
    );
    while ((m = coordRx.exec(fullText)) !== null) {
      const pronRaw = m[1];
      const pronKey = pronRaw === 'I' ? 'I' : pronRaw.toLowerCase();
      const objForm = OBJ_MAP[pronKey];
      if (!objForm) continue;
      const afterPron = fullText.slice(m.index + m[0].length);
      if (SUBJ_TO_OBJ_PRON_FOLLOW_FINITE.test(afterPron)) continue;

      const pronStart = m.index + m[0].length - pronRaw.length;
      const pronEnd = m.index + m[0].length;
      candidates.push(
        makeCand(
          'PRON-OBJ-CASE-001',
          pronStart,
          pronEnd,
          pronRaw,
          objForm,
          'PRON',
          0.99,
          `Corrected coordinated pronoun "${pronRaw}" to object case "${objForm}".`,
          'IdiomOptima Case Governance Analyzer.'
        )
      );
    }
  }

  // --------------------------------------------------------------------------
  // 8. Preposition + Bare Verb -> Preposition + Gerund (-ing) (PREP-GERUND-001)
  // --------------------------------------------------------------------------
  {
    const PREP_GERUND_VERBS = new Set([
      'explore', 'compare', 'analyze', 'analyse', 'examine', 'investigate',
      'evaluate', 'assess', 'understand', 'determine', 'identify', 'establish',
      'develop', 'create', 'build', 'prepare', 'implement', 'improve',
      'reduce', 'increase', 'solve', 'resolve', 'achieve', 'attain',
      'obtain', 'acquire', 'deliver', 'provide', 'collect', 'gather',
      'measure', 'calculate', 'verify', 'validate', 'confirm', 'demonstrate',
      'explain', 'describe', 'discuss', 'consider', 'manage', 'handle',
      'prevent', 'avoid', 'ensure', 'maintain', 'promote', 'encourage',
      'strengthen', 'enhance', 'expand', 'extend', 'simplify', 'streamline',
      'optimize', 'optimise', 'monitor', 'track', 'submit', 'postpone',
      'delay', 'complete', 'finish', 'write', 'read', 'learn', 'teach',
      'choose', 'decide', 'select', 'apply', 'adapt', 'adopt',
      'participate', 'collaborate', 'communicate', 'contribute', 'attend',
      'leave', 'arrive', 'enter', 'perform', 'review', 'test',
      'interpret', 'discover', 'uncover', 'synthesize', 'synthesise',
      'summarize', 'summarise', 'quantify', 'predict', 'forecast',
      'estimate', 'compute', 'simulate', 'organize', 'organise',
      'prioritize', 'prioritise', 'coordinate', 'integrate', 'combine',
      'connect', 'eliminate', 'mitigate', 'minimize', 'minimise',
      'maximize', 'maximise', 'accelerate', 'transform', 'preserve',
      'protect', 'restore', 'overcome', 'navigate', 'comprehend',
      'recognize', 'recognise', 'publish', 'revise', 'edit', 'draft',
      'clarify', 'illustrate', 'highlight', 'emphasize', 'emphasise',
      'address', 'tackle', 'reject', 'accept', 'recommend', 'propose',
      'justify', 'defend', 'persuade', 'convince', 'motivate', 'inspire',
      'assist', 'facilitate', 'enable',
    ]);

    const OBJECT_OR_MOD_FOLLOW =
      /^\s+(?:the|a|an|this|that|these|those|my|our|your|their|his|her|its|me|him|her|us|them|you|it|all|both|each|every|many|more|most|some|any|several|various|different|new|complex|modern|digital|human|public|how|what|why|whether|[a-z]+s)\b/i;
    const PROPER_OBJ_FOLLOW = /^\s+[A-Z0-9][A-Za-z0-9.-]*\b/;

    const prepVerbRx =
      /\b(in|on|of|by|for|without|after|before|about|despite|through|from|into|toward|towards|regarding|concerning|instead\s+of)\s+([a-z]+)\b/gi;
    let m: RegExpExecArray | null;
    while ((m = prepVerbRx.exec(fullText)) !== null) {
      const prep = m[1].toLowerCase();
      const verb = m[2].toLowerCase();
      if (!PREP_GERUND_VERBS.has(verb)) continue;

      // Guard nominal idioms that share stems with verbs ("in complete agreement", "on review", "in address", etc.)
      if (prep === 'in' && /^(?:complete|review|test|address|edit|draft|transform)$/.test(verb)) continue;
      if (prep === 'for' && /^(?:review|test|address|transform)$/.test(verb)) continue;
      if (prep === 'on' && /^(?:review|test|edit)$/.test(verb)) continue;
      if (prep === 'of' && /^(?:complete|review|address)$/.test(verb)) continue;

      const afterVerb = fullText.slice(m.index + m[0].length);
      const isIntransitiveAllowed = /^(?:collaborate|participate|arrive|learn|attend)$/.test(verb);
      const hasObjectFollow =
        OBJECT_OR_MOD_FOLLOW.test(afterVerb) || PROPER_OBJ_FOLLOW.test(afterVerb);
      if (!hasObjectFollow && !(isIntransitiveAllowed && /^\s*(?:[.,;!?]|with|in|to|at|on|$)/i.test(afterVerb))) {
        continue;
      }

      if (verb === 'complete' && /^\s+(?:accuracy|control|clarity|coverage|success|transparency|agreement)\b/i.test(afterVerb)) {
        continue;
      }

      const gerund = baseToGerund(verb);
      const verbStart = m.index + m[0].length - m[2].length;
      const verbEnd = m.index + m[0].length;
      candidates.push(
        makeCand(
          'PREP-GERUND-001',
          verbStart,
          verbEnd,
          m[2],
          gerund,
          'PREP',
          0.985,
          `Converted bare verb "${m[2]}" after preposition "${m[1]}" to gerund "${gerund}".`,
          'IdiomOptima Prepositional Gerund Analyzer.'
        )
      );
    }
  }

  // --------------------------------------------------------------------------
  // 9. Progressive Auxiliary "am/is/are/was/were + V_base" -> V-ing (AUX-BE-PROG-001)
  // --------------------------------------------------------------------------
  {
    const UNAMBIGUOUS_PROGRESSIVE_VERBS = new Set([
      'compare', 'explore', 'analyze', 'analyse', 'examine', 'investigate',
      'evaluate', 'assess', 'review', 'submit', 'prepare', 'develop',
      'build', 'create', 'write', 'explain', 'describe', 'demonstrate',
      'verify', 'validate', 'calculate', 'measure', 'consider', 'observe',
      'monitor', 'conduct', 'allocate', 'adapt', 'manage', 'handle',
      'update', 'implement', 'improve', 'reduce', 'increase', 'solve',
      'resolve', 'decide', 'choose', 'select', 'discuss', 'deliver',
      'provide', 'collect', 'gather', 'identify', 'establish', 'achieve',
      'obtain', 'acquire', 'prevent', 'avoid', 'ensure', 'maintain',
      'promote', 'encourage', 'strengthen', 'enhance', 'expand', 'extend',
      'simplify', 'optimize', 'optimise', 'track', 'postpone', 'delay',
      'attend', 'participate', 'collaborate', 'communicate', 'contribute',
      'wait', 'try', 'learn', 'study', 'teach', 'speak', 'talk',
      'listen', 'watch', 'follow', 'join', 'visit', 'travel', 'move',
      'continue', 'begin', 'start', 'finish', 'eat', 'drink', 'sleep',
      'play', 'drive', 'fly', 'spend', 'buy', 'sell', 'search', 'check',
      'receive', 'send', 'bring', 'give', 'take', 'make', 'show', 'tell',
      'ask', 'help', 'seek', 'offer', 'suggest', 'propose', 'recommend',
      'announce', 'share', 'invite',
      'illustrate', 'highlight', 'emphasize', 'emphasise', 'address', 'tackle',
      'draft', 'edit', 'revise', 'publish', 'discover', 'uncover',
      'interpret', 'synthesize', 'synthesise', 'summarize', 'summarise',
      'quantify', 'predict', 'forecast', 'estimate', 'compute', 'simulate',
      'organize', 'organise', 'prioritize', 'prioritise', 'coordinate',
      'integrate', 'combine', 'connect', 'eliminate', 'mitigate',
      'minimize', 'minimise', 'maximize', 'maximise', 'accelerate',
      'transform', 'preserve', 'protect', 'restore', 'overcome', 'navigate',
      'comprehend', 'recognize', 'recognise', 'clarify', 'justify',
      'persuade', 'convince', 'facilitate', 'enable',
    ]);

    const OBJECT_OR_CLAUSE_AFTER =
      /^\s+(?:the|a|an|this|that|these|those|my|our|your|their|his|her|its|me|him|her|us|them|you|it|all|both|each|every|many|more|most|some|any|several|various|different|new|how|what|why|whether|on|in|for|with|about|to|at|[a-z]+s|[.,;!?]|$)/i;
    const PROPER_OBJ_FOLLOW = /^\s+[A-Z0-9][A-Za-z0-9.-]*\b/;

    const rx = /\b(am|is|are|was|were|['’]m|['’]re)\s+(?:(currently|now|actively|actually|also|still|just)\s+)?([a-z]+)\b/gi;
    let m: RegExpExecArray | null;
    while ((m = rx.exec(fullText)) !== null) {
      const aux = m[1].toLowerCase();
      const adv = m[2];
      const verbRaw = m[3];
      const verb = verbRaw.toLowerCase();

      if (!UNAMBIGUOUS_PROGRESSIVE_VERBS.has(verb)) continue;

      const afterVerb = fullText.slice(m.index + m[0].length);
      if (!OBJECT_OR_CLAUSE_AFTER.test(afterVerb) && !PROPER_OBJ_FOLLOW.test(afterVerb)) continue;

      // Guard against pseudo-cleft or specification copulas:
      // "What we need to do is compare...", "All I did was compare...", "Our main goal is improve..."
      const sentBefore = fullText.slice(Math.max(0, m.index - 80), m.index);
      const localClause = sentBefore.split(/[.!?;]/).pop() || '';
      if (
        aux !== 'am' &&
        aux !== "'m" &&
        aux !== '’m' &&
        (/\b(?:what|all)\b.*\b(?:do|did|does)\s*$/i.test(localClause) ||
          /\b(?:goal|aim|objective|purpose|task|job|step|plan|strategy|approach|solution|priority|mission|role|way|thing)\s*$/i.test(localClause))
      ) {
        continue;
      }

      // Guard noun-homographs at clause end ("The main skill is study." / "Her favorite hobby is travel.")
      if (
        aux !== 'am' &&
        aux !== "'m" &&
        aux !== '’m' &&
        /^(?:study|travel|play|sleep|review|draft|edit|address|visit|search|help|move|start|finish|offer|share)$/i.test(verb) &&
        /^\s*(?:[.,;!?]|$)/.test(afterVerb)
      ) {
        continue;
      }

      // Guard against "by [Agent]" passive collisions
      if (/^\s+by\b/i.test(afterVerb)) continue;

      const gerund = baseToGerund(verb);
      const verbStart = m.index + m[0].length - verbRaw.length;
      const verbEnd = m.index + m[0].length;
      const advPart = adv ? `${adv} ` : '';

      candidates.push(
        makeCand(
          'AUX-BE-PROG-001',
          verbStart,
          verbEnd,
          verbRaw,
          gerund,
          'MODAL',
          0.985,
          `Converted bare verb "${verbRaw}" after progressive auxiliary "${m[1]} ${advPart}" to "${gerund}".`,
          'IdiomOptima Progressive Aspect Analyzer.'
        )
      );
    }
  }

  // --------------------------------------------------------------------------
  // 10. Pleonastic ", etc." Removal in Non-Exhaustive Lists (CONCISE-ETC-PLEONASM-001)
  // --------------------------------------------------------------------------
  {
    const etcRx = /(?:,\s*|\s+)etc\./gi;
    let m: RegExpExecArray | null;
    while ((m = etcRx.exec(fullText)) !== null) {
      const lookbackStart = Math.max(0, m.index - 260);
      const lookback = fullText.slice(lookbackStart, m.index);
      // Split only at genuine sentence boundaries (avoid splitting on domain dots like copy.ai or e.g.)
      const sentBoundaryParts = lookback.split(/(?<=[.!?])\s+(?=[A-Z0-9"“])|[;\n]/);
      const beforeInSent = sentBoundaryParts[sentBoundaryParts.length - 1] || '';

      const hasNonExhaustiveIntro = /\b(?:such\s+as|including|for\s+example|e\.g\.)\b/i.test(beforeInSent);
      const hasClosingAnd = /,\s+and\s+[^,]+$/i.test(beforeInSent);

      if (!hasNonExhaustiveIntro && !hasClosingAnd) continue;

      const afterEtc = fullText.slice(m.index + m[0].length);
      const isSentenceEnd =
        /^\s*$/.test(afterEtc) || /^\s+[A-Z]/.test(afterEtc);

      const replacement = isSentenceEnd ? '.' : '';

      candidates.push(
        makeCand(
          'CONCISE-ETC-PLEONASM-001',
          m.index,
          m.index + m[0].length,
          m[0],
          replacement,
          'CONCISE',
          0.985,
          'Removed redundant "etc." from an already open-ended ("such as"/"including") or closed ("and ...") enumeration.',
          'IdiomOptima Conciseness Engine.'
        )
      );
    }
  }

  return candidates;
}
