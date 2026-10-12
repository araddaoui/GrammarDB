export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type GrammarCategory =
  | 'tenses-aspects'
  | 'parts-of-speech'
  | 'clauses-sentence-structure'
  | 'modals-auxiliaries'
  | 'syntax-mechanics'
  | 'prepositions-idiomatic';

export interface GrammarFormula {
  label: string;
  structure: string;
  example: string;
}

export interface GrammarExample {
  sentence: string;
  explanation: string;
  highlightWords?: string[];
  isCorrect?: boolean;
}

export interface CommonMistakeItem {
  incorrect: string;
  corrected: string;
  explanation: string;
}

export interface GrammarTopic {
  id: string;
  title: string;
  category: GrammarCategory;
  cefr: CEFRLevel;
  summary: string;
  formulas: GrammarFormula[];
  keyRules: string[];
  examples: GrammarExample[];
  commonMistakes: CommonMistakeItem[];
  signalsAndKeywords: string[];
  relatedTopicIds?: string[];
}

export interface IrregularVerb {
  v1: string; // Base / Infinitive
  v2: string; // Past Simple
  v3: string; // Past Participle
  thirdPerson: string; // 3rd Person Singular
  ingForm: string; // Present Participle
  ipa: string; // Phonetic transcription
  patternGroup: 'AAA' | 'ABA' | 'ABB' | 'ABC';
  cefr: CEFRLevel;
  definition: string;
  examples: string[];
  collocations: string[];
}

export interface CommonConfusion {
  id: string;
  title: string;
  cefr: CEFRLevel;
  summary: string;
  items: {
    term: string;
    partOfSpeech: string;
    definition: string;
    example: string;
    mnemonic?: string;
  }[];
  pitfallTip: string;
  quickCheckQuestion: {
    sentence: string; // contains blank ___
    options: string[];
    correctAnswer: string;
    explanation: string;
  };
}

export interface QuizQuestion {
  id: string;
  topicId: string;
  topicTitle: string;
  category: GrammarCategory;
  cefr: CEFRLevel;
  type: 'multiple-choice' | 'fill-blank' | 'error-spot';
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  ruleTip: string;
}

export interface SyntaxToken {
  word: string;
  pos: string; // Part of Speech (Noun, Verb, Aux, Adj, Adv, Prep, Conj, Det, Pron)
  posFull: string;
  role: string; // Subject, Predicate, Direct Object, Indirect Object, Subject Complement, Prepositional Object, Adverbial, Determiner
  colorClass: string;
  explanation: string;
}

export interface ClauseBreakdown {
  clauseText: string;
  type: 'Independent Clause' | 'Subordinate Clause' | 'Relative Clause' | 'Conditional Clause';
  role: string;
  explanation: string;
}

export interface SyntaxAnalysisResult {
  sentence: string;
  structureType: string;
  mood: string;
  voice: 'Active Voice' | 'Passive Voice';
  primaryTense: string;
  tokens: SyntaxToken[];
  clauses: ClauseBreakdown[];
  pedagogicalNote: string;
}
