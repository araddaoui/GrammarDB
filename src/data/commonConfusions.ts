import { CommonConfusion } from '../types/grammar';

export const COMMON_CONFUSIONS: CommonConfusion[] = [
  {
    id: 'affect-vs-effect',
    title: 'Affect vs. Effect',
    cefr: 'B1',
    summary: 'Mastering the primary verb-noun dichotomy: "affect" typically acts as an action verb, while "effect" acts as the resultant noun.',
    items: [
      {
        term: 'Affect',
        partOfSpeech: 'Verb (predominantly)',
        definition: 'To exert an influence upon or produce a shift in something.',
        example: 'Rising tariffs will directly affect manufacturing output.',
        mnemonic: 'Remember RAVEN: Remember Affect is a Verb, Effect is a Noun.'
      },
      {
        term: 'Effect',
        partOfSpeech: 'Noun (predominantly)',
        definition: 'The consequence, result, or outcome produced by a cause.',
        example: 'The therapeutic effect of the compound was immediate.',
        mnemonic: 'Think of "Cause and Effect" or "The effect" (starts with E).'
      },
      {
        term: 'Effect (rare verb)',
        partOfSpeech: 'Verb (formal)',
        definition: 'To bring about or successfully execute change.',
        example: 'The prime minister sought to effect meaningful constitutional reform.'
      }
    ],
    pitfallTip: 'If preceded by "the", "an", or "this", you almost always need "effect". If functioning as the action performed by a subject, use "affect".',
    quickCheckQuestion: {
      sentence: 'The severe drought had a devastating ___ on agricultural yields.',
      options: ['affect', 'effect', 'affects', 'effecting'],
      correctAnswer: 'effect',
      explanation: 'Preceded by the indefinite article "a" and adjective "devastating", a noun is required: "effect".'
    }
  },
  {
    id: 'fewer-vs-less',
    title: 'Fewer vs. Less',
    cefr: 'A2',
    summary: 'Quantifying discrete countable plural items versus continuous, uncountable mass quantities or singular concepts.',
    items: [
      {
        term: 'Fewer',
        partOfSpeech: 'Determiner / Pronoun',
        definition: 'Modifies plural countable nouns that can be individually numbered.',
        example: 'There are fewer typos in the second edition than in the first.',
        mnemonic: 'If you can count them one by one (1 book, 2 books), use fewer.'
      },
      {
        term: 'Less',
        partOfSpeech: 'Determiner / Adverb',
        definition: 'Modifies singular uncountable mass nouns (fluidity, time, money, volume).',
        example: 'The new processor consumes less electrical power during peak loads.',
        mnemonic: 'Less is for mass substances and aggregate volumes (less water, less noise).'
      }
    ],
    pitfallTip: 'Expressions of time, money, and distance treated as a singular lump sum take "less" (e.g., "less than five minutes", "less than fifty dollars").',
    quickCheckQuestion: {
      sentence: 'Due to automated testing, the software release suffered ___ defects.',
      options: ['less', 'fewer', 'lesser', 'fewest of'],
      correctAnswer: 'fewer',
      explanation: '"Defects" is a plural countable noun (one defect, two defects), demanding "fewer".'
    }
  },
  {
    id: 'lie-vs-lay',
    title: 'Lie vs. Lay',
    cefr: 'B2',
    summary: 'The classic intransitive reclining verb versus the transitive object-requiring placing verb.',
    items: [
      {
        term: 'Lie (lie - lay - lain)',
        partOfSpeech: 'Intransitive Verb',
        definition: 'To rest, recline, or stay in a horizontal position (no direct object).',
        example: 'I need to lie down for an hour before dinner.',
        mnemonic: 'People lie down by themselves; objects are laid down by someone.'
      },
      {
        term: 'Lay (lay - laid - laid)',
        partOfSpeech: 'Transitive Verb',
        definition: 'To set or place down an object flat (always takes an object).',
        example: 'Please lay the blueprints on the conference table.',
        mnemonic: 'Lay requires you to lay SOMETHING down.'
      }
    ],
    pitfallTip: 'The past tense of "lie" is "lay", which creates widespread confusion: "Yesterday he lay on the sofa all afternoon."',
    quickCheckQuestion: {
      sentence: 'Exhausted by the long trek, the traveler decided to ___ on the meadow grass.',
      options: ['lay', 'lie', 'laid', 'lain'],
      correctAnswer: 'lie',
      explanation: 'Reclining oneself without a direct object in the infinitive requires "lie".'
    }
  },
  {
    id: 'principal-vs-principle',
    title: 'Principal vs. Principle',
    cefr: 'B2',
    summary: 'Distinguishing administrative leaders and primary financial sums from foundational moral and scientific tenets.',
    items: [
      {
        term: 'Principal',
        partOfSpeech: 'Noun / Adjective',
        definition: 'The chief or primary leader of a school/firm; the original capital sum of a loan; or "most important".',
        example: 'The principal reason for the postponement was inclement weather.',
        mnemonic: 'The school principal is your "pal" (or the chief person).'
      },
      {
        term: 'Principle',
        partOfSpeech: 'Noun only',
        definition: 'A fundamental doctrine, natural law, rule of conduct, or moral foundation.',
        example: 'Archimedes formulated the physical principle of buoyant displacement.',
        mnemonic: 'Principle ends in -le like "rule". Both are fundamental rules.'
      }
    ],
    pitfallTip: '"Principle" is NEVER an adjective. If you need a word modifying a noun meaning primary or foremost, it is always "principal".',
    quickCheckQuestion: {
      sentence: 'She refused to compromise on her core ethical ___.',
      options: ['principals', 'principles', 'principality', 'principally'],
      correctAnswer: 'principles',
      explanation: 'Refers to fundamental moral doctrines/rules; hence "principles".'
    }
  },
  {
    id: 'its-vs-its',
    title: 'Its vs. It’s',
    cefr: 'A1',
    summary: 'The possessive determiner versus the contraction for "it is" or "it has".',
    items: [
      {
        term: 'Its (no apostrophe)',
        partOfSpeech: 'Possessive Determiner',
        definition: 'Indicates belonging or ownership by an inanimate entity or animal.',
        example: 'The observatory rotated its dome toward Polaris.',
        mnemonic: 'Just like "his", "hers", and "theirs", possessive "its" has no apostrophe.'
      },
      {
        term: 'It’s (with apostrophe)',
        partOfSpeech: 'Contraction',
        definition: 'Short for "it is" or "it has".',
        example: 'It’s been over three centuries since Newton published the Principia.',
        mnemonic: 'Expand the sentence: if "it is" or "it has" makes sense, use the apostrophe.'
      }
    ],
    pitfallTip: 'Test by reading aloud as "it is". If saying "it is" breaks the sentence, remove the apostrophe immediately.',
    quickCheckQuestion: {
      sentence: 'The autonomous rover resumed ___ transmission after solar recharging.',
      options: ['it’s', 'its', 'its’', 'it has'],
      correctAnswer: 'its',
      explanation: 'Possessive form referring to the rover’s transmission: "its" without apostrophe.'
    }
  },
  {
    id: 'complement-vs-compliment',
    title: 'Complement vs. Compliment',
    cefr: 'B2',
    summary: 'Things that complete each other versus expressions of praise or admiration.',
    items: [
      {
        term: 'Complement',
        partOfSpeech: 'Noun / Verb',
        definition: 'To complete, harmonize with, or make whole.',
        example: 'The typography seamlessly complements the architectural illustrations.',
        mnemonic: 'Complement with an "e" completes with an "e".'
      },
      {
        term: 'Compliment',
        partOfSpeech: 'Noun / Verb',
        definition: 'An expression of praise, congratulation, or flattering remark.',
        example: 'The dean gave her a sincere compliment on her keynote lecture.',
        mnemonic: 'Compliment with an "i": "I like to give compliments."'
      }
    ],
    pitfallTip: '"Complimentary" also means provided free of charge as courtesy (e.g. complimentary breakfast).',
    quickCheckQuestion: {
      sentence: 'The crisp oak acidity served as a perfect ___ to the rich cheese.',
      options: ['compliment', 'complement', 'complementing of', 'complimentary'],
      correctAnswer: 'complement',
      explanation: 'It completes and harmonizes with the flavor, requiring "complement" with an E.'
    }
  },
  {
    id: 'who-vs-whom',
    title: 'Who vs. Whom',
    cefr: 'B2',
    summary: 'Subject pronoun (actor performing the verb) versus object pronoun (recipient of the action or preposition).',
    items: [
      {
        term: 'Who',
        partOfSpeech: 'Subject Relative / Interrogative Pronoun',
        definition: 'Refers to the subject executing the verbal action.',
        example: 'Who discovered the structure of DNA?',
        mnemonic: 'If you can substitute "he" or "they", use "who".'
      },
      {
        term: 'Whom',
        partOfSpeech: 'Object Relative / Interrogative Pronoun',
        definition: 'Refers to the recipient of an action or the object of a preposition.',
        example: 'To whom should this diplomatic courier deliver the seal?',
        mnemonic: 'If you can substitute "him" or "them", use "whom" (both end in m).'
      }
    ],
    pitfallTip: 'Directly after a preposition (to, with, for, by, about), formal English obligatorily mandates "whom": "With whom are you collaborating?"',
    quickCheckQuestion: {
      sentence: 'The candidate ___ the board appointed has extensive international experience.',
      options: ['who', 'whom', 'which', 'whose'],
      correctAnswer: 'whom',
      explanation: 'The board appointed him (object of the verb appointed), so formal grammar requires "whom".'
    }
  },
  {
    id: 'ensure-vs-insure-vs-assure',
    title: 'Ensure vs. Insure vs. Assure',
    cefr: 'B2',
    summary: 'Guaranteeing an outcome (ensure), purchasing financial coverage against loss (insure), or comforting someone to remove doubt (assure).',
    items: [
      {
        term: 'Ensure',
        partOfSpeech: 'Verb',
        definition: 'To make certain or guarantee that something occurs or is safe.',
        example: 'Please double-check the protocols to ensure compliance.',
        mnemonic: 'Ensure starts with E like "Exact" and "Make certain".'
      },
      {
        term: 'Insure',
        partOfSpeech: 'Verb',
        definition: 'To protect financially against loss, damage, or death via insurance.',
        example: 'The maritime merchant insured the cargo against piracy.',
        mnemonic: 'Insure with an I relates to Insurance policy.'
      },
      {
        term: 'Assure',
        partOfSpeech: 'Verb',
        definition: 'To state with confidence to a PERSON to remove doubt or anxieties.',
        example: 'The lead engineer assured the committee that the bridge was structurally sound.',
        mnemonic: 'You assure a person (you give them assurance).'
      }
    ],
    pitfallTip: '"Assure" always takes a human or sentient object ("assure her", "assure them"). You cannot "assure an outcome" without a person.',
    quickCheckQuestion: {
      sentence: 'The chief physician ___ the anxious relatives that the operation was routine.',
      options: ['ensured', 'insured', 'assured', 'surely told'],
      correctAnswer: 'assured',
      explanation: 'Takes a personal object ("the anxious relatives") to dispel worry, requiring "assured".'
    }
  }
];
