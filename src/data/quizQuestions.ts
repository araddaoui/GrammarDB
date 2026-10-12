import { QuizQuestion } from '../types/grammar';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    topicId: 'present-simple-continuous',
    topicTitle: 'Present Simple vs. Continuous',
    category: 'tenses-aspects',
    cefr: 'A1',
    type: 'multiple-choice',
    prompt: 'Select the grammatically correct sentence describing an astrophysicist’s routine:',
    options: [
      'Dr. Lin is analyzing star spectra every morning at 7:00 AM.',
      'Dr. Lin analyzes star spectra every morning at 7:00 AM.',
      'Dr. Lin analyze star spectra every morning at 7:00 AM.',
      'Dr. Lin is analyze star spectra every morning at 7:00 AM.'
    ],
    correctAnswer: 'Dr. Lin analyzes star spectra every morning at 7:00 AM.',
    explanation: 'Recurring habitual routines ("every morning") require Present Simple with third-person singular inflection -s.',
    ruleTip: 'Present Simple marks habitual schedules; Present Continuous is reserved for temporary or immediate events.'
  },
  {
    id: 'q2',
    topicId: 'present-perfect-past-simple',
    topicTitle: 'Present Perfect vs. Past Simple',
    category: 'tenses-aspects',
    cefr: 'B1',
    type: 'multiple-choice',
    prompt: 'Which sentence correctly accounts for the completed time anchor?',
    options: [
      'The expedition has reached the summit three days ago.',
      'The expedition reached the summit three days ago.',
      'The expedition is reaching the summit three days ago.',
      'The expedition had been reached the summit three days ago.'
    ],
    correctAnswer: 'The expedition reached the summit three days ago.',
    explanation: 'Definite completed time markers such as "three days ago" require Past Simple, not Present Perfect.',
    ruleTip: 'Never use specific finished past time indicators with Present Perfect.'
  },
  {
    id: 'q3',
    topicId: 'second-third-conditionals',
    topicTitle: 'Third Conditional',
    category: 'clauses-sentence-structure',
    cefr: 'B2',
    type: 'multiple-choice',
    prompt: 'Choose the correct counterfactual past conditional construction:',
    options: [
      'If the navigators would have seen the reef, they would alter course.',
      'If the navigators had seen the reef, they would have altered course.',
      'If the navigators had seen the reef, they will alter course.',
      'If the navigators saw the reef, they would have altered course.'
    ],
    correctAnswer: 'If the navigators had seen the reef, they would have altered course.',
    explanation: 'The standard Third Conditional uses "If + Past Perfect (had seen)" in the condition clause and "would have + Past Participle (altered)" in the consequence clause.',
    ruleTip: '"Would have" must never appear inside the "if" clause of a standard conditional sentence.'
  },
  {
    id: 'q4',
    topicId: 'mixed-inverted-conditionals',
    topicTitle: 'Inverted Conditionals',
    category: 'clauses-sentence-structure',
    cefr: 'C1',
    type: 'multiple-choice',
    prompt: 'Which elevated literary structure correctly eliminates "if" in a past conditional?',
    options: [
      'Had we known the severity of the blizzard, we would have postponed the expedition.',
      'Did we know the severity of the blizzard, we would have postponed the expedition.',
      'Were we knowing the severity of the blizzard, we would have postponed the expedition.',
      'Should we had known the severity of the blizzard, we would have postponed the expedition.'
    ],
    correctAnswer: 'Had we known the severity of the blizzard, we would have postponed the expedition.',
    explanation: 'Past counterfactual inversion is formed with "Had + Subject + Past Participle" (Had we known = If we had known).',
    ruleTip: 'Inversion of past conditionals omits "if" by fronting the auxiliary "Had".'
  },
  {
    id: 'q5',
    topicId: 'subjunctive-mood',
    topicTitle: 'Mandative Subjunctive',
    category: 'clauses-sentence-structure',
    cefr: 'C1',
    type: 'multiple-choice',
    prompt: 'Identify the sentence demonstrating accurate mandative subjunctive usage:',
    options: [
      'The regulatory board insisted that the factory adheres strictly to effluent caps.',
      'The regulatory board insisted that the factory adhered strictly to effluent caps.',
      'The regulatory board insisted that the factory adhere strictly to effluent caps.',
      'The regulatory board insisted that the factory must to adhere strictly to effluent caps.'
    ],
    correctAnswer: 'The regulatory board insisted that the factory adhere strictly to effluent caps.',
    explanation: 'In mandative subjunctive clauses introduced by verbs of mandate (insist, demand, recommend), the subordinate verb retains its uninflected base form ("adhere").',
    ruleTip: 'Subjunctive that-clauses use bare base forms regardless of singular 3rd-person subject.'
  },
  {
    id: 'q6',
    topicId: 'negative-inversion',
    topicTitle: 'Negative Inversion',
    category: 'clauses-sentence-structure',
    cefr: 'C1',
    type: 'multiple-choice',
    prompt: 'Which sentence correctly implements syntactic negative inversion?',
    options: [
      'Seldom astronomers have observed such an anomalous supernova detonation.',
      'Seldom have astronomers observed such an anomalous supernova detonation.',
      'Seldom astronomers had observed such an anomalous supernova detonation.',
      'Seldom do astronomers observed such an anomalous supernova detonation.'
    ],
    correctAnswer: 'Seldom have astronomers observed such an anomalous supernova detonation.',
    explanation: 'Fronting the negative/restrictive frequency adverb "Seldom" triggers Subject-Auxiliary inversion ("have astronomers observed").',
    ruleTip: 'Negative adverbials at the start of a sentence require auxiliary inversion.'
  },
  {
    id: 'q7',
    topicId: 'relative-clauses',
    topicTitle: 'Defining vs. Non-Defining Relative Clauses',
    category: 'clauses-sentence-structure',
    cefr: 'B1',
    type: 'multiple-choice',
    prompt: 'Which sentence demonstrates correct non-defining relative clause punctuation and pronoun choice?',
    options: [
      'Mount Everest that is the world’s tallest peak attracts hundreds of mountaineers annually.',
      'Mount Everest, that is the world’s tallest peak, attracts hundreds of mountaineers annually.',
      'Mount Everest, which is the world’s tallest peak, attracts hundreds of mountaineers annually.',
      'Mount Everest which is the world’s tallest peak attracts hundreds of mountaineers annually.'
    ],
    correctAnswer: 'Mount Everest, which is the world’s tallest peak, attracts hundreds of mountaineers annually.',
    explanation: 'Non-defining clauses require flanking commas and prohibit the pronoun "that"; use "which" for entities.',
    ruleTip: 'Relative pronoun "that" is never used in non-defining (comma-separated) clauses.'
  },
  {
    id: 'q8',
    topicId: 'modals-deduction-probability',
    topicTitle: 'Modals of Past Deduction',
    category: 'modals-auxiliaries',
    cefr: 'B2',
    type: 'multiple-choice',
    prompt: 'The laboratory lights are off and the doors are bolted. What is the correct deduction?',
    options: [
      'The researchers mustn’t be in the facility right now.',
      'The researchers can’t be in the facility right now.',
      'The researchers don’t have to be in the facility right now.',
      'The researchers wouldn’t be in the facility right now.'
    ],
    correctAnswer: 'The researchers can’t be in the facility right now.',
    explanation: 'Logical deduction of impossibility in the present requires "can’t be", never "mustn’t be" (which denotes prohibition).',
    ruleTip: 'Negative logical deduction is always expressed with "can’t", never "mustn’t".'
  },
  {
    id: 'q9',
    topicId: 'countable-uncountable-nouns',
    topicTitle: 'Countable vs. Uncountable Quantifiers',
    category: 'parts-of-speech',
    cefr: 'A2',
    type: 'multiple-choice',
    prompt: 'Which sentence correctly pairs the quantifier with its noun classification?',
    options: [
      'The senior archivist gave me several useful advices before the review.',
      'The senior archivist gave me several useful pieces of advice before the review.',
      'The senior archivist gave me many advices before the review.',
      'The senior archivist gave me an advice before the review.'
    ],
    correctAnswer: 'The senior archivist gave me several useful pieces of advice before the review.',
    explanation: '"Advice" is strictly uncountable in standard English; countable partitions require "pieces of advice".',
    ruleTip: 'Uncountable nouns cannot take plural -s or direct numeric counters without partitive expressions.'
  },
  {
    id: 'q10',
    topicId: 'adjective-order',
    topicTitle: 'Adjective Order (OSASCOMP)',
    category: 'parts-of-speech',
    cefr: 'B1',
    type: 'multiple-choice',
    prompt: 'Select the phrase observing standard Royal Adjective Order:',
    options: [
      'A circular antique French wooden dining table',
      'An antique wooden French circular dining table',
      'A French circular wooden antique dining table',
      'A wooden antique circular French dining table'
    ],
    correctAnswer: 'A circular antique French wooden dining table',
    explanation: 'Shape (circular) → Age (antique) → Origin (French) → Material (wooden) → Purpose (dining).',
    ruleTip: 'Remember OSASCOMP: Opinion, Size, Age, Shape, Color, Origin, Material, Purpose.'
  },
  {
    id: 'q11',
    topicId: 'gerunds-vs-infinitives',
    topicTitle: 'Gerunds vs. Infinitives',
    category: 'parts-of-speech',
    cefr: 'B1',
    type: 'multiple-choice',
    prompt: 'Select the sentence where "stop" means "ceased the activity entirely":',
    options: [
      'The exhausted linguist stopped to drink some water from the flask.',
      'The exhausted linguist stopped drinking caffeinated beverages before bedtime.',
      'The exhausted linguist stopped to listen to the recording.',
      'The exhausted linguist stopped to take notes in the margin.'
    ],
    correctAnswer: 'The exhausted linguist stopped drinking caffeinated beverages before bedtime.',
    explanation: '"Stop + Gerund" signifies terminating a habit or action. "Stop + Infinitive" signifies pausing in order to perform an action.',
    ruleTip: 'Stop + -ing = discontinue action; Stop + to do = pause in order to do something else.'
  },
  {
    id: 'q12',
    topicId: 'subject-verb-agreement',
    topicTitle: 'Subject-Verb Agreement',
    category: 'syntax-mechanics',
    cefr: 'B1',
    type: 'multiple-choice',
    prompt: 'Select the sentence with impeccable subject-verb concord:',
    options: [
      'The collection of rare Mesoamerican codices are stored in the subterranean vault.',
      'The collection of rare Mesoamerican codices is stored in the subterranean vault.',
      'The collection of rare Mesoamerican codices were stored in the subterranean vault.',
      'The collection of rare Mesoamerican codices have been stored in the subterranean vault.'
    ],
    correctAnswer: 'The collection of rare Mesoamerican codices is stored in the subterranean vault.',
    explanation: 'The head subject noun is singular "collection"; intervening prepositional phrase "of codices" does not alter concord.',
    ruleTip: 'Intervening phrases between the head noun and verb do not change the subject’s grammatical number.'
  },
  {
    id: 'q13',
    topicId: 'transitive-intransitive-verbs',
    topicTitle: 'Lie vs. Lay Concord',
    category: 'parts-of-speech',
    cefr: 'B2',
    type: 'multiple-choice',
    prompt: 'Choose the correct form of the intransitive verb in the past simple:',
    options: [
      'The tired archaeologist laid on the cot for three hours yesterday.',
      'The tired archaeologist lay on the cot for three hours yesterday.',
      'The tired archaeologist has lain on the cot for three hours yesterday.',
      'The tired archaeologist was lied on the cot for three hours yesterday.'
    ],
    correctAnswer: 'The tired archaeologist lay on the cot for three hours yesterday.',
    explanation: 'The past tense of intransitive "lie" (to recline) is "lay". Transitive "laid" would require an object.',
    ruleTip: 'Lie (recline) past simple is "lay". Lay (place down) past simple is "laid".'
  },
  {
    id: 'q14',
    topicId: 'dangling-misplaced-modifiers',
    topicTitle: 'Dangling Modifiers',
    category: 'syntax-mechanics',
    cefr: 'C1',
    type: 'error-spot',
    prompt: 'Which version eliminates the dangling modifier flaw in: "Walking through the archaeological site, a Roman mosaic was discovered"?',
    options: [
      'Walking through the archaeological site, the Roman mosaic caught our attention.',
      'Walking through the archaeological site, the team discovered a Roman mosaic.',
      'While walking through the archaeological site, a Roman mosaic became visible.',
      'A Roman mosaic was discovered, walking through the archaeological site.'
    ],
    correctAnswer: 'Walking through the archaeological site, the team discovered a Roman mosaic.',
    explanation: 'The agent performing the introductory participle action ("Walking...") must immediately follow as the subject of the main clause ("the team").',
    ruleTip: 'Introductory participial modifiers grammatically attach to the immediate subject following the comma.'
  },
  {
    id: 'q15',
    topicId: 'punctuation-mechanics',
    topicTitle: 'Semicolons & Conjunctive Adverbs',
    category: 'syntax-mechanics',
    cefr: 'B2',
    type: 'multiple-choice',
    prompt: 'Choose the sentence punctuated with impeccable classical precision:',
    options: [
      'The initial survey yielded inconclusive results, however, the team continued drilling.',
      'The initial survey yielded inconclusive results; however, the team continued drilling.',
      'The initial survey yielded inconclusive results; however the team continued drilling.',
      'The initial survey yielded inconclusive results, however; the team continued drilling.'
    ],
    correctAnswer: 'The initial survey yielded inconclusive results; however, the team continued drilling.',
    explanation: 'Conjunctive adverbs ("however", "furthermore", "therefore") connecting two independent clauses take a semicolon before and a comma after.',
    ruleTip: 'Join independent clauses with "; however," to prevent comma splices.'
  }
];
