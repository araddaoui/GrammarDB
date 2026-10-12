import React, { useState, useEffect, useMemo } from 'react';
import { Header, AppTab } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { TopicDetailModal } from './components/TopicDetailModal';
import { TenseMatrixView } from './components/TenseMatrixView';
import { SyntaxAnalyzerView } from './components/SyntaxAnalyzerView';
import { IrregularVerbsView } from './components/IrregularVerbsView';
import { CommonConfusionsView } from './components/CommonConfusionsView';
import { QuizArenaView } from './components/QuizArenaView';
import { StudyDeckModal } from './components/StudyDeckModal';
import { IdiomOptimaWorkbench } from './components/IdiomOptimaWorkbench';
import { GRAMMAR_TOPICS } from './data/grammarDatabase';
import { GrammarTopic, CEFRLevel, GrammarCategory } from './types/grammar';
import { BookOpen, Bookmark, BookmarkCheck, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('idiomoptima');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<GrammarCategory | 'ALL'>('ALL');
  const [activeTopic, setActiveTopic] = useState<GrammarTopic | null>(null);
  const [isStudyDeckOpen, setIsStudyDeckOpen] = useState(false);

  // LocalStorage persistence for bookmarks
  const [savedTopicIds, setSavedTopicIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('grammar_saved_topics');
      return stored ? JSON.parse(stored) : ['conditionals-zero-first', 'negative-inversion'];
    } catch {
      return ['conditionals-zero-first', 'negative-inversion'];
    }
  });

  const [savedVerbsList, setSavedVerbsList] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('grammar_saved_verbs');
      return stored ? JSON.parse(stored) : ['lie', 'arise', 'bear'];
    } catch {
      return ['lie', 'arise', 'bear'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('grammar_saved_topics', JSON.stringify(savedTopicIds));
    } catch (e) {
      console.error(e);
    }
  }, [savedTopicIds]);

  useEffect(() => {
    try {
      localStorage.setItem('grammar_saved_verbs', JSON.stringify(savedVerbsList));
    } catch (e) {
      console.error(e);
    }
  }, [savedVerbsList]);

  const handleToggleBookmarkTopic = (topicId: string) => {
    setSavedTopicIds((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  const handleToggleSaveVerb = (v1: string) => {
    setSavedVerbsList((prev) =>
      prev.includes(v1) ? prev.filter((item) => item !== v1) : [...prev, v1]
    );
  };

  // Filtered topics computation
  const filteredTopics = useMemo(() => {
    return GRAMMAR_TOPICS.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.signalsAndKeywords.some((sig) => sig.toLowerCase().includes(q)) ||
        t.keyRules.some((r) => r.toLowerCase().includes(q)) ||
        t.formulas.some((f) => f.structure.toLowerCase().includes(q) || f.label.toLowerCase().includes(q));

      const matchLevel = selectedLevel === 'ALL' || t.cefr === selectedLevel;
      const matchCat = selectedCategory === 'ALL' || t.category === selectedCategory;

      return matchSearch && matchLevel && matchCat;
    });
  }, [searchQuery, selectedLevel, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-100 selection:text-indigo-950 font-sans">
      {/* Top Bar Contract (3 zones separated by gap-8) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedTopicIds.length + savedVerbsList.length}
        onOpenSavedDeck={() => setIsStudyDeckOpen(true)}
      />

      {/* Main Tab Content */}
      <main className="flex-1">
        {activeTab === 'idiomoptima' && <IdiomOptimaWorkbench />}

        {activeTab === 'topics' && (
          <div>
            {/* Hero Banner with scholarly illustration and universal search */}
            <HeroBanner
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedLevel={selectedLevel}
              setSelectedLevel={setSelectedLevel}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              totalTopicsCount={GRAMMAR_TOPICS.length}
            />

            {/* Grammar Topics Grid View */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Showing {filteredTopics.length} of {GRAMMAR_TOPICS.length} Grammar Topics
                </div>
                {(selectedLevel !== 'ALL' || selectedCategory !== 'ALL' || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedLevel('ALL');
                      setSelectedCategory('ALL');
                      setSearchQuery('');
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>

              {filteredTopics.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTopics.map((topic) => {
                    const isBookmarked = savedTopicIds.includes(topic.id);
                    return (
                      <div
                        key={topic.id}
                        onClick={() => setActiveTopic(topic)}
                        className="group bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer space-y-4"
                      >
                        <div className="space-y-3">
                          {/* Unboxed metadata with typographic separator */}
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <div className="flex items-center gap-2 font-medium">
                              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                {topic.cefr}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="capitalize">
                                {topic.category.replace(/-/g, ' ')}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleBookmarkTopic(topic.id);
                              }}
                              className="p-1 text-slate-400 hover:text-amber-600 rounded"
                              title={isBookmarked ? 'Remove bookmark' : 'Bookmark rule'}
                            >
                              {isBookmarked ? (
                                <BookmarkCheck className="w-4 h-4 text-amber-600" />
                              ) : (
                                <Bookmark className="w-4 h-4" />
                              )}
                            </button>
                          </div>

                          {/* Title */}
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                            {topic.title}
                          </h3>

                          {/* Summary */}
                          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                            {topic.summary}
                          </p>

                          {/* Primary Formula Preview */}
                          {topic.formulas[0] && (
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 font-mono text-xs text-slate-800 break-words line-clamp-2">
                              <span className="text-[10px] text-slate-400 block font-sans uppercase font-semibold">
                                {topic.formulas[0].label}
                              </span>
                              {topic.formulas[0].structure}
                            </div>
                          )}
                        </div>

                        {/* Card Footer */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-mono text-[11px]">
                            {topic.examples.length} examples · {topic.commonMistakes.length} pitfalls
                          </span>
                          <span className="font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                            <span>Explore</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-base font-semibold text-slate-800">
                    No grammar topics match your filter or search query.
                  </p>
                  <p className="text-xs text-slate-400">
                    Try searching for another keyword or clear the CEFR filter.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tense-matrix' && <TenseMatrixView />}

        {activeTab === 'syntax-analyzer' && <SyntaxAnalyzerView />}

        {activeTab === 'irregular-verbs' && (
          <IrregularVerbsView
            savedVerbs={savedVerbsList}
            onToggleSaveVerb={handleToggleSaveVerb}
          />
        )}

        {activeTab === 'confusions' && <CommonConfusionsView />}

        {activeTab === 'quiz' && <QuizArenaView />}
      </main>

      {/* Detail Modal for Selected Topic */}
      <TopicDetailModal
        topic={activeTopic}
        onClose={() => setActiveTopic(null)}
        isBookmarked={activeTopic ? savedTopicIds.includes(activeTopic.id) : false}
        onToggleBookmark={handleToggleBookmarkTopic}
      />

      {/* Study Deck Modal */}
      <StudyDeckModal
        isOpen={isStudyDeckOpen}
        onClose={() => setIsStudyDeckOpen(false)}
        savedTopicIds={savedTopicIds}
        savedVerbsList={savedVerbsList}
        onRemoveTopic={handleToggleBookmarkTopic}
        onRemoveVerb={handleToggleSaveVerb}
        onSelectTopic={(t) => setActiveTopic(t)}
      />

      {/* Quiet Scholarly Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12 py-8 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-800">IdiomOptima Linguistic Machinery & Grammar Database</span>
            <span className="mx-2">·</span>
            <span>Deterministic Rule Subsystem v0.1.0</span>
          </div>
          <div className="flex items-center gap-6 text-slate-600">
            <button
              onClick={() => setActiveTab('idiomoptima')}
              className="hover:text-slate-900 transition-colors"
            >
              Engine Pipeline
            </button>
            <button
              onClick={() => setActiveTab('topics')}
              className="hover:text-slate-900 transition-colors"
            >
              Grammar Encyclopedia
            </button>
            <button
              onClick={() => setActiveTab('tense-matrix')}
              className="hover:text-slate-900 transition-colors"
            >
              12 Tenses
            </button>
            <button
              onClick={() => setActiveTab('syntax-analyzer')}
              className="hover:text-slate-900 transition-colors"
            >
              Syntax Engine
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
