/**
 * SANDBOX BASELINE ADAPTER — read-only port.
 *
 * This is a faithful TypeScript transcription of IdiomOptima's production
 * deterministic grammar layer, `applyGrammarLayer` (and its tables), from
 * `idiomoptima-pwa/index.js` (lines ~2837-3266), read on 2026-10-13.
 *
 * Provenance: used ONLY as the head-to-head baseline in the GrammarDB sandbox.
 * The production repository is never imported, executed, or modified from here.
 * If production changes, re-diff against the source of truth:
 *   C:\Users\hp\Desktop\idiomoptima-pwa\index.js
 *
 * Behaviour is reproduced verbatim (same .source/.flags), including the
 * quote-safety split via `replaceOutsideQuotes`.
 */

export interface GrammarLayerResult {
  text: string;
  fixes: number;
  grammar: number;
  punctuation: number;
  duplication: number;
}

export const BASELINE_ID = 'idiomoptima.applyGrammarLayer';

/** Static capability manifest, used to build the GrammarDB-vs-baseline divergence map. */
export interface BaselineCapability {
  id: string;
  layer: 'grammar' | 'preposition' | 'verb-prep' | 'punctuation' | 'duplication';
  description: string;
  keywords: string[];
}

export const BASELINE_CAPABILITIES: BaselineCapability[] = [
  { id: 'a-an-silent-h', layer: 'grammar', description: 'a -> an before silent-h / letter-name words', keywords: ['article', 'a-an', 'determiner'] },
  { id: 'an-a-eu-words', layer: 'grammar', description: 'an -> a before eu-/u-/one- words', keywords: ['article', 'a-an', 'determiner'] },
  { id: 'sv-plural', layer: 'grammar', description: 'plural noun + is/was/has -> are/were/have', keywords: ['agreement', 'subject-verb', 'number'] },
  { id: 'sv-singular', layer: 'grammar', description: 'singular noun + are/were/have/do -> is/was/has/does', keywords: ['agreement', 'subject-verb', 'number'] },
  { id: 'pron-singular', layer: 'grammar', description: 'he/she/it + have/do -> has/does', keywords: ['agreement', 'pronoun', 'auxiliary'] },
  { id: 'pron-plural', layer: 'grammar', description: 'they/we/you + has/does -> have/do', keywords: ['agreement', 'pronoun', 'auxiliary'] },
  { id: 'doubled-subject', layer: 'grammar', description: 'doubled subject pronoun ("the study it shows")', keywords: ['doubled-subject', 'agreement', 'pronoun'] },
  { id: 'sv-finite-plural', layer: 'grammar', description: 'plural noun + inflected finite verb -> bare verb', keywords: ['agreement', 'subject-verb', 'finite'] },
  { id: 'sv-finite-singular', layer: 'grammar', description: 'singular noun + bare verb -> inflected finite verb', keywords: ['agreement', 'subject-verb', 'finite'] },
  { id: 'governed-prepositions', layer: 'preposition', description: 'wrong governed preposition -> correct (14 pairs)', keywords: ['preposition', 'collocation', 'governed'] },
  { id: 'verb-prep', layer: 'verb-prep', description: 'verb + stranded preposition (discuss about, comprise of)', keywords: ['preposition', 'verb', 'collocation'] },
  { id: 'spacing', layer: 'punctuation', description: 'space before punctuation, missing space after comma, collapse spaces', keywords: ['punctuation', 'spacing', 'comma'] },
  { id: 'doubled-function-word', layer: 'duplication', description: 'collapse doubled closed-class words ("the the")', keywords: ['duplication', 'repeat', 'article'] },
  { id: 'oxford-comma', layer: 'punctuation', description: 'insert series (Oxford) comma in 3+ item lists', keywords: ['punctuation', 'comma', 'series'] },
  { id: 'citation-comma', layer: 'punctuation', description: 'Name Year -> Name, Year inside multi-citation parentheticals', keywords: ['punctuation', 'citation', 'comma'] },
  { id: 'coordinated-past-verb', layer: 'grammar', description: 'past clause head + coordinated bare verb -> -ed', keywords: ['agreement', 'tense', 'coordination'] },
  { id: 'unbalanced-brackets', layer: 'punctuation', description: 'count-only unbalanced parentheses/brackets', keywords: ['punctuation', 'bracket'] },
];

// --- tables ------------------------------------------------------------------

