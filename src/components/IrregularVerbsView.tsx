import React, { useState, useMemo } from 'react';
import { Search, Volume2, Sparkles, Bookmark, BookmarkCheck, Brain, ArrowRight, Check, X, RotateCcw } from 'lucide-react';
import { IRREGULAR_VERBS } from '../data/irregularVerbs';
import { IrregularVerb, CEFRLevel } from '../types/grammar';

interface IrregularVerbsViewProps {
  savedVerbs: string[];
  onToggleSaveVerb: (v1: string) => void;
}

export const IrregularVerbsView: React.FC<IrregularVerbsViewProps> = ({
  savedVerbs,
  onToggleSaveVerb,
}) => {
  const [search, setSearch] = useState('');
  const [selectedPattern, setSelectedPattern] = useState<'ALL' | 'AAA' | 'ABA' | 'ABB' | 'ABC'>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | 'ALL'>('ALL');
  const [drillMode, setDrillMode] = useState(false);
  const [drillIndex, setDrillIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [userGuessV2, setUserGuessV2] = useState('');
  const [userGuessV3, setUserGuessV3] = useState('');
  const [drillFeedback, setDrillFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const filteredVerbs = useMemo(() => {
    return IRREGULAR_VERBS.filter((verb) => {
      const matchSearch =
        verb.v1.toLowerCase().includes(search.toLowerCase()) ||
        verb.v2.toLowerCase().includes(search.toLowerCase()) ||
        verb.v3.toLowerCase().includes(search.toLowerCase()) ||
        verb.definition.toLowerCase().includes(search.toLowerCase());

      const matchPattern = selectedPattern === 'ALL' || verb.patternGroup === selectedPattern;
      const matchLevel = selectedLevel === 'ALL' || verb.cefr === selectedLevel;

      return matchSearch && matchPattern && matchLevel;
    });
  }, [search, selectedPattern, selectedLevel]);

  const speakVerb = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-GB';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const currentDrillVerb = filteredVerbs[drillIndex] || filteredVerbs[0];

  const handleCheckDrill = () => {
    if (!currentDrillVerb) return;
    const v2Correct = userGuessV2.trim().toLowerCase() === currentDrillVerb.v2.toLowerCase();
    const v3Correct = userGuessV3.trim().toLowerCase() === currentDrillVerb.v3.toLowerCase();
    if (v2Correct && v3Correct) {
      setDrillFeedback('correct');
    } else {
      setDrillFeedback('incorrect');
    }
    setRevealed(true);
  };

  const handleNextDrill = () => {
    setUserGuessV2('');
    setUserGuessV3('');
    setRevealed(false);
    setDrillFeedback(null);
    setDrillIndex((prev) => (prev + 1) % filteredVerbs.length);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Morphological Dictionary & Conjugation
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            English Irregular Verbs Database
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Categorized by transformation patterns (AAA, ABA, ABB, ABC) with IPA phonetics, collocations, and pronunciation.
          </p>
        </div>

        <button
          onClick={() => {
            setDrillMode(!drillMode);
            setRevealed(false);
            setUserGuessV2('');
            setUserGuessV3('');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl border transition-colors shrink-0 ${
            drillMode
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>{drillMode ? 'Exit Drill Mode' : 'Start Recall Drill'}</span>
        </button>
      </div>

      {/* Drill Mode Arena */}
      {drillMode && currentDrillVerb && (
        <div className="p-6 bg-indigo-900 text-white rounded-2xl shadow-md space-y-6">
          <div className="flex items-center justify-between text-xs text-indigo-200">
            <span>
              Recall Flashcard Drill ({drillIndex + 1} of {filteredVerbs.length})
            </span>
            <span className="font-mono">{currentDrillVerb.patternGroup} Pattern</span>
          </div>

          <div className="text-center space-y-2 py-4">
            <div className="text-xs uppercase tracking-widest text-indigo-300 font-semibold">
              Base Infinitive Form (V1):
            </div>
            <div className="text-4xl font-extrabold tracking-tight font-serif-scholarly">
              {currentDrillVerb.v1}
            </div>
            <div className="text-sm text-indigo-200 italic max-w-md mx-auto">
              "{currentDrillVerb.definition}"
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-indigo-200">Past Simple (V2):</label>
              <input
                type="text"
                value={userGuessV2}
                disabled={revealed}
                onChange={(e) => setUserGuessV2(e.target.value)}
                placeholder="Type V2..."
                className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-indigo-200">Past Participle (V3):</label>
              <input
                type="text"
                value={userGuessV3}
                disabled={revealed}
                onChange={(e) => setUserGuessV3(e.target.value)}
                placeholder="Type V3..."
                className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono"
              />
            </div>
          </div>

          {revealed && (
            <div
              className={`p-4 rounded-xl max-w-lg mx-auto text-sm flex items-center justify-between ${
                drillFeedback === 'correct' ? 'bg-emerald-800/80 text-emerald-100' : 'bg-rose-800/80 text-rose-100'
              }`}
            >
              <div>
                <span className="font-bold">Correct Conjugations: </span>
                <span className="font-mono">
                  {currentDrillVerb.v1} → {currentDrillVerb.v2} → {currentDrillVerb.v3}
                </span>
              </div>
              {drillFeedback === 'correct' ? (
                <Check className="w-5 h-5 text-emerald-300" />
              ) : (
                <X className="w-5 h-5 text-rose-300" />
              )}
            </div>
          )}

          <div className="flex justify-center gap-3 pt-2">
            {!revealed ? (
              <button
                onClick={handleCheckDrill}
                className="px-6 py-2.5 text-xs font-bold text-indigo-900 bg-white hover:bg-indigo-50 rounded-xl transition-colors"
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={handleNextDrill}
                className="px-6 py-2.5 text-xs font-bold text-indigo-900 bg-white hover:bg-indigo-50 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <span>Next Verb</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by verb form or definition (e.g., broke, lain, cut, write)..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Pattern Group Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 overflow-x-auto">
            {(
              [
                ['ALL', 'All Patterns'],
                ['AAA', 'AAA (cut-cut-cut)'],
                ['ABA', 'ABA (run-ran-run)'],
                ['ABB', 'ABB (buy-bought-bought)'],
                ['ABC', 'ABC (see-saw-seen)'],
              ] as const
            ).map(([pat, label]) => (
              <button
                key={pat}
                onClick={() => setSelectedPattern(pat as any)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  selectedPattern === pat
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-xs text-slate-500 font-medium">
        Showing {filteredVerbs.length} irregular verbs matching criteria
      </div>

      {/* Verbs Table */}
      <div className="border border-slate-200 rounded-2xl bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Base (V1)</th>
                <th className="py-3.5 px-4">Past Simple (V2)</th>
                <th className="py-3.5 px-4">Past Participle (V3)</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Pattern</th>
                <th className="py-3.5 px-4 hidden lg:table-cell">Definition & Collocations</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredVerbs.map((verb) => {
                const isSaved = savedVerbs.includes(verb.v1);
                return (
                  <tr key={verb.v1} className="hover:bg-slate-50/70 transition-colors">
                    {/* V1 Base */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 font-serif-scholarly text-base">
                          {verb.v1}
                        </span>
                        <span className="font-mono text-xs text-slate-400">
                          {verb.ipa}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        3rd: {verb.thirdPerson} · ing: {verb.ingForm}
                      </div>
                    </td>

                    {/* V2 Past */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-indigo-700">
                      {verb.v2}
                    </td>

                    {/* V3 Participle */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-purple-700">
                      {verb.v3}
                    </td>

                    {/* Pattern */}
                    <td className="py-3.5 px-4 hidden md:table-cell">
                      <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {verb.patternGroup}
                      </span>
                    </td>

                    {/* Definition & Collocations */}
                    <td className="py-3.5 px-4 hidden lg:table-cell max-w-xs">
                      <div className="text-xs text-slate-800 line-clamp-1">
                        {verb.definition}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {verb.collocations.slice(0, 2).map((col, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.2"
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => speakVerb(`${verb.v1}, ${verb.v2}, ${verb.v3}`)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Pronounce V1, V2, V3"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onToggleSaveVerb(verb.v1)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Save to Study Deck"
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-4 h-4 text-amber-600" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
