import React from 'react';
import { Bookmark, Cpu } from 'lucide-react';

export type AppTab =
  | 'idiomoptima'
  | 'topics'
  | 'tense-matrix'
  | 'syntax-analyzer'
  | 'irregular-verbs'
  | 'confusions'
  | 'quiz';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  savedCount: number;
  onOpenSavedDeck: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  onOpenSavedDeck,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => setActiveTab('idiomoptima')}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-indigo-600 transition-colors text-left flex items-center gap-2"
        >
          <span>English Grammar Database</span>
        </button>

        {/* Zone 2: Concise Nav Links (Single-line text links) */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('idiomoptima')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'idiomoptima'
                ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                : 'hover:text-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4 text-indigo-600" />
            <span>IdiomOptima Engine</span>
          </button>
          <button
            onClick={() => setActiveTab('topics')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'topics'
                ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                : 'hover:text-slate-900'
            }`}
          >
            Grammar Reference
          </button>
          <button
            onClick={() => setActiveTab('tense-matrix')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'tense-matrix'
                ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                : 'hover:text-slate-900'
            }`}
          >
            Tense Matrix
          </button>
          <button
            onClick={() => setActiveTab('syntax-analyzer')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'syntax-analyzer'
                ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                : 'hover:text-slate-900'
            }`}
          >
            Syntax Tree
          </button>
          <button
            onClick={() => setActiveTab('irregular-verbs')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'irregular-verbs'
                ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                : 'hover:text-slate-900'
            }`}
          >
            Irregular Verbs
          </button>
          <button
            onClick={() => setActiveTab('confusions')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'confusions'
                ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                : 'hover:text-slate-900'
            }`}
          >
            Pitfalls
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'quiz'
                ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                : 'hover:text-slate-900'
            }`}
          >
            Practice Quiz
          </button>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenSavedDeck}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
            title="View Bookmarked Rules & Verbs"
          >
            <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
            <span>Study Deck</span>
            {savedCount > 0 && (
              <span className="font-mono text-[11px] bg-indigo-600 text-white rounded px-1.5 py-0.2">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav strip */}
      <div className="md:hidden border-t border-slate-200 bg-slate-50 px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {(
          [
            ['idiomoptima', 'IdiomOptima'],
            ['topics', 'Topics'],
            ['tense-matrix', '12 Tenses'],
            ['syntax-analyzer', 'Syntax Tree'],
            ['irregular-verbs', 'Verbs'],
            ['confusions', 'Pitfalls'],
            ['quiz', 'Quiz'],
          ] as const
        ).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as AppTab)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === tab
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </header>
  );
};