const GRAMMAR_PLURAL_NOUNS = [
  'findings', 'results', 'factors', 'studies', 'analyses', 'policies', 'approaches',
  'strategies', 'mechanisms', 'processes', 'outcomes', 'implications', 'developments',
  'challenges', 'opportunities', 'measures', 'changes', 'issues', 'matters', 'effects',
  'aspects', 'features', 'dimensions', 'laws', 'rules', 'models', 'theories',
];
const GRAMMAR_SINGULAR_NOUNS = [
  'finding', 'result', 'factor', 'study', 'analysis', 'policy', 'approach', 'strategy',
  'mechanism', 'process', 'outcome', 'implication', 'development', 'challenge',
  'opportunity', 'measure', 'change', 'issue', 'matter', 'effect', 'aspect', 'feature',
  'dimension', 'law', 'rule', 'model', 'theory',
];
const CERTIFIED_INTENSIFIERS =
  'clearly|often|also|still|even|just|quite|simply|largely|mainly|primarily|chiefly|' +
  'typically|usually|frequently|constantly|readily|directly|strongly|ultimately|eventually|' +
  'effectively|easily|actively|plainly|evidently|markedly|notably|visibly|consistently|' +
  'repeatedly|persistently';
const CERTIFIED_FINITE_S =
  'shows|demonstrates|indicates|suggests|reveals|provides|constitutes|requires|creates|poses|' +
  'offers|plays|affects|describes|explains|argues|claims|asserts|examines|explores|' +
  'increases|decreases|leads|contributes|enables|allows|helps|tends|remains|seems|appears|' +
  'exists|differs|occurs|results|manifests|illustrates|highlights|emphasizes|' +
  'underlines|involves|depends|reflects|affirms';
const CERTIFIED_FINITE_BARE =
  'show|demonstrate|indicate|suggest|reveal|provide|constitute|require|create|pose|offer|play|' +
  'affect|describe|explain|argue|claim|assert|examine|explore|discuss|increase|decrease|lead|' +
  'contribute|enable|allow|help|tend|remain|seem|appear|exist|differ|occur|result|manifest|' +
  'illustrate|highlight|emphasize|underline|involve|depend|reflect|affirm';
const CERTIFIED_PAST_HEADS =
  'saw|showed|made|had|became|marked|unfolded|began|reflected|triggered|generated|spurred|' +
  'sparked|brought|led|produced|took|gave|moved|grew|developed|started|continued|resulted|' +
  'remained|emerged|occurred|demonstrated|illustrated|rendered|represented|established|created|' +
  'introduced|initiated|conducted|presented|offered|provided|reported|examined|described|' +
  'argued|concluded|claimed|asserted|enabled|allowed|contributed|helped|witnessed|experienced|' +
  'ensured|drew|invoked|signalled|signaled|constituted|involved|entailed|included|responded';
const CERTIFIED_PAST_TAIL =
  'in|with|from|on|at|as|by|for|through|during|across|among|under|over|between|alongside|off|out|up|down';
const CERTIFIED_COORD_BARE =
  'manifest|occur|result|emerge|arise|constitute|involve|entail|include|represent|respond|' +
  'conduct|perform|undertake|initiate|advance|act|form|produce|express|assert|affirm|depict|expound';
const CERTIFIED_PAST_HEADS_RE = new RegExp('\\b(' + CERTIFIED_PAST_HEADS + ')\\b', 'i');
const CERTIFIED_COORD_RE = new RegExp(
  '\\b(and)\\s+(' + CERTIFIED_COORD_BARE + ')\\b(?=\\s+(' + CERTIFIED_PAST_TAIL + ')\\b)',
  'gi'
);
const AUX_PRECEDER: Record<string, number> = {
  did: 1, didnt: 1, "didnt't": 1, do: 1, does: 1, will: 1, would: 1, can: 1,
  could: 1, shall: 1, should: 1, may: 1, might: 1, must: 1, wont: 1, wouldnt: 1,
  couldnt: 1, shouldnt: 1, cant: 1, dont: 1, doesnt: 1,
};

interface BaselineRule {
  id: string;
  re: RegExp;
  guard?: (s: string, idx: number) => boolean;
  repl: (m: RegExpExecArray) => string;
}

