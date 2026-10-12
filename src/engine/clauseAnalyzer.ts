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

export function extractDependencyCandidates(text: string): CorrectionCandidate[] {
  const candidates: CorrectionCandidate[] = [];

  // 1. Long-Distance Head-Verb Agreement across PP and optional non-restrictive RC:
  // e.g., "The summary of all the submitted research articles, which was reviewed by two senior editors, have been rejected"
  const headPPAuxRegex =
    /\b((?:The|A|An|This|That)\s+(summary|analysis|study|report|review|collection|overview|subset|evaluation|assessment|investigation|majority|finding|conclusion|result))\s+of\s+([^,;\n]+?)(?:,\s*which\s+[^,\n]+,)?\s+\b(have)\s+(been\s+\w+|\w+ed|\w+en)\b/gi;

  let m: RegExpExecArray | null;
  while ((m = headPPAuxRegex.exec(text)) !== null) {
    const fullMatch = m[0];
    const fullStart = m.index;
    const haveIndexInFull = fullMatch.lastIndexOf('have');
    if (haveIndexInFull !== -1) {
      const verbStart = fullStart + haveIndexInFull;
      const verbEnd = verbStart + 4; // 'have'.length

      candidates.push({
        ruleId: 'AGR-HEAD-001',
        start: verbStart,
        end: verbEnd,
        original: 'have',
        replacement: 'has',
        confidence: 0.985,
        category: 'AGR',
        rationale: `Singular head noun '${m[2]}' requires singular auxiliary 'has' across intervening prepositional phrase and relative clause.`,
        provenance: 'IdiomOptima Syntactic Dependency Parser',
      });
    }
  }

  // 2. Embedded Relative Clause Long-Distance Subject-Verb Agreement:
  // e.g., "participants who speaks more than one languages suffers from less cognitive decline"
  const embedRelRegex =
    /\b(participants|researchers|authors|students|patients|subjects|adults|individuals|scholars|scientists)\s+who\s+([^,;\n]+?)\s+\b(suffers|shows|demonstrates|exhibits|lives|works|experiences)\b/gi;

  while ((m = embedRelRegex.exec(text)) !== null) {
    const fullMatch = m[0];
    const fullStart = m.index;
    const verb = m[3];
    const verbIndexInFull = fullMatch.lastIndexOf(verb);
    if (verbIndexInFull !== -1) {
      const verbStart = fullStart + verbIndexInFull;
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
