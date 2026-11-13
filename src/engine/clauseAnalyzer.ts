import { ClauseSpan, DiscourseEscalationCandidate, CorrectionCandidate, StylisticAdvisory } from './types';
import { segmentSentences } from './segmenter';

interface SubjectInfo {
  text: string;
  number: 'singular' | 'plural';
  person: '1st' | '2nd' | '3rd';
  isPronoun: boolean;
  gender?: 'masculine' | 'feminine' | 'neuter' | 'unknown';
}

interface VerbInfo {
  text: string;
  tense: 'past' | 'present' | 'future' | 'present_perfect' | 'past_perfect' | 'modal';
  aspect: 'simple' | 'continuous' | 'perfect' | 'perfect_continuous';
  isPassive?: boolean;
}

const SUBORDINATORS = [
  'although',
  'even though',
  'though',
  'while',
  'whereas',
  'because',
  'since',
  'unless',
  'if',
  'as long as',
  'provided that',
  'after',
  'before',
  'until',
  'when',
  'whenever',
];

export function extractVerb(clauseText: string): VerbInfo | undefined {
  // Past Perfect: had had, had not finished, had entered
  if (/\bhad\s+(?:not\s+)?(?:been\s+)?(\w+ed|\w+en|had|done|seen|gone|written)\b/i.test(clauseText)) {
    const match = clauseText.match(/\bhad\s+(?:not\s+)?(?:been\s+)?\w+\b/i);
    return {
      text: match ? match[0] : 'had',
      tense: 'past_perfect',
      aspect: 'perfect',
    };
  }

  // Present Perfect: has not finished, have entered, has been
  if (/\b(has|have)\s+(?:not\s+)?(?:been\s+)?(\w+ed|\w+en|had|done|seen|gone|written|finished)\b/i.test(clauseText)) {
    const match = clauseText.match(/\b(?:has|have)\s+(?:not\s+)?(?:been\s+)?\w+\b/i);
    return {
      text: match ? match[0] : 'has',
      tense: 'present_perfect',
      aspect: 'perfect',
    };
  }

  // Future Modal: will discuss, will enter
  if (/\bwill\s+(?:not\s+)?(\w+)\b/i.test(clauseText)) {
    const match = clauseText.match(/\bwill\s+(?:not\s+)?\w+\b/i);
    return {
      text: match ? match[0] : 'will',
      tense: 'future',
      aspect: 'simple',
    };
  }

  // Past Simple: entered, realized, were, was, examined
  if (/\b(?:were|was|entered|realized|concluded|demonstrated|found|saw|showed|confirmed|called|started)\b/i.test(clauseText)) {
    const match = clauseText.match(/\b(?:were|was|entered|realized|concluded|demonstrated|found|saw|showed|confirmed|called|started)\b/i);
    return {
      text: match ? match[0] : 'past',
      tense: 'past',
      aspect: 'simple',
    };
  }

  // Present Simple: enter, enters, is, are, discuss, discusses
  if (/\b(?:is|are|enters|enter|discuss|discusses|shows|demonstrates)\b/i.test(clauseText)) {
    const match = clauseText.match(/\b(?:is|are|enters|enter|discuss|discusses|shows|demonstrates)\b/i);
    return {
      text: match ? match[0] : 'present',
      tense: 'present',
      aspect: 'simple',
    };
  }

  return undefined;
}

