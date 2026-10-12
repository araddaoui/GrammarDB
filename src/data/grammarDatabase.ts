import { GrammarTopic } from '../types/grammar';

export const GRAMMAR_TOPICS: GrammarTopic[] = [
  // --- TENSES & ASPECTS ---
  {
    id: 'present-simple-continuous',
    title: 'Present Simple vs. Present Continuous',
    category: 'tenses-aspects',
    cefr: 'A1',
    summary: 'Contrasting habitual/permanent states and universal facts with temporary actions unfolding at or around the moment of speaking.',
    formulas: [
      { label: 'Present Simple Affirmative', structure: 'Subject + Base Verb (+ -s/-es for 3rd person singular)', example: 'The train departs at 08:30 every morning.' },
      { label: 'Present Simple Negative', structure: 'Subject + do/does not + Base Verb', example: 'She does not consume dairy products.' },
      { label: 'Present Continuous Affirmative', structure: 'Subject + am/is/are + Verb-ing', example: 'They are currently refurbishing the central library.' },
      { label: 'Present Continuous Question', structure: 'Am/Is/Are + Subject + Verb-ing?', example: 'Is the system processing your payment right now?' }
    ],
    keyRules: [
      'Use Present Simple for general truths, scientific laws, scheduled timetables, and recurring routines.',
      'Use Present Continuous for ongoing events, temporary arrangements, and irritating repeated actions with "always".',
      'Stative verbs (know, believe, understand, belong, seem, prefer) strictly reject the continuous aspect unless expressing a temporary dynamic action (e.g., "I am tasting the soup").',
      'Third-person singular inflection in Present Simple requires adding -s, -es, or -ies (watches, studies, fixes).'
    ],
    examples: [
      { sentence: 'Water boils at 100 degrees Celsius under standard atmospheric pressure.', explanation: 'Universal scientific law requires Present Simple.', highlightWords: ['boils'] },
      { sentence: 'Economists are investigating how inflation affects consumer sentiment this quarter.', explanation: 'Active ongoing investigation within an extended temporary timeframe.', highlightWords: ['are investigating'] },
      { sentence: 'I think you are right.', explanation: 'Stative belief verb; "I am thinking" would mean actively deliberating.', highlightWords: ['think'] },
      { sentence: 'He is always interrupting colleagues during board meetings.', explanation: 'Expressing annoyance with continuous + always.', highlightWords: ['is always interrupting'] }
    ],
    commonMistakes: [
      { incorrect: 'I am not believing your explanation.', corrected: 'I do not believe your explanation.', explanation: '"Believe" is a stative verb of mental state and cannot take continuous aspect in this context.' },
      { incorrect: 'The flight is leaving at 6:00 PM tomorrow.', corrected: 'The flight leaves at 6:00 PM tomorrow.', explanation: 'Fixed official timetables use Present Simple, though Present Continuous is permitted for personal scheduled arrangements.' },
      { incorrect: 'She go to the university by tram.', corrected: 'She goes to the university by tram.', explanation: 'Subject-verb agreement requires third-person singular suffix -es after verbs ending in vowels or sibilants.' }
    ],
    signalsAndKeywords: ['always', 'usually', 'often', 'seldom', 'at the moment', 'currently', 'right now', 'these days', 'every week'],
    relatedTopicIds: ['present-perfect-past-simple', 'stative-dynamic-verbs']
  },
  {
    id: 'present-perfect-past-simple',
    title: 'Present Perfect vs. Past Simple',
    category: 'tenses-aspects',
    cefr: 'B1',
    summary: 'Navigating the distinction between completed past events tied to a finished time period versus indefinite experiences and past events bearing direct present relevance.',
    formulas: [
      { label: 'Past Simple Affirmative', structure: 'Subject + Verb-ed (or Irregular V2)', example: 'Archaeologists discovered the artifact in 1922.' },
      { label: 'Past Simple Question', structure: 'Did + Subject + Base Verb?', example: 'Did the delegation arrive yesterday?' },
      { label: 'Present Perfect Affirmative', structure: 'Subject + have/has + Past Participle (V3)', example: 'Researchers have published three seminal papers this year.' },
      { label: 'Present Perfect Negative', structure: 'Subject + have/has not + Past Participle (V3)', example: 'We have not yet received formal authorization.' }
    ],
    keyRules: [
      'Past Simple requires an explicit or implicit finished time anchor (yesterday, in 2018, three hours ago, when I was young).',
      'Present Perfect connects the past to the present moment: life experiences without specific dates ("Have you ever visited?"), unfinished time frames ("this morning" while still morning), and recent events with observable present results.',
      'Never use specific past time markers (yesterday, last year, at 4 PM) with Present Perfect.',
      'Use "for" with periods of duration (for six years) and "since" with specific starting points (since 2019, since Tuesday).'
    ],
    examples: [
      { sentence: 'The team completed the phase one clinical trials in November 2024.', explanation: 'Definite completed time boundary necessitates Past Simple.', highlightWords: ['completed', 'in November 2024'] },
      { sentence: 'She has worked in genomic research for over fifteen years.', explanation: 'Unbroken continuum extending up to the current moment.', highlightWords: ['has worked', 'for over fifteen years'] },
      { sentence: 'I lost my keys, so I cannot unlock the laboratory door.', explanation: 'Past action with direct, critical present consequence.', highlightWords: ['lost', 'cannot unlock'] }
    ],
    commonMistakes: [
      { incorrect: 'I have seen that documentary yesterday evening.', corrected: 'I saw that documentary yesterday evening.', explanation: '"Yesterday evening" is a closed past time frame; it demands Past Simple.' },
      { incorrect: 'She is living in Vienna since three years.', corrected: 'She has lived (or has been living) in Vienna for three years.', explanation: 'Duration leading up to now takes Present Perfect + "for", not Present Simple + "since".' },
      { incorrect: 'Did you ever been to Kyoto?', corrected: 'Have you ever been to Kyoto?', explanation: 'Inquiring about life experience without a specified date requires Present Perfect.' }
    ],
    signalsAndKeywords: ['yesterday', 'ago', 'in [year]', 'already', 'yet', 'just', 'ever', 'never', 'so far', 'since', 'for'],
    relatedTopicIds: ['present-perfect-continuous', 'past-perfect']
  },
  {
    id: 'present-perfect-continuous',
    title: 'Present Perfect Continuous',
    category: 'tenses-aspects',
    cefr: 'B1',
    summary: 'Focusing on the ongoing duration, process, or visible physical aftermath of an activity that began in the past and continues into or impacts the present.',
    formulas: [
      { label: 'Affirmative', structure: 'Subject + have/has been + Verb-ing', example: 'The turbines have been generating electricity without interruption for 48 hours.' },
      { label: 'Negative', structure: 'Subject + have/has not been + Verb-ing', example: 'The committee has not been meeting regularly this quarter.' },
      { label: 'Interrogative', structure: 'Have/Has + Subject + been + Verb-ing?', example: 'How long have you been studying Indo-European syntax?' }
    ],
    keyRules: [
      'Emphasizes the duration or process of the activity rather than the final quantitative outcome or completed product.',
      'Frequently used to explain present physical evidence or symptoms (e.g., "The ground is damp because it has been raining").',
      'For state verbs or inquiries about quantitative total counts ("How many books?"), use Present Perfect Simple instead ("How many books have you written?", not "have you been writing?").'
    ],
    examples: [
      { sentence: 'The software engineers have been debugging the authentication microservice all morning.', explanation: 'Focuses on the continuous exhausting effort spanning the morning.', highlightWords: ['have been debugging'] },
      { sentence: 'Why are your hands stained with ink? — I have been refilling the fountain pens.', explanation: 'Visible present physical aftermath of a recent activity.', highlightWords: ['have been refilling'] }
    ],
    commonMistakes: [
      { incorrect: 'How many essays have you been grading today?', corrected: 'How many essays have you graded today?', explanation: 'When asking for a quantitative completed count or result, use Present Perfect Simple.' },
      { incorrect: 'I have been knowing him for ten years.', corrected: 'I have known him for ten years.', explanation: '"Know" is stative and cannot take continuous aspect.' }
    ],
    signalsAndKeywords: ['all day', 'all week', 'how long', 'for [duration]', 'since [point]', 'lately', 'recently'],
    relatedTopicIds: ['present-perfect-past-simple', 'past-perfect-continuous']
  },
  {
    id: 'past-perfect-and-continuous',
    title: 'Past Perfect & Past Perfect Continuous',
    category: 'tenses-aspects',
    cefr: 'B2',
    summary: 'Establishing chronological depth in narrative discourse by anchoring actions that took place prior to another defined past reference point.',
    formulas: [
      { label: 'Past Perfect Simple', structure: 'Subject + had + Past Participle (V3)', example: 'By the time the fire brigade arrived, residents had already evacuated the premises.' },
      { label: 'Past Perfect Continuous', structure: 'Subject + had been + Verb-ing', example: 'He had been lecturing for two hours before the microphone malfunctioned.' }
    ],
    keyRules: [
      'The Past Perfect operates as the "past of the past" to prevent chronological ambiguity.',
      'If two past events are narrated in strict chronological sequence with conjunctions like "after" or "before", Past Simple for both is often acceptable, but Past Perfect is essential when reversing narrative order or clarifying causation.',
      'Past Perfect Continuous highlights the ongoing duration or cumulative fatigue leading up to a specific past milestone.'
    ],
    examples: [
      { sentence: 'When the treaty was ratified, the diplomats had negotiated for fourteen uninterrupted months.', explanation: 'The 14-month negotiation preceded the treaty ratification.', highlightWords: ['had negotiated', 'was ratified'] },
      { sentence: 'Her eyes stung because she had been staring at the electron microscope all afternoon.', explanation: 'Past continuous exertion causing a subsequent past condition.', highlightWords: ['had been staring', 'stung'] }
    ],
    commonMistakes: [
      { incorrect: 'When I reached the station, the train already left.', corrected: 'When I reached the station, the train had already left.', explanation: 'The departure preceded the arrival; Past Perfect is required to indicate sequence.' },
      { incorrect: 'She had lived there in 1999.', corrected: 'She lived there in 1999.', explanation: 'A standalone finished past year does not need Past Perfect without a later past reference point.' }
    ],
    signalsAndKeywords: ['by the time', 'already', 'scarcely... when', 'no sooner... than', 'had never before', 'prior to'],
    relatedTopicIds: ['present-perfect-past-simple', 'third-conditional']
  },
  {
    id: 'future-forms-modalities',
    title: 'Future Forms: Will, Going to & Present Aspects',
    category: 'tenses-aspects',
    cefr: 'A2',
    summary: 'Distinguishing spontaneous decisions, predictions based on opinion versus evidence, prior intentions, and fixed diary arrangements.',
    formulas: [
      { label: 'Spontaneous Decision / Prediction', structure: 'will + Base Verb', example: 'The telephone is ringing; I will answer it.' },
      { label: 'Prior Intention / Evidence Prediction', structure: 'am/is/are going to + Base Verb', example: 'Look at those dark cumulus clouds; it is going to rain.' },
      { label: 'Scheduled Personal Arrangement', structure: 'am/is/are + Verb-ing (Present Continuous)', example: 'We are dining with the department dean on Thursday.' },
      { label: 'Fixed Timetable / Schedule', structure: 'Base Verb (Present Simple)', example: 'The symposium commences at 09:00 on Monday.' }
    ],
    keyRules: [
      'Use "will" for instantaneous decisions made at the moment of speaking, unconditional future facts, and promises/offers.',
      'Use "be going to" when an intention was formulated prior to speaking, or when sensory evidence in the present indicates an imminent outcome.',
      'Use Present Continuous for confirmed arrangements involving other people or fixed calendar bookings.',
      'In adverbial time clauses introduced by when, as soon as, before, after, until, use Present Simple, NEVER future will.'
    ],
    examples: [
      { sentence: 'As soon as the laboratory results arrive, we will inform the chief medical officer.', explanation: 'Present Simple in time clause ("arrive"), will in the main clause.', highlightWords: ['arrive', 'will inform'] },
      { sentence: 'They have secured planning permission and are going to construct a solar park.', explanation: 'Pre-existing intention backed by preparatory action.', highlightWords: ['are going to construct'] }
    ],
    commonMistakes: [
      { incorrect: 'I will call you when I will arrive at the terminal.', corrected: 'I will call you when I arrive at the terminal.', explanation: 'Future "will" is ungrammatical inside temporal subordinate clauses.' },
      { incorrect: 'Look at the child on the ledge! He will fall!', corrected: 'Look at the child on the ledge! He is going to fall!', explanation: 'Immediate visual evidence requires "be going to".' }
    ],
    signalsAndKeywords: ['as soon as', 'when', 'tomorrow', 'next week', 'intend to', 'plan to', 'in the near future'],
    relatedTopicIds: ['future-perfect-continuous', 'first-conditional']
  },
  {
    id: 'future-perfect-and-continuous',
    title: 'Future Perfect & Future Continuous',
    category: 'tenses-aspects',
    cefr: 'B2',
    summary: 'Projecting completion milestones looking backward from a future horizon, and depicting activities in progress at a future instant.',
    formulas: [
      { label: 'Future Continuous', structure: 'Subject + will be + Verb-ing', example: 'At 15:00 tomorrow, the council will be voting on the environmental resolution.' },
      { label: 'Future Perfect Simple', structure: 'Subject + will have + Past Participle (V3)', example: 'By 2030, the consortium will have completed the oceanic survey.' }
    ],
    keyRules: [
      'Future Continuous captures an action that will be mid-progress at a specific specified moment in the future.',
      'Future Perfect projects forward to a future deadline ("by [time]") and views the preceding action as finished.',
      'The preposition "by" (meaning not later than) is the classic hallmark of the Future Perfect.'
    ],
    examples: [
      { sentence: 'By the time the audit finishes, the inspectors will have examined over ten thousand invoices.', explanation: 'Completion before the stated future checkpoint.', highlightWords: ['will have examined', 'by the time'] },
      { sentence: 'Please do not phone between 2 and 4 PM, as we will be administering the final examination.', explanation: 'Action in full swing during that future time window.', highlightWords: ['will be administering'] }
    ],
    commonMistakes: [
      { incorrect: 'By next year, they will finish the highway.', corrected: 'By next year, they will have finished the highway.', explanation: '"By [time]" denotes completion prior to a horizon, demanding Future Perfect.' }
    ],
    signalsAndKeywords: ['by next month', 'by the time', 'by then', 'this time next year', 'at this hour tomorrow'],
    relatedTopicIds: ['future-forms-modalities', 'past-perfect-and-continuous']
  },

  // --- CLAUSES & SENTENCE STRUCTURE ---
  {
    id: 'conditionals-zero-first',
    title: 'Zero & First Conditionals (Real Conditions)',
    category: 'clauses-sentence-structure',
    cefr: 'A2',
    summary: 'Expressing universal natural laws, logical truths, and highly probable future consequences conditioned on realistic prerequisites.',
    formulas: [
      { label: 'Zero Conditional (General Truths)', structure: 'If/When + Present Simple, Present Simple', example: 'If you heat ice to zero degrees Celsius, it melts.' },
      { label: 'First Conditional (Real Future Probability)', structure: 'If + Present Simple, will/can/may + Base Verb', example: 'If the treaty passes the senate, trade tariffs will decrease.' }
    ],
    keyRules: [
      'Zero Conditional handles scientific certainties, mechanical causality, and permanent correlations; "when" can freely replace "if".',
      'First Conditional handles realistic possibilities in the future. The condition clause (protasis) uses Present Simple, NOT "will".',
      'Imperatives can replace the main clause in First Conditional instructions: "If you observe smoke, press the alarm bell immediately."'
    ],
    examples: [
      { sentence: 'If phosphorus comes into contact with air, it ignites spontaneously.', explanation: 'Universal scientific reality (Zero Conditional).', highlightWords: ['comes', 'ignites'] },
      { sentence: 'If the budget deficit widens, the central bank will raise interest rates.', explanation: 'Plausible macroeconomic contingency (First Conditional).', highlightWords: ['widens', 'will raise'] }
    ],
    commonMistakes: [
      { incorrect: 'If it will rain tomorrow, the outdoor concert will be canceled.', corrected: 'If it rains tomorrow, the outdoor concert will be canceled.', explanation: 'The "if" clause takes Present Simple for future conditions, never "will".' }
    ],
    signalsAndKeywords: ['if', 'unless (= if not)', 'provided that', 'as long as', 'in case'],
    relatedTopicIds: ['second-third-conditionals', 'mixed-inverted-conditionals']
  },
  {
    id: 'second-third-conditionals',
    title: 'Second & Third Conditionals (Hypothetical & Counterfactual)',
    category: 'clauses-sentence-structure',
    cefr: 'B1',
    summary: 'Contemplating unreal or improbable scenarios in the present/future, and reconstructing counterfactual regrets and alternate past outcomes.',
    formulas: [
      { label: 'Second Conditional (Hypothetical Present/Future)', structure: 'If + Past Simple (were), would/could/might + Base Verb', example: 'If the museum possessed sufficient capital, it would acquire the manuscript.' },
      { label: 'Third Conditional (Counterfactual Past)', structure: 'If + Past Perfect, would/could/might have + Past Participle', example: 'If the navigator had noticed the submerged reef, the ship would not have run aground.' }
    ],
    keyRules: [
      'In formal Second Conditional, the subjunctive "were" is preferred over "was" for all persons ("If she were in charge...").',
      'Second Conditional deals with imaginary or contrary-to-fact present states (e.g., "If I spoke fluent Japanese...").',
      'Third Conditional deals with past events that cannot be changed; it is purely retrospective and counterfactual.',
      'Never place "would have" inside the "if" clause of a standard conditional.'
    ],
    examples: [
      { sentence: 'If I were you, I would consult an intellectual property attorney without delay.', explanation: 'Classic hypothetical advisory structure with subjunctive "were".', highlightWords: ['were', 'would consult'] },
      { sentence: 'Had the meteorologist issued a timely storm alert, fewer vessels would have capsized.', explanation: 'Formal inverted Third Conditional expressing past counterfactual causality.', highlightWords: ['Had... issued', 'would have capsized'] }
    ],
    commonMistakes: [
      { incorrect: 'If I would have known about the deadline, I would have submitted the application.', corrected: 'If I had known about the deadline, I would have submitted the application.', explanation: '"Would have" cannot occupy the "if" clause; use Past Perfect ("had known").' },
      { incorrect: 'If he was the president, he would lower taxes.', corrected: 'If he were the president, he would lower taxes.', explanation: 'Formal English prescribes subjunctive "were" in unreal conditionals.' }
    ],
    signalsAndKeywords: ['if I were you', 'supposing', 'had I known', 'what if', 'otherwise'],
    relatedTopicIds: ['conditionals-zero-first', 'mixed-inverted-conditionals', 'subjunctive-mood']
  },
  {
    id: 'mixed-inverted-conditionals',
    title: 'Mixed Conditionals & Inversion',
    category: 'clauses-sentence-structure',
    cefr: 'C1',
    summary: 'Linking past actions to present outcomes (or permanent traits to past behavior), alongside sophisticated stylistic inversion omitting "if".',
    formulas: [
      { label: 'Mixed Type 1: Past Action → Present Consequence', structure: 'If + Past Perfect, would/could + Base Verb', example: 'If we had booked the tickets earlier, we would be sitting in the front row right now.' },
      { label: 'Mixed Type 2: Permanent Trait → Past Outcome', structure: 'If + Past Simple, would/could have + Past Participle', example: 'If he were not so obstinate, he would have accepted their compromise yesterday.' },
      { label: 'Inverted Conditionals (Omitting "if")', structure: 'Had/Were/Should + Subject + ...', example: 'Should you require further documentation, please do not hesitate to contact our registry.' }
    ],
    keyRules: [
      'Mixed Conditionals breach standard tense symmetry to reflect realistic temporal relationships across different time frames.',
      'Type 1 mixed conditional: a past event (which did or did not happen) has an ongoing observable effect right now.',
      'Inversion eliminates "if": "If you should need" becomes "Should you need"; "If I had known" becomes "Had I known"; "If it were not for" becomes "Were it not for".'
    ],
    examples: [
      { sentence: 'Had the vaccine been synthesized earlier, thousands of hospitalizations would have been averted.', explanation: 'Elevated literary inversion substituting for "If the vaccine had been synthesized".', highlightWords: ['Had the vaccine been synthesized'] },
      { sentence: 'If she had not studied German at Oxford, she would not be working at the embassy today.', explanation: 'Past study directly fuels present employment status.', highlightWords: ['had not studied', 'would not be working'] }
    ],
    commonMistakes: [
      { incorrect: 'Had you to require assistance, call me.', corrected: 'Should you require assistance, call me.', explanation: 'Present/future inverted conditional uses auxiliary "Should", not "Had to".' },
      { incorrect: 'If I had slept well last night, I will not be tired now.', corrected: 'If I had slept well last night, I would not be tired now.', explanation: 'Unreal condition in the past affecting present requires modal "would", not indicative "will".' }
    ],
    signalsAndKeywords: ['had I known', 'should you require', 'were it not for', 'but for', 'otherwise'],
    relatedTopicIds: ['second-third-conditionals', 'negative-inversion']
  },
  {
    id: 'passive-voice-and-causatives',
    title: 'Passive Voice & Causative Structures',
    category: 'clauses-sentence-structure',
    cefr: 'B1',
    summary: 'Shifting informational focus from the agent to the patient/recipient of an action, and delegating tasks via causative have/get.',
    formulas: [
      { label: 'General Passive Formula', structure: 'Subject + appropriate tense of BE + Past Participle (V3) (+ by Agent)', example: 'Penicillin was discovered by Alexander Fleming in 1928.' },
      { label: 'Causative "Have Something Done"', structure: 'Subject + have + Object + Past Participle (V3)', example: 'The publisher had the manuscript copyedited prior to typesetting.' },
      { label: 'Causative "Get Someone to Do Something"', structure: 'Subject + get + Person + to + Base Verb', example: 'We got an independent auditor to examine the ledgers.' }
    ],
    keyRules: [
      'Use passive voice when the agent is unknown, obvious from context, confidential, or when the object carries higher thematic prominence.',
      'Only transitive verbs (verbs that take a direct object) can be converted into the passive. Intransitive verbs (die, happen, arrive, occur) NEVER take passive form.',
      'Prepositional phrases retain their prepositions directly after the passive participle: "The proposal was agreed upon."'
    ],
    examples: [
      { sentence: 'The Gothic cathedral was constructed over a span of two centuries.', explanation: 'Agent is unstated; historical monument is the primary topic.', highlightWords: ['was constructed'] },
      { sentence: 'The director had the executive summary translated into Mandarin.', explanation: 'Causative structure: arranged for professional translation.', highlightWords: ['had', 'translated'] }
    ],
    commonMistakes: [
      { incorrect: 'An unforeseen accident was happened on the expressway.', corrected: 'An unforeseen accident happened on the expressway.', explanation: '"Happen" is an intransitive verb and cannot be conjugated in the passive voice.' },
      { incorrect: 'I had my car to wash yesterday.', corrected: 'I had my car washed yesterday.', explanation: 'Causative "have + object" requires a past participle ("washed"), not an infinitive.' }
    ],
    signalsAndKeywords: ['by [agent]', 'was built', 'has been confirmed', 'is being tested', 'have something done'],
    relatedTopicIds: ['passive-reporting-verbs', 'transitive-intransitive-verbs']
  },
  {
    id: 'passive-reporting-verbs',
    title: 'Passive with Reporting Verbs & Impersonal Passive',
    category: 'clauses-sentence-structure',
    cefr: 'C1',
    summary: 'Distancing journalistic and academic claims through impersonal formulations such as "It is believed that..." and personal subject-raising "He is alleged to have...".',
    formulas: [
      { label: 'Impersonal "It" Construction', structure: 'It + is/was + Passive Reporting Verb + that-clause', example: 'It is widely believed that climate volatility will exacerbate migration patterns.' },
      { label: 'Personal Subject-Raising Construction', structure: 'Subject + is/was + Passive Reporting Verb + to-infinitive (or perfect infinitive)', example: 'The elusive manuscript is believed to date back to the tenth century.' }
    ],
    keyRules: [
      'Common reporting verbs: allege, believe, consider, estimate, expect, know, report, rumour, say, understand.',
      'If the reported event occurred prior to the reporting moment, use the perfect infinitive "to have + V3" (e.g., "The artifact is thought to have originated in Mesopotamia").',
      'This register is standard in scholarly papers, investigative journalism, legal briefings, and diplomacy to avoid unverified libel.'
    ],
    examples: [
      { sentence: 'The suspect is reported to have fled across the international border under an alias.', explanation: 'Subject-raising with perfect infinitive signifying prior action.', highlightWords: ['is reported to have fled'] },
      { sentence: 'It is anticipated that consumer spending will rebound during the second fiscal quarter.', explanation: 'Impersonal passive asserting widespread forecast consensus.', highlightWords: ['It is anticipated that'] }
    ],
    commonMistakes: [
      { incorrect: 'He is said that he is the richest man in the province.', corrected: 'It is said that he is the richest man in the province. / He is said to be the richest man in the province.', explanation: 'Do not mix the impersonal "It is said that" with personal subject extraction.' }
    ],
    signalsAndKeywords: ['it is said that', 'is believed to be', 'is thought to have', 'it is understood that', 'is alleged to have'],
    relatedTopicIds: ['passive-voice-and-causatives', 'reported-speech']
  },
  {
    id: 'reported-speech',
    title: 'Reported Speech & Backshifting',
    category: 'clauses-sentence-structure',
    cefr: 'B2',
    summary: 'Systematic tense backshifting, modal transformations, and deictic pronoun/time adjustments when conveying spoken or written statements secondhand.',
    formulas: [
      { label: 'Statement Reporting', structure: 'Subject + said (that) / told someone (that) + Backshifted Clause', example: '"I am revising the draft" → She said she was revising the draft.' },
      { label: 'Yes/No Question Reporting', structure: 'Subject + asked + if/whether + Subject + Verb (Statement Word Order)', example: '"Do you support the bill?" → He asked whether they supported the bill.' },
      { label: 'Wh- Question Reporting', structure: 'Subject + asked + question word + Subject + Verb', example: '"Where did you locate the data?" → She asked where I had located the data.' }
    ],
    keyRules: [
      'Tense backshift table: Present Simple → Past Simple; Present Continuous → Past Continuous; Past Simple / Present Perfect → Past Perfect; will → would; can → could; may → might.',
      'Modals that do NOT backshift: could, would, should, might, ought to, had better.',
      'Backshifting is optional if the statement conveys a permanent universal truth ("Copernicus proved that the Earth revolves around the Sun") or is still true at the moment of reporting.',
      'Deictic shifts: now → then; today → that day; yesterday → the day before; tomorrow → the following day; here → there; this → that.'
    ],
    examples: [
      { sentence: 'The director announced that the laboratory had secured a five-year federal grant.', explanation: 'Present Perfect "has secured" backshifts to Past Perfect "had secured".', highlightWords: ['announced that', 'had secured'] },
      { sentence: 'The detective inquired where the security guard had been stationed that evening.', explanation: 'Wh- question retains normal S-V declarative order, not question inversion.', highlightWords: ['inquired where', 'had been stationed'] }
    ],
    commonMistakes: [
      { incorrect: 'She asked me where did I live.', corrected: 'She asked me where I lived.', explanation: 'Indirect questions require statement word order (Subject + Verb), never auxiliary inversion.' },
      { incorrect: 'He said to me that he will come tomorrow.', corrected: 'He told me that he would come the next day.', explanation: '"Say" cannot take a bare personal object without "to", prefer "told me"; "will" backshifts to "would".' }
    ],
    signalsAndKeywords: ['claimed that', 'stated that', 'inquired whether', 'wondered if', 'the following day', 'the previous week'],
    relatedTopicIds: ['passive-reporting-verbs', 'past-perfect-and-continuous']
  },
  {
    id: 'relative-clauses',
    title: 'Defining vs. Non-Defining Relative Clauses',
    category: 'clauses-sentence-structure',
    cefr: 'B1',
    summary: 'Integrating essential restrictive identifying details versus extra non-restrictive biographical or descriptive commentary separated by commas.',
    formulas: [
      { label: 'Defining (Restrictive) Relative Clause', structure: 'Noun + who/which/that/whose/whom + clause (NO COMMAS)', example: 'The algorithm that optimizes solar array tilt was developed in Munich.' },
      { label: 'Non-Defining Relative Clause', structure: 'Noun, who/which/whose/whom + clause, + main clause (COMMAS MANDATORY)', example: 'Dr. Evelyn Carter, who pioneered crisp CRISPR techniques, delivered the keynote address.' }
    ],
    keyRules: [
      'Defining clauses restrict and pinpoint the specific referent; without the clause, the sentence loses its intended meaning.',
      'Non-defining clauses supply supplementary parenthetical commentary. They MUST be enclosed in commas and NEVER permit the pronoun "that".',
      'The relative pronoun can be omitted in defining clauses ONLY when it functions as the grammatical object of the clause: "The book (which) I purchased yesterday."',
      '"Whom" is formal object case for persons; "whose" marks possession for both persons and inanimate objects.'
    ],
    examples: [
      { sentence: 'Students who maintain a grade point average above 3.8 are eligible for the fellowship.', explanation: 'Defining: only those specific qualifying students are eligible.', highlightWords: ['who maintain'] },
      { sentence: 'The Hubble Space Telescope, which was launched in 1990, has revolutionized modern observational cosmology.', explanation: 'Non-defining: the name already uniquely identifies the subject; commas obligatory.', highlightWords: [', which was launched in 1990,'] }
    ],
    commonMistakes: [
      { incorrect: 'My mother, that lives in Toronto, is visiting next weekend.', corrected: 'My mother, who lives in Toronto, is visiting next weekend.', explanation: 'The relative pronoun "that" can NEVER be used in non-defining clauses; use "who" for persons.' },
      { incorrect: 'The colleague which I spoke to was very accommodating.', corrected: 'The colleague whom (or who / that) I spoke to was very accommodating.', explanation: '"Which" cannot refer to human beings.' }
    ],
    signalsAndKeywords: ['who', 'which', 'that', 'whose', 'whom', 'where', 'when', 'why'],
    relatedTopicIds: ['reduced-participle-clauses', 'punctuation-mechanics']
  },
  {
    id: 'reduced-participle-clauses',
    title: 'Reduced Relative & Participle Clauses',
    category: 'clauses-sentence-structure',
    cefr: 'B2',
    summary: 'Streamlining prose by converting full relative clauses into compact present (-ing), past (-ed), and perfect having done participle structures.',
    formulas: [
      { label: 'Present Participle Reduction (Active)', structure: 'Noun + Verb-ing phrase', example: 'Passengers carrying oversized luggage must proceed to the oversize baggage counter.' },
      { label: 'Past Participle Reduction (Passive)', structure: 'Noun + Verb-ed/V3 phrase', example: 'Artifacts excavated from the tomb are exhibited in the national gallery.' },
      { label: 'Perfect Participle Clause (Sequential Action)', structure: 'Having + Past Participle, Main Clause', example: 'Having completed the preliminary clinical trials, the pharmaceutical company sought regulatory review.' }
    ],
    keyRules: [
      'An active relative clause ("passengers who carry...") reduces to the present participle (-ing).',
      'A passive relative clause ("artifacts that were excavated...") reduces directly to the past participle (-ed/V3).',
      'Perfect participles ("Having arrived early...") emphasize that the action in the participle clause concluded before the main verb began.',
      'The implicit logical subject of an initial participle clause MUST match the grammatical subject of the main clause, otherwise it creates a "dangling participle".'
    ],
    examples: [
      { sentence: 'Deprived of sunlight, the seedlings withered within a fortnight.', explanation: 'Passive participle clause equivalent to "Because they were deprived of sunlight".', highlightWords: ['Deprived of sunlight'] },
      { sentence: 'Having reviewed the statistical anomalies, the auditor scheduled a forensic inquiry.', explanation: 'Chronological completion preceding the main clause action.', highlightWords: ['Having reviewed the statistical anomalies'] }
    ],
    commonMistakes: [
      { incorrect: 'Walking into the laboratory, the fire alarm sounded.', corrected: 'Walking into the laboratory, the technician heard the fire alarm sound.', explanation: 'Dangling participle: the alarm was not walking into the laboratory.' }
    ],
    signalsAndKeywords: ['having finished', 'while conducting', 'once established', 'located in', 'consisting of'],
    relatedTopicIds: ['relative-clauses', 'dangling-misplaced-modifiers']
  },
  {
    id: 'subjunctive-mood',
    title: 'The Subjunctive Mood',
    category: 'clauses-sentence-structure',
    cefr: 'C1',
    summary: 'Expressing urgency, mandate, necessity, and formal resolutions through base-form mandative clauses and the hypothetical were-subjunctive.',
    formulas: [
      { label: 'Mandative Subjunctive', structure: 'Verb/Adjective of Urgency + that + Subject + Base Verb', example: 'The magistrate insisted that the defendant remain in the jurisdiction.' },
      { label: 'Formulaic Subjunctive', structure: 'Fixed idiomatic archaic formulas', example: 'Be that as it may, we must proceed with caution.' },
      { label: 'Hypothetical Were-Subjunctive', structure: 'wish / as if / if + Subject + were', example: 'He behaves as if he were an omniscient authority on macroeconomics.' }
    ],
    keyRules: [
      'In the mandative subjunctive, the verb in the that-clause remains in its uninflected base form (infinitive without to), regardless of the subject person or tense.',
      'Trigger verbs: demand, insist, recommend, request, require, suggest, urge, propose.',
      'Trigger adjectives: crucial, essential, imperative, vital, necessary, mandatory, obligatory.',
      'Negation takes bare "not" directly before the base verb without "do/does/did": "I demand that he not attend."'
    ],
    examples: [
      { sentence: 'It is imperative that every researcher submit their conflict-of-interest declarations prior to Friday.', explanation: 'Mandative subjunctive: uninflected base form "submit" with 3rd-person singular "every researcher".', highlightWords: ['imperative that', 'submit'] },
      { sentence: 'The board recommended that she not divest from the overseas subsidiary.', explanation: 'Subjunctive negation without "does not": "not divest".', highlightWords: ['recommended that', 'not divest'] }
    ],
    commonMistakes: [
      { incorrect: 'The judge ordered that the prisoner is remanded in custody.', corrected: 'The judge ordered that the prisoner be remanded in custody.', explanation: 'Subjunctive mandative clause requires base verb "be", not indicative "is".' },
      { incorrect: 'I suggest that he goes to see a cardiologist.', corrected: 'I suggest that he go to see a cardiologist.', explanation: 'The mandative subjunctive requires base form "go", not "goes".' }
    ],
    signalsAndKeywords: ['it is essential that', 'insist that', 'recommend that', 'vital that', 'demand that', 'lest', 'be that as it may'],
    relatedTopicIds: ['second-third-conditionals', 'negative-inversion']
  },
  {
    id: 'negative-inversion',
    title: 'Negative Inversion & Stylistic Fronting',
    category: 'clauses-sentence-structure',
    cefr: 'C1',
    summary: 'Inverting subject and auxiliary verb following fronted restrictive or negative adverbs to achieve rhetorical emphasis and dramatic cadence.',
    formulas: [
      { label: 'Standard Negative Inversion', structure: 'Negative Adverbial + Auxiliary Verb + Subject + Main Verb', example: 'Never in recorded human history has science progressed at such an exponential velocity.' },
      { label: 'Correlative Inversion (Not only... but also)', structure: 'Not only + Aux + Subject + Verb, but Subject also + Verb', example: 'Not only did the engineers construct the bridge ahead of schedule, but they also reduced expenditures.' },
      { label: 'Hardly / Scarcely Inversion', structure: 'Hardly/Scarcely + had + Subject + V3 + when + Past Simple', example: 'Scarcely had the president concluded the address when the audience erupted in applause.' }
    ],
    keyRules: [
      'Triggers include: Never, Rarely, Seldom, Little, Barely, Scarcely, Hardly, Nowhere, Under no circumstances, On no account, At no time, In no way.',
      'If the original clause lacks an auxiliary, insert do / does / did based on tense and subject.',
      'In "Only after", "Only when", and "Not until" clauses, the inversion occurs in the MAIN clause, not in the adverbial time clause: "Not until the data was verified did they publish."'
    ],
    examples: [
      { sentence: 'Under no circumstances should sensitive biographical credentials be disclosed to unauthorized personnel.', explanation: 'Inverted modal "should" preceding subject "credentials".', highlightWords: ['Under no circumstances should sensitive biographical credentials be disclosed'] },
      { sentence: 'Not until the preliminary trials concluded did the research consortium publish its initial findings.', explanation: 'Inversion of auxiliary "did" in the main clause following a fronted "Not until" clause.', highlightWords: ['Not until', 'did the research consortium publish'] }
    ],
    commonMistakes: [
      { incorrect: 'Rarely we have witnessed such extraordinary artistic mastery.', corrected: 'Rarely have we witnessed such extraordinary artistic mastery.', explanation: 'Fronted negative adverbial "Rarely" triggers auxiliary-subject inversion: "have we".' },
      { incorrect: 'Not only she arrived late, but she forgot her notes.', corrected: 'Not only did she arrive late, but she forgot her notes.', explanation: 'Requires auxiliary insertion: "did she arrive".' }
    ],
    signalsAndKeywords: ['rarely', 'seldom', 'never before', 'under no circumstances', 'scarcely... when', 'no sooner... than', 'little did they know'],
    relatedTopicIds: ['subjunctive-mood', 'mixed-inverted-conditionals']
  },

  // --- MODALS & AUXILIARIES ---
  {
    id: 'modals-obligation-necessity',
    title: 'Modals of Obligation, Prohibition & Necessity',
    category: 'modals-auxiliaries',
    cefr: 'B1',
    summary: 'Articulating internal versus external obligations (must vs have to), absence of obligation (needn’t), and strict prohibitions (must not).',
    formulas: [
      { label: 'Internal Moral / Personal Obligation', structure: 'must + Base Verb', example: 'I must discipline myself to read scholarly journals every weekend.' },
      { label: 'External Legal / Institutional Requirement', structure: 'have to / has to + Base Verb', example: 'All foreign visitors have to obtain an entry visa before departure.' },
      { label: 'Absence of Obligation', structure: 'do not have to / need not + Base Verb', example: 'You do not have to wear formal black tie; smart casual attire is acceptable.' },
      { label: 'Strict Prohibition', structure: 'must not (mustn’t) + Base Verb', example: 'Vehicles must not park in designated fire hydrants lanes.' }
    ],
    keyRules: [
      '"Must" conveys the speaker’s personal authority, conviction, or acute urgency.',
      '"Have to" conveys an objective, external mandate imposed by law, company policy, or physical reality.',
      '"Don’t have to" signifies freedom of choice (optionality), whereas "must not" signifies absolute prohibition.',
      'In the past tense, "must" for obligation has no past form; you MUST use "had to": "We had to evacuate."'
    ],
    examples: [
      { sentence: 'Medical practitioners must sanitize surgical instruments before entering the operating theater.', explanation: 'Imperative procedural and ethical duty.', highlightWords: ['must sanitize'] },
      { sentence: 'Employees do not have to clock in on national bank holidays.', explanation: 'Absence of necessity; duty is waived.', highlightWords: ['do not have to clock in'] }
    ],
    commonMistakes: [
      { incorrect: 'Yesterday I must renew my passport at the embassy.', corrected: 'Yesterday I had to renew my passport at the embassy.', explanation: '"Must" lacks a past tense form for obligation; substitute "had to".' },
      { incorrect: 'You mustn’t pay for admission; it is completely free today.', corrected: 'You don’t have to pay for admission; it is completely free today.', explanation: '"Mustn’t" indicates prohibition; when something is optional or free, use "don’t have to".' }
    ],
    signalsAndKeywords: ['must', 'have to', 'need to', 'must not', 'do not have to', 'ought to', 'had better'],
    relatedTopicIds: ['modals-deduction-probability']
  },
  {
    id: 'modals-deduction-probability',
    title: 'Modals of Deduction, Certainty & Past Regret',
    category: 'modals-auxiliaries',
    cefr: 'B2',
    summary: 'Evaluating degrees of epistemic probability in the present and deducing past events with modal perfects (must have, can’t have, might have).',
    formulas: [
      { label: 'Present High Certainty (Positive)', structure: 'must + Base Verb', example: 'His coat is still on the rack; he must be in the library annex.' },
      { label: 'Present High Certainty (Negative)', structure: 'cannot (can’t) + Base Verb', example: 'She cannot be seventy years old; she graduated university in 2012.' },
      { label: 'Past High Certainty', structure: 'must have + Past Participle (V3)', example: 'The roads are glistening wet; it must have rained during the night.' },
      { label: 'Past Impossibility', structure: 'cannot/could not have + Past Participle', example: 'The suspect cannot have committed the burglary; surveillance confirms he was in Madrid.' },
      { label: 'Past Criticism / Unfulfilled Duty', structure: 'should have / ought to have + Past Participle', example: 'The municipality should have reinforced the flood defenses years ago.' }
    ],
    keyRules: [
      'The opposite of "must be" for deduction is "can’t be", NEVER "mustn’t be" (which is strictly prohibition).',
      'For past deductions based on present forensic clues, use modal + have + V3.',
      '"Could have + V3" denotes an ability or opportunity in the past that was not utilized: "We could have purchased the house, but we declined."',
      '"Needn’t have + V3" means an action was performed, but proved to be completely unnecessary in hindsight.'
    ],
    examples: [
      { sentence: 'The ancient astronomers must have possessed sophisticated mathematical charts to predict lunar eclipses.', explanation: 'Logical retrospective deduction of near certainty based on artifacts.', highlightWords: ['must have possessed'] },
      { sentence: 'You should have notified the security supervisor the instant you detected the perimeter breach.', explanation: 'Retrospective criticism of unperformed moral duty.', highlightWords: ['should have notified'] }
    ],
    commonMistakes: [
      { incorrect: 'It is midnight and the lights are out; they mustn’t be home.', corrected: 'It is midnight and the lights are out; they can’t be home.', explanation: 'Negative logical deduction requires "can’t", never "mustn’t".' },
      { incorrect: 'He must to have forgotten our appointment.', corrected: 'He must have forgotten our appointment.', explanation: 'Modal verbs are followed by bare infinitive without "to".' }
    ],
    signalsAndKeywords: ['must have', 'can’t have', 'might have', 'could have', 'should have', 'ought to have', 'needn’t have'],
    relatedTopicIds: ['modals-obligation-necessity', 'past-perfect-and-continuous']
  },

  // --- PARTS OF SPEECH & SYNTACTIC MECHANICS ---
  {
    id: 'articles-determiners',
    title: 'Articles: Definite, Indefinite & Zero Article',
    category: 'parts-of-speech',
    cefr: 'A2',
    summary: 'Deciding between specific identifier "the", generic non-specific "a/an", and the zero article (∅) across countable, uncountable, and abstract nouns.',
    formulas: [
      { label: 'Indefinite Article (A / An)', structure: 'A + consonant sound / An + vowel sound + Singular Countable Noun', example: 'An hour passed before a European diplomat initiated discussions.' },
      { label: 'Definite Article (The)', structure: 'The + Specific Known / Unique Noun', example: 'The ozone layer shields the biosphere from ultraviolet radiation.' },
      { label: 'Zero Article (∅)', structure: '∅ + Plural Generic Noun / Uncountable Abstract Noun', example: '∅ Wisdom cannot be acquired solely through ∅ textbook memorization.' }
    ],
    keyRules: [
      'The choice between "a" and "an" is determined strictly by the initial phonetic SOUND, not the spelling letter: "a university" (/juː/), "an honest man" (/ɒn/).',
      'Use "the" when both speaker and listener know exactly which entity is being discussed, with unique entities (the sun, the equator), and superlatives (the highest peak).',
      'Use the zero article (no article) for plural nouns when speaking generally ("Dogs are loyal companions"), proper names, continents, most countries, and abstract concepts in broad terms.',
      'Geographical names with "the": mountain ranges (the Alps), island chains (the Bahamas), rivers/oceans (the Danube, the Atlantic), and countries with plural/political words (the United Kingdom, the Netherlands).'
    ],
    examples: [
      { sentence: 'An honest historian seeks the truth regardless of political pressure.', explanation: 'Phonetic vowel sound /ɒ/ demands "An honest"; unique specific target is "the truth".', highlightWords: ['An honest', 'the truth'] },
      { sentence: 'Water covers approximately 71 percent of the Earth’s surface.', explanation: 'Zero article before general substance "Water"; "the" before planetary body.', highlightWords: ['Water', 'the Earth’s'] }
    ],
    commonMistakes: [
      { incorrect: 'He is an university professor.', corrected: 'He is a university professor.', explanation: '"University" begins with a consonant glide sound /j/, requiring article "a".' },
      { incorrect: 'The life is full of unexpected surprises.', corrected: 'Life is full of unexpected surprises.', explanation: 'Abstract nouns in a universal, generalized philosophical sense take zero article.' }
    ],
    signalsAndKeywords: ['a', 'an', 'the', 'zero article', 'unique referent', 'general plural'],
    relatedTopicIds: ['countable-uncountable-nouns', 'adjective-order']
  },
  {
    id: 'countable-uncountable-nouns',
    title: 'Countable vs. Uncountable Nouns & Quantifiers',
    category: 'parts-of-speech',
    cefr: 'A2',
    summary: 'Distinguishing discrete countable entities from continuous substances and mass nouns, paired with quantifiers like many, much, few, and little.',
    formulas: [
      { label: 'Countable Quantifiers', structure: 'many / few / a few / fewer / a number of + Plural Countable Noun', example: 'Fewer students enrolled in classical philology this semester.' },
      { label: 'Uncountable Quantifiers', structure: 'much / little / a little / less / an amount of + Uncountable Noun', example: 'There is little evidence to corroborate the initial hypothesis.' },
      { label: 'Universal Quantifiers', structure: 'some / any / a lot of / plenty of + Either Noun Class', example: 'They discovered plenty of archaeological artifacts and plenty of evidence.' }
    ],
    keyRules: [
      'Uncountable nouns in English (frequently countable in other languages): information, advice, equipment, luggage, furniture, research, news, progress, accommodation.',
      'Uncountable nouns take a singular verb and cannot be directly preceded by "a/an" or numerals without a partitive measure word ("a piece of information", "an item of luggage").',
      '"Few" and "little" (without "a") convey negative scarcity ("hardly any"). "A few" and "a little" convey positive modest sufficiency ("some").',
      '"Fewer" is for countable plural entities ("fewer errors"); "less" is for uncountable mass ("less friction").'
    ],
    examples: [
      { sentence: 'The committee provided invaluable advice regarding intellectual property protection.', explanation: '"Advice" is uncountable; never say "an advice" or "advices".', highlightWords: ['invaluable advice'] },
      { sentence: 'There were few objections to the proposal, so it was adopted with near unanimity.', explanation: '"Few" conveys scarcity (almost zero objections).', highlightWords: ['few objections'] }
    ],
    commonMistakes: [
      { incorrect: 'Can you provide me with some informations?', corrected: 'Can you provide me with some information?', explanation: '"Information" is strictly uncountable in standard English; no plural -s.' },
      { incorrect: 'There were less people at the seminar than anticipated.', corrected: 'There were fewer people at the seminar than anticipated.', explanation: '"People" is a countable plural noun; standard grammar prescribes "fewer".' }
    ],
    signalsAndKeywords: ['much', 'many', 'fewer', 'less', 'a few', 'a little', 'a piece of', 'uncountable'],
    relatedTopicIds: ['articles-determiners', 'subject-verb-agreement']
  },
  {
    id: 'adjective-order',
    title: 'Royal Order of Adjectives',
    category: 'parts-of-speech',
    cefr: 'B1',
    summary: 'Mastering the conventional chronological hierarchy governing multiple attributive adjectives stacked before a noun head.',
    formulas: [
      { label: 'Adjective Order Sequence', structure: 'Opinion → Size → Physical Quality → Age → Shape → Color → Origin → Material → Purpose + Noun', example: 'A charming (Opinion) small (Size) antique (Age) round (Shape) walnut (Material) dining (Purpose) table.' }
    ],
    keyRules: [
      'The standard sequence mnemonic: OSASCOMP (Opinion, Size, Age, Shape, Color, Origin, Material, Purpose).',
      'Opinion adjectives (beautiful, awful, innovative, elegant) always precede objective factual physical descriptors.',
      'Purpose adjectives sit closest to the noun head (e.g. running shoes, sleeping bag, writing desk).',
      'Coordinate adjectives of the same class modifying a noun take commas ("a calm, contemplative scholar").'
    ],
    examples: [
      { sentence: 'The museum acquired a rare antique Venetian glass chandelier.', explanation: 'Opinion/Quality (rare) → Age (antique) → Origin (Venetian) → Material (glass).', highlightWords: ['rare antique Venetian glass'] },
      { sentence: 'She wore an elegant long black silk evening dress.', explanation: 'Opinion (elegant) → Size (long) → Color (black) → Material (silk) → Purpose (evening).', highlightWords: ['elegant long black silk evening'] }
    ],
    commonMistakes: [
      { incorrect: 'They bought a wooden circular dining table.', corrected: 'They bought a circular wooden dining table.', explanation: 'Shape (circular) must precede Material (wooden).' },
      { incorrect: 'A Italian beautiful sports car.', corrected: 'A beautiful Italian sports car.', explanation: 'Subjective Opinion (beautiful) must precede Origin (Italian).' }
    ],
    signalsAndKeywords: ['OSASCOMP', 'opinion', 'size', 'age', 'shape', 'color', 'origin', 'material', 'purpose'],
    relatedTopicIds: ['articles-determiners', 'gradable-non-gradable-adjectives']
  },
  {
    id: 'gradable-non-gradable-adjectives',
    title: 'Gradable vs. Non-Gradable (Extreme) Adjectives',
    category: 'parts-of-speech',
    cefr: 'B2',
    summary: 'Pairing degree adverbs accurately with scalable scalar adjectives versus absolute, extreme, or classifying binary adjectives.',
    formulas: [
      { label: 'Gradable Adverbs', structure: 'very / extremely / quite / slightly + Gradable Adjective', example: 'The symposium hall was very cold (cold is scalable from chilly to freezing).' },
      { label: 'Non-Gradable Adverbs', structure: 'absolutely / completely / utterly / totally + Extreme/Absolute Adjective', example: 'The researchers were utterly exhausted after the 36-hour field expedition.' }
    ],
    keyRules: [
      'Gradable adjectives measure qualities existing along a continuous spectrum (hot, cold, tired, angry, good, bad). They pair with "very", "fairly", "slightly".',
      'Extreme adjectives denote the absolute zenith of a quality (freezing, boiling, exhausted, furious, fantastic, catastrophic). They CANNOT pair with "very"; use "absolutely", "utterly".',
      'Absolute/Binary adjectives denote all-or-nothing states (dead, alive, impossible, unique, pregnant, infinite). Use "completely" or no modifier.',
      'The adverb "really" is versatile and can modify both gradable and non-gradable adjectives.'
    ],
    examples: [
      { sentence: 'The restoration of the cathedral fresco was an absolutely magnificent achievement.', explanation: '"Magnificent" is an extreme adjective modified by "absolutely".', highlightWords: ['absolutely magnificent'] },
      { sentence: 'The mathematical equation is utterly impossible to solve analytically.', explanation: '"Impossible" is an absolute adjective modified by "utterly".', highlightWords: ['utterly impossible'] }
    ],
    commonMistakes: [
      { incorrect: 'We were very exhausted when we reached base camp.', corrected: 'We were utterly exhausted (or completely exhausted / very tired).', explanation: '"Exhausted" already means at the limit of tiredness; it cannot take "very".' },
      { incorrect: 'The concept is very unique.', corrected: 'The concept is completely unique (or simply unique).', explanation: '"Unique" means one of a kind; uniqueness does not admit comparative degrees.' }
    ],
    signalsAndKeywords: ['absolutely', 'utterly', 'completely', 'totally', 'very', 'extremely', 'fairly'],
    relatedTopicIds: ['adjective-order']
  },
  {
    id: 'gerunds-vs-infinitives',
    title: 'Gerunds vs. Infinitives: Verb Complementation',
    category: 'parts-of-speech',
    cefr: 'B1',
    summary: 'Choosing between the -ing verbal noun and the to-infinitive complement, including dual-meaning switch verbs like remember, stop, forget, and regret.',
    formulas: [
      { label: 'Verb + Gerund (-ing)', structure: 'enjoy / avoid / consider / suggest / mind + Verb-ing', example: 'The regulatory agency suggested reviewing the safety protocols.' },
      { label: 'Verb + To-Infinitive', structure: 'decide / hope / refuse / offer / promise + to + Base Verb', example: 'The board decided to postpone the shareholder vote.' },
      { label: 'Preposition + Gerund', structure: 'Preposition + Verb-ing', example: 'She is committed to advancing computational linguistics.' }
    ],
    keyRules: [
      'Verbs of retrospection/mental history with Gerund vs prospective intention with Infinitive:',
      '• "Remember to do" = do not forget a future duty vs "Remember doing" = recall a past memory.',
      '• "Stop to do" = pause in order to undertake another task vs "Stop doing" = cease/terminate an ongoing habit.',
      '• "Regret to tell" = apologize for sharing bad news right now vs "Regret saying" = repent a past utterance.',
      'Any verb immediately following a preposition (in, on, at, about, without, before, after) MUST take the gerund (-ing) form.'
    ],
    examples: [
      { sentence: 'On the way to the archive, the historian stopped to inspect a medieval milestone.', explanation: 'Interrupted her travel in order to inspect.', highlightWords: ['stopped to inspect'] },
      { sentence: 'The physician advised the patient to stop smoking immediately.', explanation: 'Terminate the addictive habit permanently.', highlightWords: ['stop smoking'] },
      { sentence: 'We look forward to collaborating with your laboratory.', explanation: '"To" here is a preposition, not part of an infinitive; requires gerund "collaborating".', highlightWords: ['look forward to collaborating'] }
    ],
    commonMistakes: [
      { incorrect: 'I look forward to hear from you soon.', corrected: 'I look forward to hearing from you soon.', explanation: 'In "look forward to", "to" is a preposition requiring the gerund form.' },
      { incorrect: 'She suggested to consult an orthopedic specialist.', corrected: 'She suggested consulting an orthopedic specialist.', explanation: '"Suggest" cannot take a to-infinitive complement; it requires a gerund or a that-clause.' }
    ],
    signalsAndKeywords: ['enjoy', 'avoid', 'suggest', 'stop doing vs stop to do', 'remember doing', 'look forward to -ing'],
    relatedTopicIds: ['dependent-prepositions', 'subjunctive-mood']
  },
  {
    id: 'dependent-prepositions',
    title: 'Dependent Prepositions & Collocations',
    category: 'prepositions-idiomatic',
    cefr: 'B2',
    summary: 'Navigating arbitrary lexical attachments between verbs, adjectives, and prepositions that resist literal translation.',
    formulas: [
      { label: 'Verb + Dependent Preposition', structure: 'insist on / apologize for / prevent from / rely on / succeed in', example: 'The supervisor insisted on inspecting the cleanroom personally.' },
      { label: 'Adjective + Dependent Preposition', structure: 'capable of / prone to / keen on / indifferent to / aware of', example: 'The automated guidance system is capable of navigating without GPS.' }
    ],
    keyRules: [
      'Dependent prepositions are lexicalized; there is rarely an absolute logical rule, requiring disciplined memorization of pairings.',
      'Watch out for false friends from other languages (e.g., "discuss" does not take "about"; "enter" does not take "into" when entering a room).',
      'The preposition determines the grammatical form of the following verb, which must always be a gerund (-ing).'
    ],
    examples: [
      { sentence: 'The experimental design succeeded in isolating the subatomic isotope.', explanation: '"Succeed" mandates preposition "in" + gerund.', highlightWords: ['succeeded in isolating'] },
      { sentence: 'The director was entirely indifferent to the negative press reviews.', explanation: '"Indifferent" obligatorily couples with "to".', highlightWords: ['indifferent to'] }
    ],
    commonMistakes: [
      { incorrect: 'The delegates discussed about the draft treaty for five hours.', corrected: 'The delegates discussed the draft treaty for five hours.', explanation: '"Discuss" is a transitive verb that takes a direct object without preposition "about".' },
      { incorrect: 'She is very good in mathematics.', corrected: 'She is very good at mathematics.', explanation: 'Proficiency in a subject or skill takes "good at", not "good in".' }
    ],
    signalsAndKeywords: ['good at', 'interested in', 'depend on', 'prevent from', 'capable of', 'insist on'],
    relatedTopicIds: ['gerunds-vs-infinitives', 'prepositions-time-place']
  },
  {
    id: 'prepositions-time-place',
    title: 'Prepositions of Time & Place: At, On, In',
    category: 'prepositions-idiomatic',
    cefr: 'A1',
    summary: 'Applying the funnel hierarchy from narrow precise points (at), to linear surfaces and dates (on), to enclosed volumes and broad eras (in).',
    formulas: [
      { label: 'AT: Pinpoint / Precision', structure: 'At + clock time, holiday period, specific address, exact point', example: 'The lecture begins at 10:15; meet me at 42 Baker Street.' },
      { label: 'ON: Surfaces & Specific Days', structure: 'On + day of week, calendar date, street/avenue, flat surface', example: 'The symposium reconvenes on October 14th on the third floor.' },
      { label: 'IN: Enclosed Spaces & Broad Eras', structure: 'In + month, year, century, season, enclosed room, city, country', example: 'The observatory was established in 1888 in Edinburgh.' }
    ],
    keyRules: [
      'Time funnel: IN (broadest: centuries, decades, years, months) → ON (middle: specific days, dates) → AT (narrowest: clock times, exact hours).',
      'Place funnel: IN (enclosed space, neighborhood, city, nation) → ON (surfaces, streets, public transport vehicles) → AT (specific addresses, functional public nodes like the station/airport).',
      'Idiomatic exceptions: "at night", "in the morning/afternoon/evening", "on the weekend" (US) vs "at the weekend" (UK).'
    ],
    examples: [
      { sentence: 'The treaty was signed at 14:00 on a rainy Tuesday in November 1918.', explanation: 'Exemplifies the full AT → ON → IN precision continuum.', highlightWords: ['at 14:00', 'on a rainy Tuesday', 'in November 1918'] },
      { sentence: 'We sat on the tram, reading a manuscript that was published in Rome.', explanation: '"On" for public mass transit vehicle; "in" for sovereign city.', highlightWords: ['on the tram', 'in Rome'] }
    ],
    commonMistakes: [
      { incorrect: 'We will meet in Monday at 9 o’clock.', corrected: 'We will meet on Monday at 9 o’clock.', explanation: 'Days of the week require preposition "on".' },
      { incorrect: 'She was born on 1994.', corrected: 'She was born in 1994.', explanation: 'Stand-alone calendar years take preposition "in".' }
    ],
    signalsAndKeywords: ['at 5 PM', 'on Friday', 'in July', 'in 2024', 'at the airport', 'on the wall'],
    relatedTopicIds: ['dependent-prepositions']
  },
  {
    id: 'subject-verb-agreement',
    title: 'Subject-Verb Agreement: Tricky Cases',
    category: 'syntax-mechanics',
    cefr: 'B1',
    summary: 'Resolving grammatical concord through complex interposed phrases, collective nouns, correlative conjunctions, and indefinite pronouns.',
    formulas: [
      { label: 'Correlative Proximity (Neither / Either)', structure: 'Neither A nor B + Verb matching nearest subject B', example: 'Neither the lead researcher nor his laboratory technicians were aware of the contamination.' },
      { label: 'Interposed Prepositional Phrases', structure: 'Subject (+ along with / as well as / including ...) + Verb matching head subject', example: 'The principal investigator, along with three postdocs, is conducting the synthesis.' },
      { label: 'Indefinite Pronouns Singular Rule', structure: 'Each / Everyone / Somebody / Neither + Singular Verb', example: 'Each of the participants was assigned a unique cryptographic identifier.' }
    ],
    keyRules: [
      'Words intervening between the head subject noun and the verb (prepositional phrases, parenthetical clauses) NEVER alter the number of the subject.',
      'In "Either... or" and "Neither... nor", the verb agrees with the subject closest to it (the rule of proximity).',
      'Collective nouns (jury, committee, team, government): in American English, treated predominantly as singular ("The team is ready"); in British English, treated as plural when members act individually ("The team are debating amongst themselves").',
      'Quantifiers with "of": fractions, percentages, "none of", and "a lot of" agree with the noun following "of": "Two-thirds of the cake was eaten" vs "Two-thirds of the voters were absent."'
    ],
    examples: [
      { sentence: 'The collection of rare illuminated manuscripts is housed in the subterranean vault.', explanation: 'Head noun is singular "collection", despite plural "manuscripts".', highlightWords: ['collection of rare illuminated manuscripts is'] },
      { sentence: 'Neither the governor nor the municipal councilors have endorsed the tax legislation.', explanation: 'Proximity rule: plural "councilors" sits closest to verb "have endorsed".', highlightWords: ['councilors have endorsed'] }
    ],
    commonMistakes: [
      { incorrect: 'A bouquet of yellow roses were delivered to the office.', corrected: 'A bouquet of yellow roses was delivered to the office.', explanation: 'The head subject is singular "bouquet", not the prepositional object "roses".' },
      { incorrect: 'Everyone in the seminar have submitted their research proposals.', corrected: 'Everyone in the seminar has submitted their research proposal.', explanation: '"Everyone" is grammatically singular and requires singular verb "has".' }
    ],
    signalsAndKeywords: ['neither... nor', 'either... or', 'as well as', 'each of', 'none of', 'proximity rule'],
    relatedTopicIds: ['countable-uncountable-nouns', 'parallelism-balance']
  },
  {
    id: 'punctuation-mechanics',
    title: 'Punctuation Mechanics: Semicolons, Colons & Em-Dashes',
    category: 'syntax-mechanics',
    cefr: 'B2',
    summary: 'Harnessing punctuation marks to orchestrate syntactic cadence, coordinate independent clauses, introduce formal enumerations, and frame parenthetical insertions.',
    formulas: [
      { label: 'Semicolon between Independent Clauses', structure: 'Clause 1; Clause 2 (or Clause 1; however, Clause 2)', example: 'The initial trial yielded inconclusive telemetry; the second attempt proved decisively successful.' },
      { label: 'Colon for Amplification / List', structure: 'Complete Independent Clause : Explanation or Enumeration', example: 'The expedition encountered three insurmountable obstacles: blizzards, scurvy, and broken compasses.' },
      { label: 'Em-Dash for Sudden Digression / Emphasis', structure: 'Clause — emphatic parenthetical aside — predicate', example: 'The ancient codex — long assumed lost to fire — was rediscovered in an uncataloged monastery chest.' }
    ],
    keyRules: [
      'A semicolon connects two independent clauses that are closely related conceptually when no coordinating conjunction (and, but, so) is used.',
      'A colon MUST be preceded by a complete independent clause. Never place a colon directly after a verb ("The ingredients are: flour...") or preposition.',
      'Comma splice error: Joining two independent clauses with only a comma without a conjunction ("The test failed, we tried again") is a serious punctuation error.',
      'The Oxford comma is the serial comma placed immediately before the coordinating conjunction in a list of three or more items ("apples, oranges, and pears").'
    ],
    examples: [
      { sentence: 'We analyzed the spectral emissions; however, no anomalous radiation was detected.', explanation: 'Conjunctive adverb "however" preceded by semicolon and followed by comma.', highlightWords: ['; however,'] },
      { sentence: 'He had one overwhelming ambition: to decipher Linear A before his retirement.', explanation: 'Complete clause precedes colon; followed by grammatical amplification.', highlightWords: ['ambition: to decipher'] }
    ],
    commonMistakes: [
      { incorrect: 'The experiments concluded at midnight, we recorded the results this morning.', corrected: 'The experiments concluded at midnight; we recorded the results this morning. (or , and we recorded)', explanation: 'Comma splice: two independent clauses cannot be glued by a bare comma.' },
      { incorrect: 'The primary criteria are: rigor, transparency, and reproducibility.', corrected: 'The primary criteria are rigor, transparency, and reproducibility.', explanation: 'Do not insert a colon directly following a linking verb.' }
    ],
    signalsAndKeywords: ['semicolon', 'colon', 'em-dash', 'comma splice', 'Oxford comma', 'conjunctive adverb'],
    relatedTopicIds: ['parallelism-balance', 'relative-clauses']
  },
  {
    id: 'parallelism-balance',
    title: 'Parallelism & Syntactic Balance',
    category: 'syntax-mechanics',
    cefr: 'B2',
    summary: 'Maintaining symmetrical grammatical form across items in a series, paired correlatives, and comparative constructions for rhetorical clarity.',
    formulas: [
      { label: 'Series Parallelism', structure: 'Verb-ing, Verb-ing, and Verb-ing / Infinitive, Infinitive, and Infinitive', example: 'The curriculum prioritizes critical thinking, analyzing empirical data, and formulating logical arguments.' },
      { label: 'Correlative Parallelism', structure: 'Not only [Structure X] but also [Structure X]', example: 'The treaty not only lowered bilateral tariffs but also established intellectual property protections.' }
    ],
    keyRules: [
      'Elements linked by coordinating conjunctions (and, but, or) must share the same grammatical form (e.g. all gerunds, all nouns, or all infinitive phrases).',
      'Correlative conjunctions (not only... but also; either... or; neither... nor; both... and) must introduce identical syntactic units.',
      'Comparisons using "than" or "as" must compare parallel categories: "The climate of Italy is warmer than that of Norway" (not "warmer than Norway").'
    ],
    examples: [
      { sentence: 'The director praised the cast for their dedication, their boundless energy, and their punctuality.', explanation: 'Three balanced parallel noun phrases preceded by possessive pronouns.', highlightWords: ['their dedication', 'their boundless energy', 'their punctuality'] },
      { sentence: 'The architect was interested both in preserving historical masonry and in implementing modern insulation.', explanation: 'Symmetrical prepositional phrases following "both" and "and".', highlightWords: ['both in preserving', 'and in implementing'] }
    ],
    commonMistakes: [
      { incorrect: 'She likes hiking, to swim, and bicycling.', corrected: 'She likes hiking, swimming, and bicycling. (or to hike, to swim, and to bicycle)', explanation: 'Mixed verb forms breach grammatical parallelism.' },
      { incorrect: 'The economy of Greece suffered more severely than Germany.', corrected: 'The economy of Greece suffered more severely than that of Germany.', explanation: 'Faulty comparison: comparing an economy to an entire country.' }
    ],
    signalsAndKeywords: ['not only... but also', 'both... and', 'either... or', 'parallel structure', 'faulty comparison'],
    relatedTopicIds: ['subject-verb-agreement', 'punctuation-mechanics']
  },
  {
    id: 'dangling-misplaced-modifiers',
    title: 'Dangling & Misplaced Modifiers',
    category: 'syntax-mechanics',
    cefr: 'C1',
    summary: 'Eliminating semantic confusion and unintended comic absurdity caused by modifiers that fail to latch cleanly to their intended head nouns.',
    formulas: [
      { label: 'Correct Participle Attribution', structure: '[Introductory Participle Phrase modifying Subject], Subject + Verb', example: 'Having verified the cryptographic hash, the technician authorized the database migration.' }
    ],
    keyRules: [
      'A dangling modifier occurs when an introductory descriptive phrase has no grammatical head word in the sentence to logically attach to.',
      'Rule of placement: An introductory modifier automatically modifies the grammatical SUBJECT immediately following the comma.',
      'A misplaced modifier is placed too far away from the word it modifies, creating misleading ambiguity (e.g., "She served dinner on paper plates to the children that were decorated with flowers").',
      'Beware limiting adverbs like "only", "nearly", and "just": place them immediately before the specific word they qualify.'
    ],
    examples: [
      { sentence: 'Walking through the ancient forum at sunset, we noticed the marble colonnades glowing amber.', explanation: 'The human subject "we" is the one doing the walking.', highlightWords: ['Walking through the ancient forum at sunset, we'] }
    ],
    commonMistakes: [
      { incorrect: 'Covered in mustard and sauerkraut, the patron eagerly devoured the bratwurst.', corrected: 'The patron eagerly devoured the bratwurst, which was covered in mustard and sauerkraut.', explanation: 'As written, the human patron was covered in mustard and sauerkraut.' },
      { incorrect: 'At the tender age of eight, my family relocated to Geneva.', corrected: 'When I was eight years old, my family relocated to Geneva.', explanation: 'The family was not eight years old.' }
    ],
    signalsAndKeywords: ['dangling participle', 'misplaced modifier', 'limiting adverbs', 'squinting modifier'],
    relatedTopicIds: ['reduced-participle-clauses']
  },
  {
    id: 'transitive-intransitive-verbs',
    title: 'Transitive, Intransitive & Ergative Verbs (Lie vs. Lay)',
    category: 'parts-of-speech',
    cefr: 'B1',
    summary: 'Distinguishing verbs requiring direct objects from self-contained verbs, specifically mastering the treacherous pairs lie/lay, rise/raise, and sit/set.',
    formulas: [
      { label: 'Intransitive Verb (No Direct Object)', structure: 'Subject + Verb (+ Adverbial)', example: 'The tired hiker lay on the grass. (Lie - Lay - Lain - Lying)' },
      { label: 'Transitive Verb (Requires Direct Object)', structure: 'Subject + Verb + Direct Object', example: 'The nurse laid the sterile bandage on the tray. (Lay - Laid - Laid - Laying)' }
    ],
    keyRules: [
      'LIE (to recline/rest): Intransitive. Base: lie, Past: lay, Past Participle: lain, -ing: lying. Never takes an object.',
      'LAY (to place/put down something): Transitive. Base: lay, Past: laid, Past Participle: laid, -ing: laying. ALWAYS requires a direct object.',
      'RISE (to ascend on its own): Intransitive (rise, rose, risen). RAISE (to lift something up): Transitive (raise, raised, raised).',
      'Ergative verbs: verbs that can be both transitive and intransitive with the same basic meaning (e.g. "The door opened" vs "She opened the door").'
    ],
    examples: [
      { sentence: 'The patient lay unconscious in the ward for eighteen hours.', explanation: 'Intransitive verb "lie" in the past tense is "lay".', highlightWords: ['lay'] },
      { sentence: 'The bricklayer laid seventy bricks in less than forty minutes.', explanation: 'Transitive verb "lay" in the past tense is "laid", with direct object "seventy bricks".', highlightWords: ['laid'] }
    ],
    commonMistakes: [
      { incorrect: 'I am going to lay down on the sofa for a brief nap.', corrected: 'I am going to lie down on the sofa for a brief nap.', explanation: 'Reclining oneself is intransitive "lie", not transitive "lay".' },
      { incorrect: 'The sun raises in the east.', corrected: 'The sun rises in the east.', explanation: 'Ascending without an external agent is intransitive "rises".' }
    ],
    signalsAndKeywords: ['lie vs lay', 'rise vs raise', 'sit vs set', 'direct object', 'transitive', 'intransitive'],
    relatedTopicIds: ['passive-voice-and-causatives']
  }
];
