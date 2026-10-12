import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, HelpCircle, Lightbulb, Check, X } from 'lucide-react';
import { COMMON_CONFUSIONS } from '../data/commonConfusions';
import { CommonConfusion } from '../types/grammar';

export const CommonConfusionsView: React.FC = () => {
  const [selectedConfusion, setSelectedConfusion] = useState<CommonConfusion>(COMMON_CONFUSIONS[0]);
  const [userSelection, setUserSelection] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleSelectConfusion = (c: CommonConfusion) => {
    setSelectedConfusion(c);
    setUserSelection(null);
    setShowExplanation(false);
  };

  const handleSelectOption = (opt: string) => {
    setUserSelection(opt);
    setShowExplanation(true);
  };

  const isCorrect = userSelection === selectedConfusion.quickCheckQuestion.correctAnswer;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Linguistic Pitfalls & Disambiguation
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Confused Pairs & Triplets
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Resolve treacherous homophones, near-synonyms, and grammatical impostors with crisp mnemonics and diagnostics.
          </p>
        </div>
      </div>

      {/* Main Grid: Pair Selector + Deep Comparison Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: List of Pairs */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
            Select Confused Pair:
          </span>
          <div className="space-y-1.5">
            {COMMON_CONFUSIONS.map((c) => {
              const isSelected = selectedConfusion.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => handleSelectConfusion(c)}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm">{c.title}</div>
                    <div
                      className={`text-xs mt-0.5 line-clamp-1 ${
                        isSelected ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {c.summary}
                    </div>
                  </div>
                  <span
                    className={`font-mono text-xs px-2 py-0.5 rounded ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {c.cefr}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Comparison Card */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 lg:p-8 space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span className="text-indigo-600 font-mono">{selectedConfusion.cefr} Level</span>
                <span>·</span>
                <span>Diagnostic Disambiguation</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                {selectedConfusion.title}
              </h3>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                {selectedConfusion.summary}
              </p>
            </div>

            {/* Side-by-Side Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedConfusion.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
                >
                  <div className="flex items-baseline justify-between border-b border-slate-200/80 pb-2">
                    <span className="font-serif-scholarly text-xl font-bold text-slate-900">
                      {item.term}
                    </span>
                    <span className="font-mono text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {item.partOfSpeech}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    {item.definition}
                  </p>

                  <div className="text-xs text-slate-800 italic bg-white p-2.5 rounded-lg border border-slate-200">
                    "{item.example}"
                  </div>

                  {item.mnemonic && (
                    <div className="flex items-start gap-2 p-2.5 bg-amber-50/80 border border-amber-200 rounded-lg text-xs text-amber-900">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Mnemonic: </span>
                        {item.mnemonic}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pitfall Warning */}
            <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-900 leading-relaxed">
                <span className="font-bold text-rose-950 block mb-0.5">
                  Pitfall Warning:
                </span>
                {selectedConfusion.pitfallTip}
              </div>
            </div>

            {/* Interactive Quick Check Challenge */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <span>Quick Diagnostic Challenge</span>
              </div>

              <div className="font-serif-scholarly text-base text-slate-900 font-medium">
                "{selectedConfusion.quickCheckQuestion.sentence}"
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {selectedConfusion.quickCheckQuestion.options.map((opt) => {
                  const isSelected = userSelection === opt;
                  const isTarget = opt === selectedConfusion.quickCheckQuestion.correctAnswer;
                  let btnStyle = 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100';

                  if (showExplanation) {
                    if (isTarget) {
                      btnStyle = 'bg-emerald-600 text-white border-emerald-600';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-600 text-white border-rose-600';
                    }
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelectOption(opt)}
                      className={`p-2.5 text-xs font-mono font-medium rounded-lg border transition-all ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {showExplanation && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                    isCorrect
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}
                >
                  {isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold">
                      {isCorrect ? 'Correct! ' : 'Incorrect. '}
                    </span>
                    {selectedConfusion.quickCheckQuestion.explanation}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
