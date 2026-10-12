import React from 'react';
import { Search, BookOpen, Layers, BookCheck, Sparkles, Filter, X } from 'lucide-react';
import { CEFRLevel, GrammarCategory } from '../types/grammar';

interface HeroBannerProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedLevel: CEFRLevel | 'ALL';
  setSelectedLevel: (level: CEFRLevel | 'ALL') => void;
  selectedCategory: GrammarCategory | 'ALL';
  setSelectedCategory: (category: GrammarCategory | 'ALL') => void;
  totalTopicsCount: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  setSearchQuery,
  selectedLevel,
  setSelectedLevel,
  selectedCategory,
  setSelectedCategory,
  totalTopicsCount,
}) => {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Headline & Search */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="text-xs font-semibold tracking-wider uppercase text-indigo-600">
                Authoritative Linguistic Reference & Syntax Workbench
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight text-balance">
                Precision English Grammar Database
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Explore comprehensive grammatical formulas, active syntactic tree parsing, 12-tense mechanics, irregular verb transformations, and CEFR-graded practice items.
              </p>
            </div>

            {/* Live Search Bar */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rules, formulas, tenses, keywords (e.g. inversion, past perfect, conditionals)..."
                className="w-full pl-11 pr-10 py-3 text-sm sm:text-base bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 p-0.5 rounded"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Filter Controls */}
            <div className="space-y-3 pt-1">
              {/* CEFR Level Segmented Control */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mr-1">
                  CEFR Level:
                </span>
                {(['ALL', 'A1', 'A2', 'B1', 'B2', 'C1'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLevel(lvl)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                      selectedLevel === lvl
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {lvl === 'ALL' ? 'All Levels' : lvl}
                  </button>
                ))}
              </div>

              {/* Category Segmented Control */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mr-1">
                  Category:
                </span>
                {(
                  [
                    ['ALL', 'All Modules'],
                    ['tenses-aspects', 'Tenses & Aspects'],
                    ['clauses-sentence-structure', 'Clauses & Structure'],
                    ['modals-auxiliaries', 'Modals'],
                    ['parts-of-speech', 'Parts of Speech'],
                    ['syntax-mechanics', 'Syntax & Punctuation'],
                    ['prepositions-idiomatic', 'Prepositions'],
                  ] as const
                ).map(([catId, catLabel]) => (
                  <button
                    key={catId}
                    onClick={() => setSelectedCategory(catId as any)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      selectedCategory === catId
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {catLabel}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Curated Scholarly Illustration Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm aspect-16/10">
              <img
                src="/src/assets/images/english_grammar_reference_banner_1791647948814.jpg"
                alt="English Grammar & Syntax Encyclopedia"
                className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                onError={(e) => {
                  // Resilient fallback container if image fails to render
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-4 right-4 text-white text-xs space-y-1">
                <div className="font-semibold text-sm tracking-wide">
                  Oxford & Cambridge Structural Framework
                </div>
                <div className="text-slate-300 text-[11px]">
                  Prescriptive and descriptive linguistic rules from foundational A1 to advanced C1/C2 syntax.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column Quick Stat Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
          <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {totalTopicsCount}
            </div>
            <div className="text-xs text-slate-500 font-medium">Curated Grammar Modules</div>
          </div>
          <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">12</div>
            <div className="text-xs text-slate-500 font-medium">Tenses with Active Matrices</div>
          </div>
          <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">48+</div>
            <div className="text-xs text-slate-500 font-medium">Classified Irregular Verbs</div>
          </div>
          <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-2xl font-bold font-mono text-indigo-600 tabular-nums">100%</div>
            <div className="text-xs text-slate-500 font-medium">CEFR Graded Practice & Tree Parser</div>
          </div>
        </div>
      </div>
    </div>
  );
};
