import React, { useState } from 'react';
import { X, Bookmark, BookmarkCheck, Check, Copy, AlertTriangle, ArrowRight, Lightbulb, BookOpen } from 'lucide-react';
import { GrammarTopic } from '../types/grammar';

interface TopicDetailModalProps {
  topic: GrammarTopic | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (topicId: string) => void;
  onSelectRelatedTopic?: (relatedId: string) => void;
}

export const TopicDetailModal: React.FC<TopicDetailModalProps> = ({
  topic,
  onClose,
  isBookmarked,
  onToggleBookmark,
  onSelectRelatedTopic,
}) => {
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  if (!topic) return null;

  const handleCopy = (formulaText: string) => {
    navigator.clipboard.writeText(formulaText);
    setCopiedFormula(formulaText);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div
        className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span className="text-indigo-600 font-mono">{topic.cefr}</span>
              <span>·</span>
              <span>{topic.category.replace(/-/g, ' ')}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {topic.title}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
              {topic.summary}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onToggleBookmark(topic.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                isBookmarked
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-amber-600" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 text-slate-400" />
                  <span>Save to Deck</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-8 text-slate-800">
          {/* Section 1: Grammatical Formulas */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Structural Formulas & Construction</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {topic.formulas.map((f, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>{f.label}</span>
                    <button
                      onClick={() => handleCopy(`${f.label}: ${f.structure}`)}
                      className="text-slate-400 hover:text-indigo-600 p-1"
                      title="Copy formula"
                    >
                      {copiedFormula === `${f.label}: ${f.structure}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <div className="font-mono text-xs text-indigo-900 bg-indigo-50/70 p-2 rounded-lg border border-indigo-100 break-words">
                    {f.structure}
                  </div>
                  <div className="text-xs text-slate-600 italic">
                    Example: "{f.example}"
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Core Prescriptive & Descriptive Rules */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>Key Governing Rules</span>
            </div>
            <div className="bg-amber-50/40 border border-amber-200/80 rounded-xl p-4 space-y-2.5">
              {topic.keyRules.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-800">
                  <span className="font-mono text-xs font-bold text-amber-700 mt-0.5">
                    {idx + 1}.
                  </span>
                  <p className="leading-relaxed">{rule}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Verified Examples in Context */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Annotated Usage Examples
            </div>
            <div className="space-y-2.5">
              {topic.examples.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm space-y-1"
                >
                  <div className="font-serif-scholarly text-base text-slate-900 font-medium">
                    "{ex.sentence}"
                  </div>
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-indigo-700">Explanation: </span>
                    {ex.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Common Pitfalls & Corrections */}
          {topic.commonMistakes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600">
                <AlertTriangle className="w-4 h-4" />
                <span>Frequent Mistakes & Corrections</span>
              </div>
              <div className="space-y-3">
                {topic.commonMistakes.map((mistake, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-rose-50/40 border border-rose-200 rounded-xl space-y-2 text-sm"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="flex items-start gap-2 text-rose-900 bg-white/70 p-2.5 rounded-lg border border-rose-200">
                        <span className="text-xs font-bold text-rose-600 shrink-0 uppercase tracking-wide">
                          Incorrect:
                        </span>
                        <span className="line-through text-slate-700 font-mono text-xs">
                          {mistake.incorrect}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-emerald-900 bg-white/70 p-2.5 rounded-lg border border-emerald-200">
                        <span className="text-xs font-bold text-emerald-600 shrink-0 uppercase tracking-wide">
                          Correct:
                        </span>
                        <span className="font-semibold text-slate-900 font-mono text-xs">
                          {mistake.corrected}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-700 pt-1">
                      <span className="font-semibold text-slate-900">Why: </span>
                      {mistake.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Signal Keywords */}
          {topic.signalsAndKeywords.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Diagnostic Signals & Adverbial Triggers:
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {topic.signalsAndKeywords.map((signal, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-xs font-mono text-slate-700 bg-slate-100 border border-slate-200 rounded-md"
                  >
                    {signal}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="font-mono">Reference Module ID: {topic.id}</div>
          <button
            onClick={onClose}
            className="px-4 py-2 font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Done Reading
          </button>
        </div>
      </div>
    </div>
  );
};
