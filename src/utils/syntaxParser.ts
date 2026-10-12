import { SyntaxAnalysisResult, SyntaxToken, ClauseBreakdown } from '../types/grammar';

export interface PrecuratedSentence {
  id: string;
  sentence: string;
  label: string;
  category: string;
  result: SyntaxAnalysisResult;
}

export const PRECURATED_ANALYSES: PrecuratedSentence[] = [
  {
    id: 'inversion-sample',
    sentence: 'Never in recorded human history has science progressed at such an exponential velocity.',
    label: 'Negative Inversion (C1)',
    category: 'Stylistic Inversion',
    result: {
      sentence: 'Never in recorded human history has science progressed at such an exponential velocity.',
      structureType: 'Complex Inverted Sentence (Negative Adverbial Fronting)',
      mood: 'Indicative (Emphatic Rhetorical Cadence)',
      voice: 'Active Voice',
      primaryTense: 'Present Perfect Simple (Inverted)',
      tokens: [
        { word: 'Never', pos: 'Adv', posFull: 'Negative Adverbial', role: 'Fronted Modifier', colorClass: 'text-rose-700 bg-rose-50 border-rose-200', explanation: 'Negative frequency adverb fronted for rhetorical emphasis; triggers auxiliary inversion.' },
        { word: 'in', pos: 'Prep', posFull: 'Preposition', role: 'Adverbial Relator', colorClass: 'text-teal-700 bg-teal-50 border-teal-200', explanation: 'Introduces the prepositional phrase defining historical temporal bounds.' },
        { word: 'recorded', pos: 'Adj', posFull: 'Participle Adjective', role: 'Attributive Modifier', colorClass: 'text-amber-700 bg-amber-50 border-amber-200', explanation: 'Past participle modifying "history".' },
        { word: 'human', pos: 'Adj', posFull: 'Adjective', role: 'Attributive Modifier', colorClass: 'text-amber-700 bg-amber-50 border-amber-200', explanation: 'Qualifies the nature of history.' },
        { word: 'history', pos: 'Noun', posFull: 'Head Noun', role: 'Prepositional Object', colorClass: 'text-blue-700 bg-blue-50 border-blue-200', explanation: 'Head of the prepositional phrase.' },
        { word: 'has', pos: 'Aux', posFull: 'Auxiliary Verb', role: 'Inverted Operator', colorClass: 'text-purple-700 bg-purple-50 border-purple-200', explanation: 'Auxiliary "has" inverted to precede the grammatical subject.' },
        { word: 'science', pos: 'Noun', posFull: 'Subject Noun', role: 'Grammatical Subject', colorClass: 'text-blue-700 bg-blue-50 border-blue-200', explanation: 'Singular subject head performing the progress.' },
        { word: 'progressed', pos: 'Verb', posFull: 'Past Participle', role: 'Lexical Predicate', colorClass: 'text-indigo-700 bg-indigo-50 border-indigo-200', explanation: 'Main verb lexical head of the verb phrase.' },
        { word: 'at', pos: 'Prep', posFull: 'Preposition', role: 'Manner Relator', colorClass: 'text-teal-700 bg-teal-50 border-teal-200', explanation: 'Introduces adverbial manner phrase.' },
        { word: 'such', pos: 'Det', posFull: 'Intensifier Determiner', role: 'Degree Modifier', colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200', explanation: 'Intensifies the degree of the following noun phrase.' },
        { word: 'an', pos: 'Det', posFull: 'Indefinite Article', role: 'Determiner', colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200', explanation: 'Indefinite article chosen for vowel sound in "exponential".' },
        { word: 'exponential', pos: 'Adj', posFull: 'Adjective', role: 'Attributive Modifier', colorClass: 'text-amber-700 bg-amber-50 border-amber-200', explanation: 'Descriptive mathematical rate adjective.' },
        { word: 'velocity', pos: 'Noun', posFull: 'Noun', role: 'Prepositional Object', colorClass: 'text-blue-700 bg-blue-50 border-blue-200', explanation: 'Head noun of the terminal manner phrase.' }
      ],
      clauses: [
        {
          clauseText: 'Never in recorded human history has science progressed at such an exponential velocity.',
          type: 'Independent Clause',
          role: 'Main Matrix Clause',
          explanation: 'Contains complete grammatical thought with inverted operator-subject order (Aux "has" + Subj "science").'
        }
      ],
      pedagogicalNote: 'Notice how the fronting of "Never" forces the auxiliary "has" to jump in front of "science". Standard non-inverted equivalent: "Science has never progressed at such an exponential velocity in recorded human history."'
    }
  },
  {
    id: 'conditional-inverted-sample',
    sentence: 'Had the archivist examined the watermarks earlier, the forgery would have been detected.',
    label: 'Inverted 3rd Conditional (C1)',
    category: 'Counterfactual Conditionals',
    result: {
      sentence: 'Had the archivist examined the watermarks earlier, the forgery would have been detected.',
      structureType: 'Complex Conditional Sentence (Inverted Protasis & Passive Apodosis)',
      mood: 'Subjunctive / Counterfactual Conditional',
      voice: 'Passive Voice',
      primaryTense: 'Third Conditional (Past Perfect + Modal Perfect Passive)',
      tokens: [
        { word: 'Had', pos: 'Aux', posFull: 'Fronted Auxiliary', role: 'Conditional Marker', colorClass: 'text-purple-700 bg-purple-50 border-purple-200', explanation: 'Fronted auxiliary replacing "If... had".' },
        { word: 'the', pos: 'Det', posFull: 'Definite Article', role: 'Determiner', colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200', explanation: 'Specifies the particular archivist.' },
        { word: 'archivist', pos: 'Noun', posFull: 'Agent Noun', role: 'Subordinate Subject', colorClass: 'text-blue-700 bg-blue-50 border-blue-200', explanation: 'Logical agent of the conditional hypothesis.' },
        { word: 'examined', pos: 'Verb', posFull: 'Past Participle', role: 'Subordinate Predicate', colorClass: 'text-indigo-700 bg-indigo-50 border-indigo-200', explanation: 'Lexical action of inspection.' },
        { word: 'the', pos: 'Det', posFull: 'Definite Article', role: 'Determiner', colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200', explanation: 'Specifies the watermarks.' },
        { word: 'watermarks', pos: 'Noun', posFull: 'Plural Noun', role: 'Direct Object', colorClass: 'text-blue-700 bg-blue-50 border-blue-200', explanation: 'Object of examination in the protasis.' },
        { word: 'earlier', pos: 'Adv', posFull: 'Comparative Adverb', role: 'Adverbial of Time', colorClass: 'text-rose-700 bg-rose-50 border-rose-200', explanation: 'Modifies the timing of the examination.' },
        { word: 'the', pos: 'Det', posFull: 'Definite Article', role: 'Determiner', colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200', explanation: 'Specifies the fraudulent document.' },
        { word: 'forgery', pos: 'Noun', posFull: 'Patient Noun', role: 'Matrix Subject', colorClass: 'text-blue-700 bg-blue-50 border-blue-200', explanation: 'Syntactic subject receiving the detection action.' },
        { word: 'would', pos: 'Modal', posFull: 'Modal Auxiliary', role: 'Conditional Modal', colorClass: 'text-purple-700 bg-purple-50 border-purple-200', explanation: 'Establishes counterfactual consequence.' },
        { word: 'have', pos: 'Aux', posFull: 'Perfect Auxiliary', role: 'Aspect Auxiliary', colorClass: 'text-purple-700 bg-purple-50 border-purple-200', explanation: 'Signals retrospective past horizon.' },
        { word: 'been', pos: 'Aux', posFull: 'Passive Auxiliary', role: 'Voice Auxiliary', colorClass: 'text-purple-700 bg-purple-50 border-purple-200', explanation: 'Passivizes the subsequent participle.' },
        { word: 'detected', pos: 'Verb', posFull: 'Past Participle', role: 'Matrix Predicate', colorClass: 'text-indigo-700 bg-indigo-50 border-indigo-200', explanation: 'Lexical verb receiving passive action.' }
      ],
      clauses: [
        {
          clauseText: 'Had the archivist examined the watermarks earlier',
          type: 'Conditional Clause',
          role: 'Protasis (Unreal Condition)',
          explanation: 'Inverted clause expressing counterfactual past requirement (equivalent to: "If the archivist had examined").'
        },
        {
          clauseText: 'the forgery would have been detected',
          type: 'Independent Clause',
          role: 'Apodosis (Consequence Matrix)',
          explanation: 'Main clause in passive voice with modal perfect auxiliary cluster.'
        }
      ],
      pedagogicalNote: 'A textbook example of formal elevated academic English: eliminates "if" via subject-auxiliary inversion in the protasis and employs passive voice in the apodosis.'
    }
  },
  {
    id: 'relative-clause-sample',
    sentence: 'The astronomer who charted the exoplanet published an exhaustive monograph in October.',
    label: 'Defining Relative Clause (B1)',
    category: 'Complex Relative Clauses',
    result: {
      sentence: 'The astronomer who charted the exoplanet published an exhaustive monograph in October.',
      structureType: 'Complex Sentence with Defining (Restrictive) Relative Clause',
      mood: 'Indicative',
      voice: 'Active Voice',
      primaryTense: 'Past Simple',
      tokens: [
        { word: 'The', pos: 'Det', posFull: 'Definite Article', role: 'Determiner', colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200', explanation: 'Specifies the astronomer.' },
        { word: 'astronomer', pos: 'Noun', posFull: 'Head Noun', role: 'Matrix Subject', colorClass: 'text-blue-700 bg-blue-50 border-blue-200', explanation: 'Primary grammatical subject of the sentence.' },
        { word: 'who', pos: 'Pron', posFull: 'Relative Pronoun', role: 'Subordinate Subject', colorClass: 'text-cyan-700 bg-cyan-50 border-cyan-200', explanation: 'Refers back to astronomer; acts as subject of relative clause.' },
        { word: 'charted', pos: 'Verb', posFull: 'Past Simple Verb', role: 'Subordinate Predicate', colorClass: 'text-indigo-700 bg-indigo-50 border-indigo-200', explanation: 'Verbal action inside relative clause.' },
        { word: 'the', pos: 'Det', posFull: 'Definite Article', role: 'Determiner', colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200', explanation: 'Specifies the exoplanet.' },
        { word: 'exoplanet', pos: 'Noun', posFull: 'Noun', role: 'Subordinate Object', colorClass: 'text-blue-700 bg-blue-50 border-blue-200', explanation: 'Direct object of "charted".' },
        { word: 'published', pos: 'Verb', posFull: 'Past Simple Verb', role: 'Matrix Predicate', colorClass: 'text-indigo-700 bg-indigo-50 border-indigo-200', explanation: 'Main verb of the whole sentence.' },
        { word: 'an', pos: 'Det', posFull: 'Indefinite Article', role: 'Determiner', colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200', explanation: 'Indefinite article before vowel sound.' },
        { word: 'exhaustive', pos: 'Adj', posFull: 'Attributive Adjective', role: 'Modifier', colorClass: 'text-amber-700 bg-amber-50 border-amber-200', explanation: 'Modifies monograph.' },
        { word: 'monograph', pos: 'Noun', posFull: 'Head Noun', role: 'Matrix Direct Object', colorClass: 'text-blue-700 bg-blue-50 border-blue-200', explanation: 'Direct object receiving publication.' },
        { word: 'in', pos: 'Prep', posFull: 'Preposition', role: 'Temporal Relator', colorClass: 'text-teal-700 bg-teal-50 border-teal-200', explanation: 'Time preposition for months.' },
        { word: 'October', pos: 'Noun', posFull: 'Proper Noun', role: 'Prepositional Object', colorClass: 'text-blue-700 bg-blue-50 border-blue-200', explanation: 'Time anchor specifying month.' }
      ],
      clauses: [
        {
          clauseText: 'who charted the exoplanet',
          type: 'Relative Clause',
          role: 'Defining Post-Modifier of "astronomer"',
          explanation: 'Restricts and identifies which specific astronomer is being referred to (no commas).'
        },
        {
          clauseText: 'The astronomer published an exhaustive monograph in October',
          type: 'Independent Clause',
          role: 'Matrix Main Clause',
          explanation: 'Core SVO predication: Subject "astronomer" + Verb "published" + Object "monograph".'
        }
      ],
      pedagogicalNote: 'Because the relative clause is defining (essential to distinguish which astronomer), no commas enclose it, and the matrix subject embraces it directly.'
    }
  },
  {
    id: 'cleft-sentence-sample',
    sentence: 'It was during the late Bronze Age that maritime trade expanded across the Aegean Sea.',
    label: 'Cleft Sentence for Focus (C1)',
    category: 'Information Packaging',
    result: {
      sentence: 'It was during the late Bronze Age that maritime trade expanded across the Aegean Sea.',
      structureType: 'It-Cleft Sentence (Thematic Foregrounding)',
      mood: 'Indicative',
      voice: 'Active Voice',
      primaryTense: 'Past Simple',
      tokens: [
        { word: 'It', pos: 'Pron', posFull: 'Dummy / Expletive Pronoun', role: 'Cleft Pronoun', colorClass: 'text-cyan-700 bg-cyan-50 border-cyan-200', explanation: 'Expletive "It" occupying grammatical subject position without referent.' },
        { word: 'was', pos: 'Verb', posFull: 'Copula Verb', role: 'Cleft Copula', colorClass: 'text-indigo-700 bg-indigo-50 border-indigo-200', explanation: 'Past form of "be" serving as structural cleft anchor.' },
        { word: 'during', pos: 'Prep', posFull: 'Preposition', role: 'Temporal Relator', colorClass: 'text-teal-700 bg-teal-50 border-teal-200', explanation: 'Introduces the focused temporal phrase.' },
        { word: 'the', pos: 'Det', posFull: 'Definite Article', role: 'Determiner', colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200', explanation: 'Determiner for chronological era.' },
        { word: 'late', pos: 'Adj', posFull: 'Adjective', role: 'Temporal Modifier', colorClass: 'text-amber-700 bg-amber-50 border-amber-200', explanation: 'Specifies sub-period.' },
        { word: 'Bronze', pos: 'Noun', posFull: 'Noun Adjunct', role: 'Attributive Modifier', colorClass: 'text-blue-700 bg-blue-50 border-blue-200', explanation: 'Part of historical compound name.' },
        { word: 'Age', pos: 'Noun', posFull: 'Proper Noun', role: 'Prepositional Object', colorClass: 'text-blue-700 bg-blue-50 border-blue-200', explanation: 'Focal point of the cleft construction.' },
        { word: 'that', pos: 'Conj', posFull: 'Cleft Complementizer', role: 'Cleft Relator', colorClass: 'text-teal-700 bg-teal-50 border-teal-200', explanation: 'Introduces the presupposed background clause.' },
        { word: 'maritime', pos: 'Adj', posFull: 'Adjective', role: 'Attributive Modifier', colorClass: 'text-amber-700 bg-amber-50 border-amber-200', explanation: 'Modifies trade.' },
        { word: 'trade', pos: 'Noun', posFull: 'Head Noun', role: 'Background Subject', colorClass: 'text-blue-700 bg-blue-50 border-blue-200', explanation: 'Subject of the subordinate clause.' },
        { word: 'expanded', pos: 'Verb', posFull: 'Past Simple Verb', role: 'Background Predicate', colorClass: 'text-indigo-700 bg-indigo-50 border-indigo-200', explanation: 'Main action in background clause.' },
        { word: 'across', pos: 'Prep', posFull: 'Preposition', role: 'Spatial Relator', colorClass: 'text-teal-700 bg-teal-50 border-teal-200', explanation: 'Introduces spatial direction phrase.' },
        { word: 'the', pos: 'Det', posFull: 'Definite Article', role: 'Determiner', colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200', explanation: 'Mandatory article for named sea.' },
        { word: 'Aegean', pos: 'Adj', posFull: 'Proper Adjective', role: 'Geographical Modifier', colorClass: 'text-amber-700 bg-amber-50 border-amber-200', explanation: 'Proper descriptor for sea.' },
        { word: 'Sea', pos: 'Noun', posFull: 'Proper Noun', role: 'Prepositional Object', colorClass: 'text-blue-700 bg-blue-50 border-blue-200', explanation: 'Geographical object.' }
      ],
      clauses: [
        {
          clauseText: 'It was during the late Bronze Age',
          type: 'Independent Clause',
          role: 'Cleft Matrix (Focal Pivot)',
          explanation: 'Puts intense thematic emphasis on the exact historical era.'
        },
        {
          clauseText: 'that maritime trade expanded across the Aegean Sea',
          type: 'Subordinate Clause',
          role: 'Cleft That-Clause (Presupposed Ground)',
          explanation: 'Contains the established fact being anchored into the specific timeframe.'
        }
      ],
      pedagogicalNote: 'Cleft sentences divide a single clause into two sections to shine a spotlight on one chosen constituent ("during the late Bronze Age"). Canonical equivalent: "Maritime trade expanded across the Aegean Sea during the late Bronze Age."'
    }
  }
];

// Fallback dynamic heuristic analyzer for arbitrary user sentences
const POS_DICTIONARY: Record<string, { pos: string; posFull: string; role: string; color: string; exp: string }> = {
  // Articles & Determiners
  the: { pos: 'Det', posFull: 'Definite Article', role: 'Determiner', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', exp: 'Specifies a unique or definite referent.' },
  a: { pos: 'Det', posFull: 'Indefinite Article', role: 'Determiner', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', exp: 'Singular indefinite marker.' },
  an: { pos: 'Det', posFull: 'Indefinite Article', role: 'Determiner', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', exp: 'Indefinite marker before vowel sounds.' },
  this: { pos: 'Det', posFull: 'Demonstrative Determiner', role: 'Determiner', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', exp: 'Points to proximal entity.' },
  that: { pos: 'Det', posFull: 'Demonstrative / Complementizer', role: 'Relator / Determiner', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', exp: 'Connects clauses or points to distal entity.' },
  these: { pos: 'Det', posFull: 'Demonstrative Determiner', role: 'Determiner', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', exp: 'Plural proximal demonstrative.' },
  those: { pos: 'Det', posFull: 'Demonstrative Determiner', role: 'Determiner', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', exp: 'Plural distal demonstrative.' },
  every: { pos: 'Det', posFull: 'Distributive Determiner', role: 'Determiner', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', exp: 'Refers to each member of a group individually.' },
  all: { pos: 'Det', posFull: 'Universal Quantifier', role: 'Quantifier', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', exp: 'Encompasses entirety of set.' },

  // Pronouns
  i: { pos: 'Pron', posFull: 'Personal Pronoun (1st Sing)', role: 'Subject', color: 'text-cyan-700 bg-cyan-50 border-cyan-200', exp: 'First person subject pronoun.' },
  you: { pos: 'Pron', posFull: 'Personal Pronoun (2nd Person)', role: 'Subject/Object', color: 'text-cyan-700 bg-cyan-50 border-cyan-200', exp: 'Second person pronoun.' },
  he: { pos: 'Pron', posFull: 'Personal Pronoun (3rd Sing Masc)', role: 'Subject', color: 'text-cyan-700 bg-cyan-50 border-cyan-200', exp: 'Third person singular masculine subject.' },
  she: { pos: 'Pron', posFull: 'Personal Pronoun (3rd Sing Fem)', role: 'Subject', color: 'text-cyan-700 bg-cyan-50 border-cyan-200', exp: 'Third person singular feminine subject.' },
  it: { pos: 'Pron', posFull: 'Personal / Impersonal Pronoun', role: 'Subject/Object', color: 'text-cyan-700 bg-cyan-50 border-cyan-200', exp: 'Inanimate entity or expletive dummy pronoun.' },
  we: { pos: 'Pron', posFull: 'Personal Pronoun (1st Plur)', role: 'Subject', color: 'text-cyan-700 bg-cyan-50 border-cyan-200', exp: 'First person plural subject.' },
  they: { pos: 'Pron', posFull: 'Personal Pronoun (3rd Plur)', role: 'Subject', color: 'text-cyan-700 bg-cyan-50 border-cyan-200', exp: 'Third person plural subject.' },
  who: { pos: 'Pron', posFull: 'Relative / Interrogative Pronoun', role: 'Relative Subject', color: 'text-cyan-700 bg-cyan-50 border-cyan-200', exp: 'Refers to human subjects.' },
  whom: { pos: 'Pron', posFull: 'Relative / Interrogative Object', role: 'Relative Object', color: 'text-cyan-700 bg-cyan-50 border-cyan-200', exp: 'Formal objective case for human entities.' },
  which: { pos: 'Pron', posFull: 'Relative Pronoun', role: 'Relative Marker', color: 'text-cyan-700 bg-cyan-50 border-cyan-200', exp: 'Refers to non-human entities.' },

  // Prepositions
  in: { pos: 'Prep', posFull: 'Preposition of Place/Time', role: 'Prepositional Head', color: 'text-teal-700 bg-teal-50 border-teal-200', exp: 'Marks enclosure, year, or region.' },
  on: { pos: 'Prep', posFull: 'Preposition of Surface/Day', role: 'Prepositional Head', color: 'text-teal-700 bg-teal-50 border-teal-200', exp: 'Marks surface or specific day/date.' },
  at: { pos: 'Prep', posFull: 'Preposition of Time/Place', role: 'Prepositional Head', color: 'text-teal-700 bg-teal-50 border-teal-200', exp: 'Pinpoint precise location or clock time.' },
  by: { pos: 'Prep', posFull: 'Preposition of Agency/Time', role: 'Prepositional Head', color: 'text-teal-700 bg-teal-50 border-teal-200', exp: 'Denotes passive agent or deadline.' },
  for: { pos: 'Prep', posFull: 'Preposition of Purpose/Duration', role: 'Prepositional Head', color: 'text-teal-700 bg-teal-50 border-teal-200', exp: 'Marks duration or intended recipient.' },
  with: { pos: 'Prep', posFull: 'Preposition of Instrument/Accompaniment', role: 'Prepositional Head', color: 'text-teal-700 bg-teal-50 border-teal-200', exp: 'Marks accompaniment or instrument.' },
  without: { pos: 'Prep', posFull: 'Preposition of Exclusion', role: 'Prepositional Head', color: 'text-teal-700 bg-teal-50 border-teal-200', exp: 'Indicates absence or lack.' },
  from: { pos: 'Prep', posFull: 'Preposition of Origin', role: 'Prepositional Head', color: 'text-teal-700 bg-teal-50 border-teal-200', exp: 'Marks starting origin or source.' },
  to: { pos: 'Prep', posFull: 'Preposition of Direction / Infinitive Marker', role: 'Relator / Particle', color: 'text-teal-700 bg-teal-50 border-teal-200', exp: 'Marks destination or forms infinitive.' },

  // Conjunctions
  and: { pos: 'Conj', posFull: 'Coordinating Conjunction', role: 'Coordinator', color: 'text-teal-700 bg-teal-50 border-teal-200', exp: 'Connects equivalent syntactic elements.' },
  but: { pos: 'Conj', posFull: 'Adversative Conjunction', role: 'Coordinator', color: 'text-teal-700 bg-teal-50 border-teal-200', exp: 'Connects contrasting clauses.' },
  or: { pos: 'Conj', posFull: 'Disjunctive Conjunction', role: 'Coordinator', color: 'text-teal-700 bg-teal-50 border-teal-200', exp: 'Presents alternatives.' },
  because: { pos: 'Conj', posFull: 'Subordinating Causal Conjunction', role: 'Subordinator', color: 'text-teal-700 bg-teal-50 border-teal-200', exp: 'Introduces reason/causality clause.' },
  although: { pos: 'Conj', posFull: 'Concessive Conjunction', role: 'Subordinator', color: 'text-teal-700 bg-teal-50 border-teal-200', exp: 'Introduces counter-expectation concession.' },
  if: { pos: 'Conj', posFull: 'Conditional Conjunction', role: 'Subordinator', color: 'text-teal-700 bg-teal-50 border-teal-200', exp: 'Introduces contingency/condition.' },
  when: { pos: 'Conj', posFull: 'Temporal Conjunction', role: 'Subordinator', color: 'text-teal-700 bg-teal-50 border-teal-200', exp: 'Marks simultaneous or sequential time.' },

  // Auxiliaries & Modals
  is: { pos: 'Verb', posFull: 'Copula / Auxiliary Verb', role: 'Predicate / Auxiliary', color: 'text-purple-700 bg-purple-50 border-purple-200', exp: 'Third-person singular present form of BE.' },
  are: { pos: 'Verb', posFull: 'Copula / Auxiliary Verb', role: 'Predicate / Auxiliary', color: 'text-purple-700 bg-purple-50 border-purple-200', exp: 'Plural/second-person present form of BE.' },
  was: { pos: 'Verb', posFull: 'Copula / Auxiliary Verb', role: 'Predicate / Auxiliary', color: 'text-purple-700 bg-purple-50 border-purple-200', exp: 'Singular past form of BE.' },
  were: { pos: 'Verb', posFull: 'Copula / Auxiliary / Subjunctive', role: 'Predicate / Auxiliary', color: 'text-purple-700 bg-purple-50 border-purple-200', exp: 'Plural past or unreal subjunctive form of BE.' },
  have: { pos: 'Aux', posFull: 'Auxiliary / Lexical Verb', role: 'Aspect Auxiliary', color: 'text-purple-700 bg-purple-50 border-purple-200', exp: 'Forms present perfect aspect or possession.' },
  has: { pos: 'Aux', posFull: 'Auxiliary / Lexical Verb', role: 'Aspect Auxiliary', color: 'text-purple-700 bg-purple-50 border-purple-200', exp: 'Third person singular present perfect auxiliary.' },
  had: { pos: 'Aux', posFull: 'Auxiliary / Lexical Verb', role: 'Past Perfect Auxiliary', color: 'text-purple-700 bg-purple-50 border-purple-200', exp: 'Marks past perfect aspect or inverted conditional.' },
  will: { pos: 'Modal', posFull: 'Modal Auxiliary', role: 'Future Marker', color: 'text-purple-700 bg-purple-50 border-purple-200', exp: 'Marks future prediction, volition, or promise.' },
  would: { pos: 'Modal', posFull: 'Modal Auxiliary', role: 'Hypothetical Marker', color: 'text-purple-700 bg-purple-50 border-purple-200', exp: 'Marks hypothetical condition or polite request.' },
  can: { pos: 'Modal', posFull: 'Modal Auxiliary', role: 'Ability / Permission', color: 'text-purple-700 bg-purple-50 border-purple-200', exp: 'Denotes theoretical ability or permission.' },
  could: { pos: 'Modal', posFull: 'Modal Auxiliary', role: 'Past Ability / Polite', color: 'text-purple-700 bg-purple-50 border-purple-200', exp: 'Marks past ability or tentative possibility.' },
  must: { pos: 'Modal', posFull: 'Modal Auxiliary', role: 'Obligation / Deduction', color: 'text-purple-700 bg-purple-50 border-purple-200', exp: 'Denotes strong internal necessity or certainty.' },
  should: { pos: 'Modal', posFull: 'Modal Auxiliary', role: 'Advisory / Inversion', color: 'text-purple-700 bg-purple-50 border-purple-200', exp: 'Denotes ethical duty, advice, or formal inversion.' }
};

export function analyzeSentenceText(inputSentence: string): SyntaxAnalysisResult {
  const trimmed = inputSentence.trim();
  // Check if matches one of the curated analyses
  const matched = PRECURATED_ANALYSES.find(
    (p) => p.sentence.toLowerCase().replace(/[.,!?;:]/g, '') === trimmed.toLowerCase().replace(/[.,!?;:]/g, '')
  );
  if (matched) {
    return matched.result;
  }

  // Algorithmic parsing
  const cleanPunct = trimmed.replace(/[.,!?;:]/g, '');
  const words = cleanPunct.split(/\s+/).filter(Boolean);

  const tokens: SyntaxToken[] = words.map((w, index) => {
    const lower = w.toLowerCase();
    const dictEntry = POS_DICTIONARY[lower];
    if (dictEntry) {
      return {
        word: w,
        pos: dictEntry.pos,
        posFull: dictEntry.posFull,
        role: dictEntry.role,
        colorClass: dictEntry.color,
        explanation: dictEntry.exp
      };
    }

    // Heuristic guessing
    if (lower.endsWith('ly')) {
      return {
        word: w,
        pos: 'Adv',
        posFull: 'Manner Adverb',
        role: 'Adverbial Modifier',
        colorClass: 'text-rose-700 bg-rose-50 border-rose-200',
        explanation: 'Adverb qualifying verb, adjective, or clause.'
      };
    }
    if (lower.endsWith('ed')) {
      return {
        word: w,
        pos: 'Verb',
        posFull: 'Past Verb / Participle',
        role: 'Predicate / Modifier',
        colorClass: 'text-indigo-700 bg-indigo-50 border-indigo-200',
        explanation: 'Verb in past form or participle.'
      };
    }
    if (lower.endsWith('ing')) {
      return {
        word: w,
        pos: 'Participle/Gerund',
        posFull: 'Present Participle / Gerund',
        role: 'Continuous Predicate or Verbal Noun',
        colorClass: 'text-indigo-700 bg-indigo-50 border-indigo-200',
        explanation: 'Active ongoing participle or nominal gerund.'
      };
    }
    if (lower.endsWith('tion') || lower.endsWith('ment') || lower.endsWith('ness') || lower.endsWith('ity')) {
      return {
        word: w,
        pos: 'Noun',
        posFull: 'Abstract / Entity Noun',
        role: index === 0 || index === 1 ? 'Subject / Object' : 'Object / Modifier',
        colorClass: 'text-blue-700 bg-blue-50 border-blue-200',
        explanation: 'Nominal head noun denoting concept or entity.'
      };
    }
    if (lower.endsWith('ful') || lower.endsWith('ous') || lower.endsWith('ive') || lower.endsWith('able')) {
      return {
        word: w,
        pos: 'Adj',
        posFull: 'Attributive Adjective',
        role: 'Attributive Modifier',
        colorClass: 'text-amber-700 bg-amber-50 border-amber-200',
        explanation: 'Adjective describing qualities of a noun.'
      };
    }

    // Default positioning heuristic
    const isFirstWord = index === 0;
    return {
      word: w,
      pos: isFirstWord ? 'Noun/Pron' : 'Noun/Verb',
      posFull: isFirstWord ? 'Subject Constituent' : 'Syntactic Constituent',
      role: isFirstWord ? 'Subject Position' : 'Complement / Modifier',
      colorClass: 'text-slate-700 bg-slate-100 border-slate-200',
      explanation: 'Content word participating in sentence predication.'
    };
  });

  // Determine clauses roughly
  const hasSubordinatingConj = tokens.some((t) => ['if', 'because', 'although', 'when', 'that', 'which', 'who'].includes(t.word.toLowerCase()));
  const clauses: ClauseBreakdown[] = [];

  if (hasSubordinatingConj) {
    clauses.push({
      clauseText: trimmed,
      type: 'Subordinate Clause',
      role: 'Complex Clause Matrix',
      explanation: 'Sentence incorporates multiple clauses conjoined by subordinators or relative markers.'
    });
  } else {
    clauses.push({
      clauseText: trimmed,
      type: 'Independent Clause',
      role: 'Main Clause',
      explanation: 'Standard independent declarative clause with subject-verb predication.'
    });
  }

  // Voice estimation
  const hasBeVerb = tokens.some((t) => ['is', 'are', 'was', 'were', 'been', 'being', 'be'].includes(t.word.toLowerCase()));
  const hasEdOrV3 = tokens.some((t) => t.word.toLowerCase().endsWith('ed'));
  const isPassive = hasBeVerb && hasEdOrV3;

  return {
    sentence: trimmed,
    structureType: hasSubordinatingConj ? 'Complex Sentence' : 'Simple Canonical Sentence',
    mood: trimmed.endsWith('?') ? 'Interrogative' : trimmed.endsWith('!') ? 'Exclamatory' : 'Indicative (Declarative)',
    voice: isPassive ? 'Passive Voice' : 'Active Voice',
    primaryTense: tokens.some((t) => ['had', 'was', 'were', 'did'].includes(t.word.toLowerCase()) || t.word.toLowerCase().endsWith('ed'))
      ? 'Past Aspect'
      : 'Present Aspect',
    tokens,
    clauses,
    pedagogicalNote: 'Syntactic constituents mapped according to Standard English grammatical categories. Examine word tags to inspect functional dependencies.'
  };
}
