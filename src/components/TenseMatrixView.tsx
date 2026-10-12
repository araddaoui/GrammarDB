import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, Info, ArrowUpRight, Copy, Check } from 'lucide-react';

interface TenseCellData {
  id: string;
  name: string;
  time: 'Present' | 'Past' | 'Future';
  aspect: 'Simple' | 'Continuous' | 'Perfect' | 'Perfect Continuous';
  formulaAffirmative: string;
  formulaNegative: string;
  formulaQuestion: string;
  exampleBase: string;
  signalWords: string[];
  usageDescription: string;
  contrastingTip: string;
  conjugatedVerbs: Record<string, string>; // e.g. "write": "She writes", "they write"
}

const SAMPLE_VERBS = [
  { label: 'Write (Irregular)', key: 'write' },
  { label: 'Investigate (Regular)', key: 'investigate' },
  { label: 'Speak (Irregular)', key: 'speak' },
  { label: 'Develop (Regular)', key: 'develop' },
];

const TENSE_DATA: TenseCellData[] = [
  // --- PRESENT ROW ---
  {
    id: 'present-simple',
    name: 'Present Simple',
    time: 'Present',
    aspect: 'Simple',
    formulaAffirmative: 'Subject + Base Verb (+ -s/-es for he/she/it)',
    formulaNegative: 'Subject + do/does not + Base Verb',
    formulaQuestion: 'Do/Does + Subject + Base Verb?',
    exampleBase: 'The analyst reviews econometric forecasts every Monday.',
    signalWords: ['always', 'usually', 'every week', 'often', 'seldom', 'generally'],
    usageDescription: 'Used for permanent facts, habitual routines, universal scientific truths, and scheduled timetables.',
    contrastingTip: 'Contrasted with Present Continuous: Present Simple is permanent/habitual, while Continuous is temporary or occurring at the moment of speaking.',
    conjugatedVerbs: {
      write: 'She writes research papers.',
      investigate: 'The team investigates fraud.',
      speak: 'He speaks three languages.',
      develop: 'They develop software.',
    },
  },
  {
    id: 'present-continuous',
    name: 'Present Continuous',
    time: 'Present',
    aspect: 'Continuous',
    formulaAffirmative: 'Subject + am/is/are + Verb-ing',
    formulaNegative: 'Subject + am/is/are not + Verb-ing',
    formulaQuestion: 'Am/Is/Are + Subject + Verb-ing?',
    exampleBase: 'The engineers are testing the cryptographic algorithm right now.',
    signalWords: ['now', 'at the moment', 'currently', 'these days', 'this week'],
    usageDescription: 'Used for actions actively happening right now, temporary extended arrangements, or evolving trends.',
    contrastingTip: 'Beware stative verbs (know, believe, belong, seem, need) which generally reject the continuous aspect.',
    conjugatedVerbs: {
      write: 'She is writing an editorial now.',
      investigate: 'The team is investigating the breach.',
      speak: 'He is speaking to the council.',
      develop: 'They are developing new models.',
    },
  },
  {
    id: 'present-perfect-simple',
    name: 'Present Perfect Simple',
    time: 'Present',
    aspect: 'Perfect',
    formulaAffirmative: 'Subject + have/has + Past Participle (V3)',
    formulaNegative: 'Subject + have/has not + Past Participle (V3)',
    formulaQuestion: 'Have/Has + Subject + Past Participle (V3)?',
    exampleBase: 'The university has published forty monographs this calendar year.',
    signalWords: ['already', 'yet', 'just', 'ever', 'never', 'so far', 'since 2020', 'for 5 years'],
    usageDescription: 'Bridges past action to present reality: life experiences without specific dates, unfinished time frames, and past events with direct present relevance.',
    contrastingTip: 'Never use specific finished past time indicators (yesterday, in 2018) with Present Perfect. Use Past Simple instead.',
    conjugatedVerbs: {
      write: 'She has written three dissertations.',
      investigate: 'The team has investigated the anomaly.',
      speak: 'He has spoken at major symposiums.',
      develop: 'They have developed five prototypes.',
    },
  },
  {
    id: 'present-perfect-continuous',
    name: 'Present Perfect Continuous',
    time: 'Present',
    aspect: 'Perfect Continuous',
    formulaAffirmative: 'Subject + have/has been + Verb-ing',
    formulaNegative: 'Subject + have/has not been + Verb-ing',
    formulaQuestion: 'Have/Has + Subject + been + Verb-ing?',
    exampleBase: 'Meteorologists have been monitoring the cyclone’s trajectory all morning.',
    signalWords: ['all day', 'all week', 'how long', 'for 6 hours', 'since sunrise', 'lately'],
    usageDescription: 'Focuses on the continuous duration, process, or visible physical aftermath of an activity spanning from past to present.',
    contrastingTip: 'Ask "How long" (Continuous) vs "How many" (Simple). Stative verbs always use Present Perfect Simple instead.',
    conjugatedVerbs: {
      write: 'She has been writing for six hours.',
      investigate: 'The team has been investigating since dawn.',
      speak: 'He has been speaking without notes.',
      develop: 'They have been developing the API all week.',
    },
  },

  // --- PAST ROW ---
  {
    id: 'past-simple',
    name: 'Past Simple',
    time: 'Past',
    aspect: 'Simple',
    formulaAffirmative: 'Subject + Verb-ed (or Irregular V2)',
    formulaNegative: 'Subject + did not + Base Verb',
    formulaQuestion: 'Did + Subject + Base Verb?',
    exampleBase: 'The expedition excavated the tomb during the spring of 1922.',
    signalWords: ['yesterday', 'ago', 'in 1999', 'last week', 'when I was young', 'then'],
    usageDescription: 'Narrates completed actions that occurred at an explicit or implicit finished time in the past.',
    contrastingTip: 'In narrative discourse, consecutive past simple verbs indicate chronological sequential progression (A happened, then B happened).',
    conjugatedVerbs: {
      write: 'She wrote the manuscript in 2012.',
      investigate: 'The team investigated the site yesterday.',
      speak: 'He spoke to the ambassador.',
      develop: 'They developed the original blueprint.',
    },
  },
  {
    id: 'past-continuous',
    name: 'Past Continuous',
    time: 'Past',
    aspect: 'Continuous',
    formulaAffirmative: 'Subject + was/were + Verb-ing',
    formulaNegative: 'Subject + was/were not + Verb-ing',
    formulaQuestion: 'Was/Were + Subject + Verb-ing?',
    exampleBase: 'The technicians were calibrating the sensors when the power failed.',
    signalWords: ['while', 'as', 'at that moment', 'at 8 PM yesterday', 'all evening'],
    usageDescription: 'Describes an action in progress in the past that was interrupted by another event (Past Simple) or set against background narrative scenes.',
    contrastingTip: 'While + Past Continuous (longer background process), When + Past Simple (shorter interrupting event).',
    conjugatedVerbs: {
      write: 'She was writing when the telephone rang.',
      investigate: 'The team was investigating while we waited.',
      speak: 'He was speaking as they entered.',
      develop: 'They were developing the engine that year.',
    },
  },
  {
    id: 'past-perfect-simple',
    name: 'Past Perfect Simple',
    time: 'Past',
    aspect: 'Perfect',
    formulaAffirmative: 'Subject + had + Past Participle (V3)',
    formulaNegative: 'Subject + had not + Past Participle (V3)',
    formulaQuestion: 'Had + Subject + Past Participle (V3)?',
    exampleBase: 'By the time the fire marshal arrived, the tenants had already evacuated.',
    signalWords: ['by the time', 'already', 'before', 'scarcely... when', 'had never before'],
    usageDescription: 'Establishes chronological depth: an action that occurred prior to another specified past reference point.',
    contrastingTip: 'Past of the past: ensures the listener understands which event happened first without needing explicit connective adverbs.',
    conjugatedVerbs: {
      write: 'She had written the letter before noon.',
      investigate: 'The team had investigated the claim earlier.',
      speak: 'He had spoken prior to the vote.',
      develop: 'They had developed the cure in secret.',
    },
  },
  {
    id: 'past-perfect-continuous',
    name: 'Past Perfect Continuous',
    time: 'Past',
    aspect: 'Perfect Continuous',
    formulaAffirmative: 'Subject + had been + Verb-ing',
    formulaNegative: 'Subject + had not been + Verb-ing',
    formulaQuestion: 'Had + Subject + been + Verb-ing?',
    exampleBase: 'The scholar had been translating the hieroglyphs for two decades before discovering the key.',
    signalWords: ['for years before', 'all day prior', 'had been doing when'],
    usageDescription: 'Highlights the extended duration or cumulative fatigue of an ongoing activity up to a specific past milestone.',
    contrastingTip: 'Contrasted with Past Continuous: Past Perfect Continuous emphasizes the duration leading up to that past point.',
    conjugatedVerbs: {
      write: 'She had been writing all night when dawn broke.',
      investigate: 'The team had been investigating for months.',
      speak: 'He had been speaking for an hour before pausing.',
      develop: 'They had been developing the system for years.',
    },
  },

  // --- FUTURE ROW ---
  {
    id: 'future-simple',
    name: 'Future Simple (Will)',
    time: 'Future',
    aspect: 'Simple',
    formulaAffirmative: 'Subject + will + Base Verb',
    formulaNegative: 'Subject + will not (won’t) + Base Verb',
    formulaQuestion: 'Will + Subject + Base Verb?',
    exampleBase: 'The observatory will deploy the deep-space spectrometer next autumn.',
    signalWords: ['tomorrow', 'next year', 'soon', 'probably', 'I think', 'one day'],
    usageDescription: 'Used for spontaneous decisions made at speech time, future predictions based on opinion, promises, and unconditional future facts.',
    contrastingTip: 'Contrasted with "be going to": "will" is for spontaneous decisions or beliefs; "going to" is for prior intentions or visible present evidence.',
    conjugatedVerbs: {
      write: 'She will write the concluding chapter.',
      investigate: 'The team will investigate further.',
      speak: 'He will speak at the plenary.',
      develop: 'They will develop the framework.',
    },
  },
  {
    id: 'future-continuous',
    name: 'Future Continuous',
    time: 'Future',
    aspect: 'Continuous',
    formulaAffirmative: 'Subject + will be + Verb-ing',
    formulaNegative: 'Subject + will not be + Verb-ing',
    formulaQuestion: 'Will + Subject + be + Verb-ing?',
    exampleBase: 'At 10:00 AM tomorrow, the delegates will be negotiating the trade quotas.',
    signalWords: ['this time tomorrow', 'at 3 PM next Friday', 'in five years’ time'],
    usageDescription: 'Captures an action that will be actively mid-progress at a specific specified moment in the future.',
    contrastingTip: 'Also used for routine polite inquiries about other people’s plans: "Will you be using the spectrometer tonight?"',
    conjugatedVerbs: {
      write: 'She will be writing all afternoon.',
      investigate: 'The team will be investigating throughout June.',
      speak: 'He will be speaking at that hour.',
      develop: 'They will be developing features then.',
    },
  },
  {
    id: 'future-perfect-simple',
    name: 'Future Perfect Simple',
    time: 'Future',
    aspect: 'Perfect',
    formulaAffirmative: 'Subject + will have + Past Participle (V3)',
    formulaNegative: 'Subject + will not have + Past Participle (V3)',
    formulaQuestion: 'Will + Subject + have + Past Participle (V3)?',
    exampleBase: 'By 2030, the consortium will have sequenced all indigenous plant genomes.',
    signalWords: ['by next month', 'by the time', 'by then', 'in two years’ time'],
    usageDescription: 'Projects forward to a future deadline ("by [time]") and views the preceding action as concluded.',
    contrastingTip: 'The preposition "by" (meaning no later than) is the primary hallmark of the Future Perfect.',
    conjugatedVerbs: {
      write: 'She will have written the treatise by winter.',
      investigate: 'The team will have investigated all leads.',
      speak: 'He will have spoken to every candidate.',
      develop: 'They will have developed the cure by 2028.',
    },
  },
  {
    id: 'future-perfect-continuous',
    name: 'Future Perfect Continuous',
    time: 'Future',
    aspect: 'Perfect Continuous',
    formulaAffirmative: 'Subject + will have been + Verb-ing',
    formulaNegative: 'Subject + will not have been + Verb-ing',
    formulaQuestion: 'Will + Subject + have been + Verb-ing?',
    exampleBase: 'By December, Professor Vance will have been teaching comparative philology for forty years.',
    signalWords: ['by then for 10 years', 'by next July for a decade'],
    usageDescription: 'Measures the continuous duration of an activity looking back from a future milestone.',
    contrastingTip: 'Rare in informal everyday speech; highly valued in formal academic, biographical, and contractual prose.',
    conjugatedVerbs: {
      write: 'She will have been writing for twelve years.',
      investigate: 'The team will have been investigating for a year.',
      speak: 'He will have been speaking for two hours.',
      develop: 'They will have been developing code for five years.',
    },
  },
];