const GRAMMAR_RULES: BaselineRule[] = [
  {
    id: 'a-an-silent-h',
    re: /\b(a)\s+(hour|hourly|honest|honour|honor|honourable|honorable|honorary|heir|heiress|NGO|MBA|FBI)\b/gi,
    repl: (m) => 'an ' + m[2],
  },
  {
    id: 'an-a-eu-words',
    re: /\b(an)\s+(university|union|uniform|unique|unit|useful|user|used|usual|usage|utensil|eulogy|euphoria|Europe|European|euro|one|once|ubiquitous|unified|unilateral|upward|uranium|UFO|URL|hourglass)\b/gi,
    repl: (m) => 'a ' + m[2],
  },
  {
    id: 'sv-plural',
    re: new RegExp('\\b(the\\s+)?((' + GRAMMAR_PLURAL_NOUNS.join('|') + '))\\s+(is|was|has)\\b', 'gi'),
    repl: (m) => {
      const map: Record<string, string> = { is: 'are', was: 'were', has: 'have' };
      return (m[1] || '') + m[2] + ' ' + map[m[4].toLowerCase()];
    },
  },
  {
    id: 'sv-singular',
    re: new RegExp('\\b(the\\s+)?((' + GRAMMAR_SINGULAR_NOUNS.join('|') + '))\\s+(are|were|have|do)\\b', 'gi'),
    repl: (m) => {
      const map: Record<string, string> = { are: 'is', were: 'was', have: 'has', do: 'does' };
      return (m[1] || '') + m[2] + ' ' + map[m[4].toLowerCase()];
    },
  },
  {
    id: 'pron-singular',
    re: /\b(he|she|it)\s+(have|do)\b/gi,
    guard: (s, idx) => {
      const pre = s.slice(0, idx).replace(/[""\u201C\u201D\u2018\u2019,;:!?()\[\]\d]+/g, ' ').replace(/\s+/g, ' ').trim();
      const tok = pre.split(/\s+/).pop() || '';
      return !!AUX_PRECEDER[tok.toLowerCase()];
    },
    repl: (m) => m[1] + ' ' + (m[2].toLowerCase() === 'have' ? 'has' : 'does'),
  },
  {
    id: 'pron-plural',
    re: /\b(they|we|you|people|researchers|scholars|authors|writers)\s+(has|does)\b/gi,
    repl: (m) => m[1] + ' ' + (m[2].toLowerCase() === 'has' ? 'have' : 'do'),
  },
  {
    id: 'doubled-subject',
    re: /\b(the\s+)?(study|analysis|approach|government|policy|system|process|findings|survey|research|work|text|chapter|article|paper|book|argument|field|model|project|report|section|paragraph|thesis|theory|strategy|programme|program|initiative|regime|state|country|army|force|coalition|alliance|company|team|department|school|court|council|committee|party|union|staff|faculty|society|economy|market|sector|industry)\s+(it|they)\s+(shows|show|reveals|reveal|demonstrates|demonstrate|highlights|highlight|is|are|was|were|has|have|concludes|conclude|argues|argue|explains|explain|provides|provide|illustrates|illustrate|suggests|suggest|indicates|indicate|claims|claim|asserts|assert|describes|describe|examines|examine|explores|explore|discusses|discuss|advances|advanced|advance|entered|enters|emerges|emerged|moves|moved|acts|acted|responds|responded|reacts|reacted|differs|differed|agrees|agreed|declines|declined|grows|grew|rises|rose|exerts|exerted|exercises|exercised|pursues|pursued|promotes|promoted|implements|implemented|launches|launched|conducts|conducted|opposes|opposed|resists|resisted|supports|supported|expands|expanded|extends|extended|mobilizes|mobilized|deploys|deployed|marches|marched|withdraws|withdrew|intervenes|intervened|escalates|escalated)\b/gi,
    repl: (m) => (m[1] || '') + m[2] + ' ' + m[4],
  },
  {
    id: 'sv-finite-plural',
    re: new RegExp('\\b(the\\s+)?(' + GRAMMAR_PLURAL_NOUNS.join('|') + ')((?:\\s+(?:' + CERTIFIED_INTENSIFIERS + ')){0,2})\\s+(' + CERTIFIED_FINITE_S + ')\\b', 'gi'),
    repl: (m) => (m[1] || '') + m[2] + m[3] + ' ' + m[4].replace(/s$/i, ''),
  },
  {
    id: 'sv-finite-singular',
    re: new RegExp('\\b(the\\s+)?(' + GRAMMAR_SINGULAR_NOUNS.join('|') + ')((?:\\s+(?:' + CERTIFIED_INTENSIFIERS + ')){0,2})\\s+(' + CERTIFIED_FINITE_BARE + ')\\b', 'gi'),
    guard: (s, idx) => {
      const pre = s.slice(Math.max(0, idx - 90), idx);
      return /(suggest(?:ed)?|recommend(?:s|ed)?|request(?:s|ed)?|demand(?:s|ed)?|insist(?:s|ed)?|propos(?:e|es|ed)?|require(?:s|d)?|important|essential|vital|necessary|adamant)\b[^.!?\n\u2019]{0,60}\bthat\b[^.!?\n\u2019]{0,50}$/i.test(pre);
    },
    repl: (m) => (m[1] || '') + m[2] + m[3] + ' ' + m[4] + 's',
  },
];