export function extractSubject(clauseText: string): SubjectInfo | undefined {
  const cleaned = clauseText.trim().replace(/^[,;\s]+/, '');

  // 1. Common Pronouns at start of clause
  if (/^(?:she|he|it)\b/i.test(cleaned)) {
    const match = cleaned.match(/^(she|he|it)\b/i);
    const pronoun = match ? match[1].toLowerCase() : 'it';
    return {
      text: pronoun,
      number: 'singular',
      person: '3rd',
      isPronoun: true,
      gender: pronoun === 'she' ? 'feminine' : pronoun === 'he' ? 'masculine' : 'neuter',
    };
  }

  if (/^(?:they)\b/i.test(cleaned)) {
    return {
      text: 'they',
      number: 'plural',
      person: '3rd',
      isPronoun: true,
      gender: 'unknown',
    };
  }

  if (/^(?:we)\b/i.test(cleaned)) {
    return {
      text: 'we',
      number: 'plural',
      person: '1st',
      isPronoun: true,
    };
  }

  if (/^(?:i)\b/i.test(cleaned)) {
    return {
      text: 'I',
      number: 'singular',
      person: '1st',
      isPronoun: true,
    };
  }

  if (/^(?:you)\b/i.test(cleaned)) {
    return {
      text: 'you',
      number: 'plural',
      person: '2nd',
      isPronoun: true,
    };
  }

  // 2. Syntax-informed noun phrase: extract text preceding the main verb
  const verbInfo = extractVerb(cleaned);
  if (verbInfo && verbInfo.text) {
    const verbRegex = new RegExp(`\\b${verbInfo.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    const verbMatch = cleaned.match(verbRegex);
    if (verbMatch && verbMatch.index && verbMatch.index > 0) {
      const npCandidate = cleaned.slice(0, verbMatch.index).trim();
      if (npCandidate && npCandidate.length < 50) {
        const isPlural = /\b(?:researchers|findings|results|data|participants|scholars|authors|students|professors|scientists|reports|studies|s)\b/i.test(npCandidate);
        return {
          text: npCandidate,
          number: isPlural ? 'plural' : 'singular',
          person: '3rd',
          isPronoun: false,
          gender: 'unknown',
        };
      }
    }
  }

  // 3. Fallback Noun phrase: "The researchers", "The archivist"
  const npMatch = cleaned.match(/^(the\s+(?:(?:empirical|preliminary|principal|primary|senior|lead|scientific|clinical)\s+)?[\w\-]+)\b/i);
  if (npMatch) {
    const np = npMatch[1].trim();
    const isPlural = /\b(?:researchers|findings|results|data|participants|scholars|authors|students|professors|scientists|reports|studies|s)\b/i.test(np);
    return {
      text: np,
      number: isPlural ? 'plural' : 'singular',
      person: '3rd',
      isPronoun: false,
      gender: 'unknown',
    };
  }

  return undefined;
}

export function analyzeClausesAndDiscourse(fullText: string): {
  clauses: ClauseSpan[];
  escalations: DiscourseEscalationCandidate[];
  advisories: StylisticAdvisory[];
} {
  const clauses: ClauseSpan[] = [];
  const escalations: DiscourseEscalationCandidate[] = [];

  const sentences = segmentSentences(fullText);

  let clauseCounter = 1;

  sentences.forEach((sentence, sIdx) => {
    const sentenceText = sentence.text.trim();
    if (!sentenceText) return;

    // Search for subordinating conjunctions splitting the sentence
    const subordinatorRegex = new RegExp(`\\b(${SUBORDINATORS.join('|')})\\b`, 'i');
    const subMatch = sentenceText.match(subordinatorRegex);

    if (subMatch && subMatch.index !== undefined) {
      const subordinator = subMatch[1];
      const subIndex = subMatch.index;

      const matrixPart = sentenceText.slice(0, subIndex).replace(/,\s*$/, '').trim();
      const subordinatePart = sentenceText.slice(subIndex + subordinator.length).trim();

      const matrixSpan: ClauseSpan = {
        clauseId: `CL-${clauseCounter++}`,
        text: matrixPart,
        type: 'matrix',
        start: sentence.start,
        end: sentence.start + matrixPart.length,
        subject: extractSubject(matrixPart),
        verb: extractVerb(matrixPart),
      };

      const subordinateSpan: ClauseSpan = {
        clauseId: `CL-${clauseCounter++}`,
        text: `${subordinator} ${subordinatePart}`,
        type: 'subordinate',
        subordinator,
        start: sentence.start + subIndex,
        end: sentence.end,
        subject: extractSubject(subordinatePart),
        verb: extractVerb(subordinatePart),
      };

      clauses.push(matrixSpan, subordinateSpan);

      // Check for Anaphoric Reference Mismatch & Tense Discordance
      const matrixSubj = matrixSpan.subject;
      const subSubj = subordinateSpan.subject;
      const matrixVerb = matrixSpan.verb;
      const subVerb = subordinateSpan.verb;

      // Condition: Matrix subject is plural third person (e.g. "The researchers")
      // Subordinate subject is singular pronoun ("she" or "he")
      if (
        matrixSubj &&
        matrixSubj.person === '3rd' &&
        matrixSubj.number === 'plural' &&
        subSubj &&
        subSubj.isPronoun &&
        subSubj.number === 'singular'
      ) {
        // Tense conflict: Matrix is past ('entered'), subordinate is present_perfect ('has not finished')
        const isTenseMismatch = matrixVerb?.tense === 'past' && subVerb?.tense === 'present_perfect';

        escalations.push({
          id: `DISC-PRON-${sIdx + 1}`,
          sentenceText,
          matrixClause: matrixSpan,
          subordinateClause: subordinateSpan,
          trigger: 'anaphoric_reference_mismatch',
          pronoun: subSubj.text,
          potentialAntecedent: matrixSubj.text,
          hypotheses: [
            {
              id: 'HYP-ANTECEDENT-PLURAL',
              label: "Align Pronoun with Plural Subject ('they')",
              revisedSentence: sentenceText.replace(
                new RegExp(`\\b${subSubj.text}\\s+has(?:\\s+not)?\\b`, 'i'),
                isTenseMismatch ? 'they had not' : 'they have not'
              ),
              explanation: `If '${subSubj.text}' refers back to '${matrixSubj.text}', grammatical number requires the plural pronoun 'they' (${isTenseMismatch ? 'with past perfect tense harmony' : 'with present perfect agreement'}).`,
              confidence: 0.92,
            },
            {
              id: 'HYP-TENSE-HARMONY-EXTERNAL',
              label: "Harmonize Past Tense for Individual ('she had not finished')",
              revisedSentence: sentenceText.replace(
                new RegExp(`\\b${subSubj.text}\\s+has(?:\\s+not)?\\b`, 'i'),
                `${subSubj.text} had not`
              ),
              explanation: `If '${subSubj.text}' refers to a specific individual distinct from '${matrixSubj.text}', matrix past tense ('${matrixVerb?.text || 'entered'}') requires subordinate past perfect ('had not finished').`,
              confidence: 0.88,
            },
          ],
          aiPromptPayload: {
            sentence: sentenceText,
            context: fullText,
            anaphor: subSubj.text,
            antecedentCandidate: matrixSubj.text,
            question: `In sentence '${sentenceText}', does '${subSubj.text}' refer to '${matrixSubj.text}' (requiring 'they') or to an external individual (requiring past perfect tense harmony 'had not finished')?`,
          },
          status: 'escalate_to_ai',
        });
      } else if (
        matrixVerb &&
        matrixVerb.tense === 'past' &&
        subVerb &&
        subVerb.tense === 'present_perfect'
      ) {
        // Pure tense harmony discordance across clauses
        escalations.push({
          id: `DISC-TNS-${sIdx + 1}`,
          sentenceText,
          matrixClause: matrixSpan,
          subordinateClause: subordinateSpan,
          trigger: 'cross_clause_tense_discordance',
          pronoun: subSubj?.text || 'subject',
          potentialAntecedent: matrixSubj?.text || 'matrix',
          hypotheses: [
            {
              id: 'HYP-TNS-HARMONY',
              label: "Harmonize to Past Perfect ('had not finished')",
              revisedSentence: sentenceText.replace(/\bhas\s+(not\s+)?(\w+)/i, 'had $1$2'),
              explanation: "Matrix clause past tense requires past perfect in subordinate clause when recounting past timeline.",
              confidence: 0.90,
            },
          ],
          aiPromptPayload: {
            sentence: sentenceText,
            context: fullText,
            anaphor: subSubj?.text || '',
            antecedentCandidate: matrixSubj?.text || '',
            question: "Does the sequence of tenses require past perfect harmony in the subordinate clause?",
          },
          status: 'escalate_to_ai',
        });
      }
    } else {
      // Single independent clause
      clauses.push({
        clauseId: `CL-${clauseCounter++}`,
        text: sentenceText,
        type: 'matrix',
        start: sentence.start,
        end: sentence.end,
        subject: extractSubject(sentenceText),
        verb: extractVerb(sentenceText),
      });
    }
  });

  const advisories = detectDanglingModifiers(fullText);

  return { clauses, escalations, advisories };
}

export function detectDanglingModifiers(fullText: string): StylisticAdvisory[] {
  const advisories: StylisticAdvisory[] = [];
  const sentences = segmentSentences(fullText);

  sentences.forEach((s, idx) => {
    // Introductory participial phrases: Having analyzed, Analyzing, Upon examining, After reviewing, By evaluating
    // followed by comma, followed by inanimate subject: the results, the findings, the data, the study, the report, the paper, the analysis, the evidence
    const match = s.text.match(
      /^((?:Having\s+(?:been\s+)?\w+ed|Having\s+analyzed|After\s+analyzing|Upon\s+(?:analyzing|examining|reviewing))\s+[^,]+),\s*(the\s+(?:results|findings|data|study|report|paper|analysis|evidence|telemetry))\b/i
    );

    if (match && match.index !== undefined) {
      const participialPhrase = match[1].trim();
      const inanimateSubj = match[2].trim();
      const matchStart = s.start + match.index;
      const matchEnd = matchStart + match[0].length;

      const remainder = s.text.slice((match.index ?? 0) + match[0].length);
      const actionVerbMatch = remainder.match(
        /^\s*(show|shows|demonstrate|demonstrates|indicate|indicates|reveal|reveals|suggest|suggests)\s+that\s+/i
      );
      const clauseRemainder = actionVerbMatch
        ? remainder.replace(
            /^\s*(show|shows|demonstrate|demonstrates|indicate|indicates|reveal|reveals|suggest|suggests)\s+that\s+/i,
            ''
          )
        : remainder;

      // Extract target object and verb from participial phrase dynamically
      const phraseParts = participialPhrase.replace(/^(?:Having\s+(?:been\s+)?|After\s+|Upon\s+|By\s+)/i, '').trim();
      const verbMatch = phraseParts.match(/^(\w+)(?:\s+(.+))?$/);
      const rawVerb = verbMatch ? verbMatch[1].toLowerCase() : 'analyzed';
      const rawObj = verbMatch && verbMatch[2] ? verbMatch[2] : 'the dataset';
      const pastVerb = rawVerb.endsWith('ed') ? rawVerb : rawVerb.replace(/ing$/, 'ed');
      const ingVerb = rawVerb.endsWith('ing') ? rawVerb : rawVerb.replace(/ed$/, 'ing');

      const suggestions = [
        `When the researchers ${pastVerb} ${rawObj}, ${inanimateSubj}${remainder}`,
        actionVerbMatch
          ? `After ${ingVerb} ${rawObj}, the researchers found that ${clauseRemainder}`
          : `After ${ingVerb} ${rawObj}, the researchers observed that ${inanimateSubj}${remainder}`,
        `The ${rawObj.replace(/^(?:the|this|that|a|an)\s+/i, '')} was ${pastVerb}, and ${inanimateSubj}${remainder}`,
      ];

      advisories.push({
        id: `DANG-${idx + 1}`,
        ruleId: 'STYLE-DANGLING-001',
        text: match[0],
        start: matchStart,
        end: matchEnd,
        kind: 'dangling_modifier',
        originalSentence: s.text,
        explanation: `Dangling participle modifier: '${participialPhrase}' implies a human agent, but the grammatical subject '${inanimateSubj}' cannot semantically perform this action.`,
        suggestions,
        severity: 'suggestion',
      });
    }
  });

  return advisories;
}

const SINGULAR_HEAD_NOUNS = new Set([
  'list', 'summary', 'analysis', 'study', 'report', 'review', 'collection',
  'overview', 'subset', 'evaluation', 'assessment', 'investigation',
  'finding', 'conclusion', 'result', 'decision', 'recommendation', 'proposal',
  'policy', 'system', 'method', 'process', 'plan', 'program', 'programme',
  'project', 'draft', 'document', 'version', 'schedule', 'petition',
  'announcement', 'merger', 'deadline', 'pack', 'batch', 'sequence',
  'structure', 'strategy', 'catalog', 'catalogue', 'inventory', 'directory',
  'index', 'table', 'chart', 'graph', 'diagram', 'model', 'framework',
  'mechanism', 'criterion', 'protocol', 'manual', 'guideline', 'agreement',
  'contract', 'statute', 'clause', 'article', 'record', 'number',
]);

const PLURAL_HEAD_NOUNS = new Set([
  'decisions', 'recommendations', 'results', 'findings', 'policies', 'changes',
  'measures', 'proposals', 'reports', 'studies', 'clauses', 'articles',
  'documents', 'guidelines', 'efforts', 'plans', 'methods', 'issues',
  'factors', 'arguments', 'claims', 'metrics', 'effects', 'conclusions',
  'outcomes', 'observations', 'comments', 'suggestions', 'requirements',
  'limitations', 'reviews', 'analyses', 'evaluations', 'assessments',
  'investigations', 'summaries', 'lists', 'petitions', 'contracts',
  'agreements', 'rules', 'regulations', 'standards', 'procedures', 'protocols',
  'strategies', 'initiatives', 'projects', 'programs', 'programmes', 'systems',
  'models', 'processes', 'steps', 'actions', 'policies', 'budgets', 'costs',
  'expenses', 'revenues', 'profits', 'salaries', 'wages', 'benefits',
  'employees', 'workers', 'interns', 'managers', 'directors', 'members',
  'participants', 'researchers', 'scientists', 'authors', 'editors', 'students',
  'patients', 'clients', 'customers', 'users', 'applicants', 'candidates',
  'updates', 'revisions', 'edits', 'corrections', 'improvements', 'delays',
  'errors', 'mistakes', 'problems', 'challenges', 'concerns', 'questions',
  'answers', 'replies', 'responses', 'statements', 'announcements', 'notices',
  'terms', 'conditions', 'provisions', 'sections', 'chapters', 'pages',
  'figures', 'tables', 'charts', 'graphs', 'datasets', 'samples', 'specimens',
  'records', 'logs', 'files', 'details', 'facts', 'reasons', 'causes',
  'options', 'alternatives', 'solutions', 'tools', 'resources', 'assets',
  'lights', 'doors', 'windows', 'rooms', 'sensors', 'devices', 'machines',
]);

const INTERVENING_FINITE_VERBS =
  /\b(?:is|are|was|were|am|be|been|has|have|had|do|does|did|will|would|can|could|may|might|shall|should|must|made|took|gave|said|told|asked|announced|reported|rejected|accepted|approved|signed|wrote|read|saw|heard|found)\b/i;

function matchVerbCase(original: string, targetLower: string): string {
  if (/^[A-Z]/.test(original)) {
    return targetLower.charAt(0).toUpperCase() + targetLower.slice(1);
  }
  return targetLower;
}

export function extractDependencyCandidates(text: string): CorrectionCandidate[] {
  const candidates: CorrectionCandidate[] = [];
  const usedOffsets = new Set<number>();

  // 1A. Long-Distance Singular Head-Verb Agreement across PP(s) and optional non-restrictive RC:
  // e.g., "The list of recommendations, which include three new clauses, were rejected by the committee."
  // e.g., "The summary of all the submitted research articles, which was reviewed by two senior editors, have been rejected"
  // Guard: Exclude "A number of", "A variety of", "The majority of", "A majority of" (notional plural)
  const singularHeadPattern = Array.from(SINGULAR_HEAD_NOUNS).join('|');
  const headSingRegex = new RegExp(
    `(?:^|(?<=[.!?\\n]\\s*|;\\s*|:\\s*))((?:The|A|An|This|That|One|Each|Every|My|Your|His|Her|Its|Our|Their|(?:The\\s+)?[A-Za-z]+['’]s)(?:\\s+(?:new|old|main|primary|final|initial|recent|full|entire|long|short|official|formal|proposed|revised|current|updated|detailed|preliminary|complete|overall)){0,2}\\s+(${singularHeadPattern}))((?:\\s+(?:of|for|in|on|at|to|from|with|by|about|regarding|concerning|involving|covering|including|between|among|across|against|under|over|during|after|before)\\s+[^,;.!?\\n]+?)+)(\\s*,\\s*(?:which|who|whom|whose)\\s+[^.\\n]+?,)?\\s+(?:(often|always|never|rarely|initially|eventually|finally|unanimously|subsequently|recently|immediately|unexpectedly|completely|entirely|repeatedly|just|already|still)\\s+)?\\b(were|are|have)\\b(?=\\s+[A-Za-z-])`,
    'gi'
  );

  let m: RegExpExecArray | null;
  while ((m = headSingRegex.exec(text)) !== null) {
    const subjPhrase = m[1];
    const headNoun = m[2].toLowerCase();
    const ppChunk = m[3];
    const auxWord = m[6];
    const auxLower = auxWord.toLowerCase();

    // Guard against notional plural constructions ("a number of", "the majority of", etc.)
    if (headNoun === 'number' && !/^(?:the|this|that)\s+number$/i.test(subjPhrase.trim())) {
      continue;
    }
    // Guard against compound subject ("The list of A and the summary of B")
    if (/\band\s+(?:the|a|an|my|our|their|his|her|its|these|those|several|many|both)\b/i.test(ppChunk)) {
      continue;
    }

    const auxOffsetInMatch = m[0].lastIndexOf(auxWord);
    if (auxOffsetInMatch === -1) continue;
    const verbStart = m.index + auxOffsetInMatch;
    const verbEnd = verbStart + auxWord.length;

    if (auxLower === 'have') {
      const afterAux = text.slice(verbEnd).trimStart();
      if (!/^(?:been|had|not|no|never|already|just|still|only|also|[a-z]+ed|[a-z]+en|a|an|the|several|many|little|much)\b/i.test(afterAux)) {
        continue;
      }
    }

    const targetLower = auxLower === 'were' ? 'was' : auxLower === 'are' ? 'is' : 'has';
    const replacement = matchVerbCase(auxWord, targetLower);

    usedOffsets.add(verbStart);
    candidates.push({
      ruleId: 'AGR-HEAD-001',
      start: verbStart,
      end: verbEnd,
      original: auxWord,
      replacement,
      confidence: 0.985,
      category: 'AGR',
      rationale: `Singular head noun '${m[2]}' requires singular verb '${targetLower}' across intervening prepositional phrases and relative clauses.`,
      provenance: 'IdiomOptima Syntactic Dependency Parser',
    });
  }

  // 1B. Long-Distance Plural Head-Verb Agreement (including possessive determiners like "The committee's decisions regarding the budget was communicated late"):
  const pluralHeadPattern = Array.from(PLURAL_HEAD_NOUNS).join('|');
  const headPlurRegex = new RegExp(
    `(?:^|(?<=[.!?\\n]\\s*|;\\s*|:\\s*))((?:(?:The|These|Those|All|Both|Many|Several|Few|Multiple|Numerous|Various|Our|Their|Your|My|His|Her|Its|Some)|(?:The\\s+[A-Za-z-]+['’]s)|(?:[A-Z][a-z-]+['’]s))(?:\\s+(?:new|old|recent|final|initial|key|major|minor|proposed|revised|current|updated|official|formal|early|late|unexpected|primary|secondary|internal|external|annual|quarterly|financial|strategic|critical|important|pending|remaining|approved|rejected|submitted|committee's|board's)){0,2}\\s+(${pluralHeadPattern}))((?:\\s+(?:regarding|concerning|about|of|for|in|on|at|to|from|with|by|involving|covering|including|between|among|across|against|under|over|during|after|before|without|towards?|into)\\s+[^,;.!?\\n]+?)+)(\\s*,\\s*(?:which|who|whom|whose)\\s+[^.\\n]+?,)?\\s+(?:(often|always|never|rarely|initially|eventually|finally|unanimously|subsequently|recently|immediately|unexpectedly|completely|entirely|reportedly|apparently|widely|clearly|just|already|still)\\s+)?\\b(was|is|has)\\b(?=\\s+[A-Za-z-])`,
    'gi'
  );

  while ((m = headPlurRegex.exec(text)) !== null) {
    const subjPhrase = m[1];
    const headNoun = m[2];
    const ppChunk = m[3];
    const auxWord = m[6];
    const auxLower = auxWord.toLowerCase();

    // Guard against distributive singular pronouns/determiners
    if (/^(?:each|every|neither|either|one|none)\b/i.test(subjPhrase.trim())) {
      continue;
    }
    // Guard against a finite verb hidden inside the intervening PP (indicating a zero-relativizer clause)
    if (INTERVENING_FINITE_VERBS.test(ppChunk)) {
      continue;
    }

    const auxOffsetInMatch = m[0].lastIndexOf(auxWord);
    if (auxOffsetInMatch === -1) continue;
    const verbStart = m.index + auxOffsetInMatch;
    if (usedOffsets.has(verbStart)) continue;

    const verbEnd = verbStart + auxWord.length;
    if (auxLower === 'has') {
      const afterAux = text.slice(verbEnd).trimStart();
      if (!/^(?:been|had|not|no|never|already|just|still|only|also|[a-z]+ed|[a-z]+en|a|an|the|several|many|little|much)\b/i.test(afterAux)) {
        continue;
      }
    }

    const targetLower = auxLower === 'was' ? 'were' : auxLower === 'is' ? 'are' : 'have';
    const replacement = matchVerbCase(auxWord, targetLower);

    usedOffsets.add(verbStart);
    candidates.push({
      ruleId: 'AGR-HEAD-PLURAL-001',
      start: verbStart,
      end: verbEnd,
      original: auxWord,
      replacement,
      confidence: 0.985,
      category: 'AGR',
      rationale: `Plural head noun '${headNoun}' requires plural verb '${targetLower}' across intervening prepositional modifiers.`,
      provenance: 'IdiomOptima Syntactic Dependency Parser',
    });
  }

  // 2. Embedded Relative Clause Long-Distance Subject-Verb Agreement:
  // e.g., "participants who speak more than one language suffers from less cognitive decline"
  const embedRelRegex =
    /\b(participants|researchers|authors|students|patients|subjects|adults|individuals|scholars|scientists|employees|workers|interns|managers|members|colleagues|citizens|users)\s+who\s+([^,;\n]+?)\s+\b(suffers|shows|demonstrates|exhibits|lives|works|experiences|receives|requires|reports|needs|remains|appears|continues)\b/gi;

  while ((m = embedRelRegex.exec(text)) !== null) {
    const fullMatch = m[0];
    const fullStart = m.index;
    const verb = m[3];
    const verbIndexInFull = fullMatch.lastIndexOf(verb);
    if (verbIndexInFull !== -1) {
      const verbStart = fullStart + verbIndexInFull;
      if (usedOffsets.has(verbStart)) continue;
      const verbEnd = verbStart + verb.length;
      const baseVerb = verb.endsWith('s') ? verb.slice(0, -1) : verb;

      candidates.push({
        ruleId: 'AGR-HEAD-EMBED-001',
        start: verbStart,
        end: verbEnd,
        original: verb,
        replacement: baseVerb,
        confidence: 0.985,
        category: 'AGR',
        rationale: `Plural antecedent subject '${m[1]}' governs predicate verb '${baseVerb}' across the intervening relative clause.`,
        provenance: 'IdiomOptima Syntactic Dependency Parser',
      });
    }
  }

  return candidates;
}
