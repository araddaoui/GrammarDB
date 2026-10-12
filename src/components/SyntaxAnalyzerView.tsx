import React, { useState } from 'react';
import { Network, Play, Sparkles, BookOpen, Layers, Info, Check, RefreshCw } from 'lucide-react';
import { PRECURATED_ANALYSES, analyzeSentenceText, PrecuratedSentence } from '../utils/syntaxParser';
import { SyntaxAnalysisResult, SyntaxToken } from '../types/grammar';

export const SyntaxAnalyzerView: React.FC = () => {
  const [selectedCurated, setSelectedCurated] = useState<string>(PRECURATED_ANALYSES[0].id);
  const [customInput, setCustomInput] = useState<string>(PRECURATED_ANALYSES[0].sentence);
  const [currentAnalysis, setCurrentAnalysis] = useState<SyntaxAnalysisResult>(PRECURATED_ANALYSES[0].result);
  const [activeToken, setActiveToken] = useState<SyntaxToken | null>(PRECURATED_ANALYSES[0].result.tokens[0]);

  const handleSelectCurated = (curated: PrecuratedSentence) => {
    setSelectedCurated(curated.id);
    setCustomInput(curated.sentence);
    setCurrentAnalysis(curated.result);
    setActiveToken(curated.result.tokens[0] || null);
  };

  const handleAnalyze = () => {
    if (!customInput.trim()) return;
    const res = analyzeSentenceText(customInput);
    setCurrentAnalysis(res);
    setActiveToken(res.tokens[0] || null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Linguistic Structural Parser
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Interactive Sentence Syntax Analyzer
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Deconstruct English sentences into morphological constituents, syntactic roles, clause hierarchies, and active/passive voice.
          </p>
        </div>
      </div>

      {/* Preset Structure Buttons */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Curated Complex Syntactic Phenomena:
        </span>
        <div className="flex flex-wrap gap-2">
          {PRECURATED_ANALYSES.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectCurated(item)}
              className={`px-3 py-2 text-xs font-medium rounded-xl border transition-colors text-left flex items-center gap-2 ${
                selectedCurated === item.id && customInput === item.sentence
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="font-semibold">{item.label}</span>
              <span className="text-[11px] opacity-75 hidden sm:inline">({item.category})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sentence Input Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Analyze Sentence (Type or Choose Above):
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            placeholder="Type any English sentence to analyze..."
            className="flex-1 px-4 py-3 text-sm sm:text-base font-serif-scholarly bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 transition-all"
          />
          <button
            onClick={handleAnalyze}
            className="px-5 py-3 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center justify-center gap-2 shrink-0 shadow-sm"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Parse Syntax</span>
          </button>
        </div>
      </div>

      {/* Analysis Presentation Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 Cols: Visual Token Breakdown & Clause Tree */}
        <div className="lg:col-span-8 space-y-6">
          {/* Metadata Badges Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200 font-semibold">
                {currentAnalysis.structureType}
              </span>
              <span className="font-mono px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                {currentAnalysis.voice}
              </span>
              <span className="font-mono px-2.5 py-1 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
                {currentAnalysis.primaryTense}
              </span>
              <span className="font-mono px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                {currentAnalysis.mood}
              </span>
            </div>

            {/* Interactive Word Constituents */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Interactive Token Stream (Click any constituent to inspect):
              </div>
              <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200 min-h-[90px] items-center">
                {currentAnalysis.tokens.map((token, idx) => {
                  const isSelected = activeToken?.word === token.word;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveToken(token)}
                      className={`flex flex-col items-center px-3 py-2 rounded-lg border text-left transition-all group ${
                        isSelected
                          ? 'ring-2 ring-indigo-600 bg-white shadow-sm'
                          : token.colorClass
                      }`}
                    >
                      <span className="font-serif-scholarly font-medium text-base text-slate-900 group-hover:text-indigo-600">
                        {token.word}
                      </span>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">
                        {token.pos}
                      </span>
                      <span className="text-[9px] text-slate-400 truncate max-w-[80px]">
                        {token.role}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pedagogical Linguistic Explanation */}
            <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl text-xs sm:text-sm text-slate-700 leading-relaxed">
              <span className="font-bold text-indigo-900 block mb-1">
                Linguistic Note:
              </span>
              {currentAnalysis.pedagogicalNote}
            </div>
          </div>

          {/* Clause Hierarchy Deck */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Clause Hierarchy & Constituent Boundaries</span>
            </div>

            <div className="space-y-3">
              {currentAnalysis.clauses.map((clause, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100">
                      {clause.type}
                    </span>
                    <span className="text-slate-500">{clause.role}</span>
                  </div>
                  <div className="font-serif-scholarly text-base text-slate-900 font-medium">
                    "{clause.clauseText}"
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    {clause.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Active Token Deep Inspector */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Selected Word Specifier
              </span>
              <Info className="w-4 h-4 text-slate-400" />
            </div>

            {activeToken ? (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                  <div className="text-2xl font-bold font-serif-scholarly text-slate-900">
                    "{activeToken.word}"
                  </div>
                  <div className="font-mono text-xs text-indigo-700 font-semibold">
                    {activeToken.posFull}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 uppercase tracking-wide block font-semibold text-[10px]">
                      Syntactic Role:
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                      {activeToken.role}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-400 uppercase tracking-wide block font-semibold text-[10px]">
                      Morphological Explanation:
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed mt-1">
                      {activeToken.explanation}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                Click any constituent word tag in the stream to inspect its morphological function.
              </div>
            )}
          </div>

          {/* Color Key Guide */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-2">
            <span className="font-bold text-slate-700 uppercase tracking-wide text-[10px] block">
              POS Color Palette:
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <span className="text-blue-700">● Blue: Nouns</span>
              <span className="text-indigo-700">● Indigo: Lexical Verbs</span>
              <span className="text-purple-700">● Purple: Auxiliaries & Modals</span>
              <span className="text-amber-700">● Amber: Adjectives</span>
              <span className="text-rose-700">● Rose: Adverbs</span>
              <span className="text-teal-700">● Teal: Prepositions/Conj</span>
              <span className="text-emerald-700">● Green: Determiners</span>
              <span className="text-cyan-700">● Cyan: Pronouns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