const GRAMMAR_PREPOSITIONS: Array<{ re: RegExp; good: (m: RegExpExecArray) => string }> = [
  { re: /\b(depend(?:s|ed|ing)?)\s+(?:of|in|with)\b/gi, good: (m) => m[1] + ' on' },
  { re: /\brelevant\s+(?:for|with)\b/gi, good: () => 'relevant to' },
  { re: /\bassociated\s+to\b/gi, good: () => 'associated with' },
  { re: /\bcomposed\s+(?:by|with)\b/gi, good: () => 'composed of' },
  { re: /\bsimilar\s+(?:with|than)\b/gi, good: () => 'similar to' },
  { re: /\bdifferent\s+with\b/gi, good: () => 'different from' },
  { re: /\bcontrary\s+(?:in|with|for|at)\b/gi, good: () => 'contrary to' },
  { re: /\bwith\s+respect\s+for\b/gi, good: () => 'with respect to' },
  { re: /\bcommitted\s+for\b/gi, good: () => 'committed to' },
  { re: /\born\s+the\s+basis\s+of\b/gi, good: () => 'on the basis of' },
  { re: /\bon\s+the\s+behalf\s+of\b/gi, good: () => 'on behalf of' },
  { re: /\birregardless\b/gi, good: () => 'regardless' },
  { re: /\b(could|should|would|must|might)\s+of\b/gi, good: (m) => m[1] + ' have' },
  { re: /\bthe\s+reason\s+is\s+because\b/gi, good: () => 'the reason is that' },
];

const VERB_PREP_CORRECTIONS: Array<{ re: RegExp; good: (m: RegExpExecArray) => string }> = [
  { re: /\bdiscuss(?:es|ed|ing)?\s+about\b/gi, good: (m) => m[0].replace(/\s+about\b/i, '') },
  { re: /\bemphasi[sz](?:e|es|ed|ing)\s+on\b/gi, good: (m) => m[0].replace(/\s+on\b/i, '') },
  { re: /\bmention(?:s|ed|ing)?\s+about\b/gi, good: (m) => m[0].replace(/\s+about\b/i, '') },
  { re: /\bcompris(?:e|es|ed|ing)\s+of\b/gi, good: (m) => m[0].replace(/\s+of\b/i, '') },
];

const DUP_FUNCTION_WORDS = [
  'a', 'an', 'the',
  'and', 'or', 'but', 'nor', 'yet',
  'of', 'in', 'on', 'at', 'to', 'by', 'with', 'from', 'as', 'into', 'onto',
  'than', 'between', 'among', 'through', 'during', 'against', 'about', 'over',
  'under', 'for', 'per', 'via',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'am',
  'has', 'have', 'will', 'would', 'can', 'could', 'should', 'may', 'might',
  'must', 'do', 'does', 'did',
  'it', 'its', 'he', 'she', 'they', 'we', 'you', 'them', 'his', 'her',
  'their', 'our', 'your', 'this', 'these', 'those',
];

function doubledWordRe(): RegExp {
  return new RegExp('\\b(' + DUP_FUNCTION_WORDS.join('|') + ')[^\\S\\n]+\\1\\b', 'gi');
}

function countUnbalancedBrackets(s: string): number {
  let open = 0;
  let close = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charAt(i);
    if (c === '(' || c === '[') open++;
    else if (c === ')' || c === ']') close++;
  }
  return open !== close ? 1 : 0;
}