export const TenseMatrixView: React.FC = () => {
  const [selectedVerb, setSelectedVerb] = useState('write');
  const [activeCell, setActiveCell] = useState<TenseCellData | null>(TENSE_DATA[0]);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const times: Array<'Present' | 'Past' | 'Future'> = ['Present', 'Past', 'Future'];
  const aspects: Array<'Simple' | 'Continuous' | 'Perfect' | 'Perfect Continuous'> = [
    'Simple',
    'Continuous',
    'Perfect',
    'Perfect Continuous',
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Systematic Temporal Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            The 12 English Tenses Matrix
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Orthogonal interaction between Time (Past, Present, Future) and Grammatical Aspect (Simple, Continuous, Perfect, Perfect Continuous).
          </p>
        </div>

        {/* Verb Conjugation Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0">
          <span className="text-xs font-semibold text-slate-500 pl-2">Verb:</span>
          {SAMPLE_VERBS.map((v) => (
            <button
              key={v.key}
              onClick={() => setSelectedVerb(v.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedVerb === v.key
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3x4 Interactive Matrix Grid */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[850px] border border-slate-200 rounded-2xl bg-white shadow-xs overflow-hidden">
          {/* Column Header: Aspects */}
          <div className="grid grid-cols-5 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-700 tracking-wide uppercase">
            <div className="p-3.5 border-r border-slate-200 text-slate-500 text-center">
              Aspect →
              <br />
              Time ↓
            </div>
            {aspects.map((asp) => (
              <div key={asp} className="p-3.5 text-center border-r last:border-r-0 border-slate-200">
                {asp}
              </div>
            ))}
          </div>

          {/* Time Rows */}
          {times.map((t) => (
            <div key={t} className="grid grid-cols-5 border-b last:border-b-0 border-slate-200">
              {/* Row Header: Time */}
              <div className="p-4 bg-slate-50/80 border-r border-slate-200 flex flex-col justify-center items-center text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  {t === 'Present' ? 'Current Anchor' : t === 'Past' ? 'Completed Axis' : 'Projected Axis'}
                </span>
              </div>

              {/* Aspect Cells */}
              {aspects.map((asp) => {
                const cell = TENSE_DATA.find((item) => item.time === t && item.aspect === asp);
                if (!cell) return null;
                const isSelected = activeCell?.id === cell.id;

                return (
                  <button
                    key={cell.id}
                    onClick={() => setActiveCell(cell)}
                    className={`p-3.5 text-left border-r last:border-r-0 border-slate-200 transition-all flex flex-col justify-between group hover:bg-indigo-50/40 ${
                      isSelected
                        ? 'bg-indigo-50/90 ring-2 ring-indigo-600 ring-inset'
                        : 'bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {cell.name}
                        </span>
                        <ArrowUpRight className={`w-3.5 h-3.5 transition-colors ${isSelected ? 'text-indigo-600' : 'text-slate-300 group-hover:text-slate-600'}`} />
                      </div>
                      <div className="font-mono text-[11px] text-indigo-700 bg-indigo-50/70 p-1.5 rounded mt-2 border border-indigo-100/80 leading-tight">
                        {cell.formulaAffirmative}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 text-xs italic text-slate-600 truncate">
                      "{cell.conjugatedVerbs[selectedVerb]}"
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Deep Inspection Panel for Selected Cell */}
      {activeCell && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 lg:p-8 space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span className="text-indigo-600 font-bold">{activeCell.time} Time</span>
                <span>·</span>
                <span>{activeCell.aspect} Aspect</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                {activeCell.name} In Detail
              </h3>
            </div>

            <button
              onClick={() => handleCopy(`${activeCell.name}\nAffirmative: ${activeCell.formulaAffirmative}\nNegative: ${activeCell.formulaNegative}\nQuestion: ${activeCell.formulaQuestion}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 shrink-0"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Formulas Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Full Conjugation Set</span>
                </>
              )}
            </button>
          </div>

          {/* Three Structural Formulas: Affirmative, Negative, Question */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                ● Affirmative (+)
              </span>
              <div className="font-mono text-xs text-slate-900 bg-white p-2.5 rounded-lg border border-slate-200">
                {activeCell.formulaAffirmative}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                ▲ Negative (−)
              </span>
              <div className="font-mono text-xs text-slate-900 bg-white p-2.5 rounded-lg border border-slate-200">
                {activeCell.formulaNegative}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                ? Interrogative (?)
              </span>
              <div className="font-mono text-xs text-slate-900 bg-white p-2.5 rounded-lg border border-slate-200">
                {activeCell.formulaQuestion}
              </div>
            </div>
          </div>

          {/* Canonical Example Sentence */}
          <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
              Canonical Sentence In Context:
            </span>
            <div className="font-serif-scholarly text-lg text-slate-900 font-medium">
              "{activeCell.exampleBase}"
            </div>
            <div className="text-xs text-slate-600">
              Active verb conjugate for '{selectedVerb}':{' '}
              <span className="font-mono font-semibold text-indigo-900">
                {activeCell.conjugatedVerbs[selectedVerb]}
              </span>
            </div>
          </div>

          {/* Usage & Contrasting Nuances */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                <Info className="w-4 h-4 text-slate-500" />
                <span>Primary Semantic Function</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {activeCell.usageDescription}
              </p>
            </div>

            <div className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>Contrasting Nuance & Diagnostic Tip</span>
              </div>
              <p className="text-sm text-slate-800 leading-relaxed">
                {activeCell.contrastingTip}
              </p>
            </div>
          </div>

          {/* Signal Words & Markers */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Temporal Anchors & Diagnostic Trigger Words:
            </span>
            <div className="flex flex-wrap gap-2">
              {activeCell.signalWords.map((sig, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 text-xs font-mono text-slate-700 bg-slate-100 border border-slate-200 rounded-md"
                >
                  {sig}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