const GRAMMAR_RULES_COMPILED = GRAMMAR_RULES.map((r) => new RegExp(r.re.source, r.re.flags));
const GRAMMAR_PREPOSITIONS_COMPILED = GRAMMAR_PREPOSITIONS.map((r) => new RegExp(r.re.source, r.re.flags));
const VERB_PREP_COMPILED = VERB_PREP_CORRECTIONS.map((r) => new RegExp(r.re.source, r.re.flags));

function replaceOutsideQuotes(text: string, fn: (seg: string) => string): string {
  if (!text) return text;
  const parts: string[] = [];
  const re = /[""\u201C\u2018][^""\u201D\u2019]*[""\u201D\u2019]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    parts.push(fn(text.slice(last, m.index)));
    parts.push(m[0]);
    last = m.index + m[0].length;
  }
  parts.push(fn(text.slice(last)));
  return parts.join('');
}

export function applyGrammarLayer(text: string): GrammarLayerResult {
  if (!text) return { text: text || '', fixes: 0, grammar: 0, punctuation: 0, duplication: 0 };
  let fixes = 0;
  let grammarFixes = 0;
  let punctFixes = 0;
  let dupFixes = 0;
  const out = replaceOutsideQuotes(String(text), (seg) => {
    let s = seg;
    let res: RegExpExecArray | null;
    for (let i = 0; i < GRAMMAR_RULES.length; i++) {
      const rule = GRAMMAR_RULES[i];
      const re = GRAMMAR_RULES_COMPILED[i];
      re.lastIndex = 0;
      while ((res = re.exec(s)) !== null) {
        if (rule.guard && rule.guard(s, res.index)) {
          re.lastIndex = res.index + res[0].length;
          continue;
        }
        let rep = rule.repl(res);
        if (/^[A-Z]/.test(res[0]) && /^[a-z]/.test(rep)) {
          rep = rep.charAt(0).toUpperCase() + rep.slice(1);
        }
        s = s.substring(0, res.index) + rep + s.substring(res.index + res[0].length);
        re.lastIndex = res.index + rep.length;
        fixes++;
        grammarFixes++;
      }
    }
    for (let j = 0; j < GRAMMAR_PREPOSITIONS.length; j++) {
      const pp = GRAMMAR_PREPOSITIONS[j];
      const pr = GRAMMAR_PREPOSITIONS_COMPILED[j];
      pr.lastIndex = 0;
      while ((res = pr.exec(s)) !== null) {
        let good = String(typeof pp.good === 'function' ? pp.good(res) : pp.good);
        if (/^[A-Z]/.test(res[0]) && !/^[A-Z]/.test(good)) good = good.charAt(0).toUpperCase() + good.slice(1);
        s = s.substring(0, res.index) + good + s.substring(res.index + res[0].length);
        pr.lastIndex = res.index + good.length;
        fixes++;
        grammarFixes++;
      }
    }
    for (let vp = 0; vp < VERB_PREP_CORRECTIONS.length; vp++) {
      const vpRule = VERB_PREP_CORRECTIONS[vp];
      const vpRe = VERB_PREP_COMPILED[vp];
      vpRe.lastIndex = 0;
      while ((res = vpRe.exec(s)) !== null) {
        const vpGood = String(typeof vpRule.good === 'function' ? vpRule.good(res) : vpRule.good);
        s = s.substring(0, res.index) + vpGood + s.substring(res.index + res[0].length);
        vpRe.lastIndex = res.index + vpGood.length;
        fixes++;
        grammarFixes++;
      }
    }
    s = s.replace(/[ \t]+([,.;:!?])/g, (_m, p) => { punctFixes++; return p; });
    s = s.replace(/([,;:])(?=[A-Za-z"\u201C\u2018])/g, (_m, p) => { punctFixes++; return p + ' '; });
    s = s.replace(/ {2,}/g, ' ');
    s = s.replace(/[ \t]+([)\]])/g, (_m, p) => { punctFixes++; return p; });
    s = s.replace(/\( [ \t]+/g, '(');
    s = s.replace(doubledWordRe(), (_m, w) => { dupFixes++; fixes++; return w; });

    const introSignal = /\b(not\s+just|not\s+only|both|among|such\s+as|including|namely|e\.g\.|for\s+example|in\s+particular|the\s+following|between|whether|like)\s+[A-Za-z'\u2019]*$/i;
    const oxfordRe = /\b([A-Za-z\u00C0-\u024F][\w'\u2019\u00C0-\u024F-]{0,40}),\s+([a-zA-Z\u00C0-\u024F][\w'\u2019\u00C0-\u024F-]{0,40}(?:\s+[a-zA-Z\u00C0-\u024F][\w'\u2019\u00C0-\u024F-]{0,40}){0,1})\s+and\s+([a-zA-Z\u00C0-\u024F][\w'\u2019\u00C0-\u024F-]{0,40}(?:\s+[a-zA-Z\u00C0-\u024F][\w'\u2019\u00C0-\u024F-]{0,40}){0,1})\b/gi;
    s = s.replace(oxfordRe, (ox, item1, item2, item3, oxOff, whole) => {
      if (/,\s*$/.test(item2) || /,\s*$/.test(item1)) return ox;
      const after = whole.slice(oxOff + ox.length);
      if (/^(and|or|but|which|who|that|when|where|if|in|on|as|to|by|with|from|of|than)\b/i.test(after)) return ox;
      const verbish = /^(is|are|was|were|has|have|had|be|been|do|does|did|show|shows|shown|showed|examine|examines|examined|review|reviews|reviewed|discuss|discusses|discussed|analyze|analyzes|analyzed|analyse|analyses|analysed|test|tests|tested|study|studies|studied|develop|develops|developed|evaluate|evaluates|evaluated|assess|assesses|assessed|support|supports|supported|promote|promotes|promoted)$/i;
      const itemsAllLow = !/[A-Z]/.test(item1) && !/[A-Z]/.test(item2) && !/[A-Z]/.test(item3);
      if (itemsAllLow && verbish.test(item1.split(/\s+/)[0]) && verbish.test(item2.split(/\s+/)[0]) && verbish.test(item3.split(/\s+/)[0])) return ox;
      const sigPref = whole.slice(Math.max(0, oxOff - 48), oxOff + 1);
      const sig = introSignal.test(sigPref) ||
        (/[A-Z]/.test(item1) && /[A-Z]/.test(item2) && /[A-Z]/.test(item3));
      if (!sig) return ox;
      punctFixes++;
      return item1 + ', ' + item2 + ', and ' + item3;
    });

    s = s.replace(/\(([^()]{1,400})\)/g, (cm, inner) => {
      const nameYear = /^[A-Za-z][^|\n]*?\b(1[89]\d{2}|20\d{2})\b/;
      const listEls = inner.split(/\s*;\s*/);
      let yearCount = 0;
      listEls.forEach((el: string) => {
        if (nameYear.test(el)) yearCount++;
      });
      if (yearCount < 2) return cm;
      const newInner = inner.replace(/\b([A-Z][\w.'\u2019&]*(\s+(?:and|&)\s+[A-Z][\w.'\u2019]*)?)\s+(1[89]\d{2}|20\d{2})\b/g, (mm: string, name: string, _two: string, year: string) => {
        punctFixes++;
        return name + ', ' + year;
      });
      return '(' + newInner + ')';
    });

    s = s.replace(CERTIFIED_COORD_RE, (cm, andWord, bareVerb, _tail, off, whole) => {
      const pre = s.slice(Math.max(0, off - 260), off + 4);
      const tailPre = pre.replace(/\b(and)\s+(?:[A-Za-z\u2019']+\s+){1,9}?/gi, ' ');
      if (!CERTIFIED_PAST_HEADS_RE.test(tailPre)) return cm;
      const ed = /e$/.test(bareVerb) ? bareVerb + 'd' : bareVerb + 'ed';
      grammarFixes++;
      return andWord + ' ' + ed;
    });

    punctFixes += countUnbalancedBrackets(s);
    return s;
  });
  return { text: out, fixes, grammar: grammarFixes, punctuation: punctFixes, duplication: dupFixes };
}

export function applyCertifiedPolish(text: string, isFootnote = false): string {
  if (!text) return text;
  if (isFootnote) return text;
  if (/^\s*\[\d+\]/.test(text) || /^\s*Ibid\.?/i.test(text)) return text;
  return applyGrammarLayer(text).text;
}

/** TextTransformer-compatible entry point for the benchmark harness. */
export function baselineGrammarTransform(text: string): string {
  return applyCertifiedPolish(text, false);
}

export function countDoubledFunctionWords(s: string): number {
  if (!s) return 0;
  const hits = String(s).match(doubledWordRe());
  return hits ? hits.length : 0;
}
