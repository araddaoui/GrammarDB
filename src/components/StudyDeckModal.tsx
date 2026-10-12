import React, { useState } from 'react';
import { X, Bookmark, Trash2, Copy, Check, Download, ExternalLink, ArrowRight } from 'lucide-react';
import { GrammarTopic, IrregularVerb } from '../types/grammar';
import { GRAMMAR_TOPICS } from '../data/grammarDatabase';
import { IRREGULAR_VERBS } from '../data/irregularVerbs';

interface StudyDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedTopicIds: string[];
  savedVerbsList: string[];
  onRemoveTopic: (id: string) => void;
  onRemoveVerb: (v1: string) => void;
  onSelectTopic: (topic: GrammarTopic) => void;
}

export const StudyDeckModal: React.FC<StudyDeckModalProps> = ({
  isOpen,
  onClose,
  savedTopicIds,
  savedVerbsList,
  onRemoveTopic,
  onRemoveVerb,
  onSelectTopic,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const savedTopics = GRAMMAR_TOPICS.filter((t) => savedTopicIds.includes(t.id));
  const savedVerbs = IRREGULAR_VERBS.filter((v) => savedVerbsList.includes(v.v1));

  const totalSaved = savedTopics.length + savedVerbs.length;

  const exportAsMarkdown = () => {
    let md = `# English Grammar Study Deck\nGenerated on ${new Date().toLocaleDateString()}\n\n`;

    if (savedTopics.length > 0) {
      md += `## Saved Grammar Rules (${savedTopics.length})\n\n`;
      savedTopics.forEach((t) => {
        md += `### ${t.title} [${t.cefr}]\n`;
        md += `*${t.summary}*\n\n`;
        md += `**Formulas:**\n`;
        t.formulas.forEach((f) => {
          md += `- **${f.label}**: \`${f.structure}\` (e.g. *${f.example}*)\n`;
        });
        md += `\n**Key Rules:**\n`;
        t.keyRules.forEach((r) => {
          md += `- ${r}\n`;
        });
        md += `\n---\n\n`;
      });
    }

    if (savedVerbs.length > 0) {
      md += `## Saved Irregular Verbs (${savedVerbs.length})\n\n`;
      md += `| Base (V1) | Past Simple (V2) | Past Participle (V3) | Pattern | Definition |\n`;
      md += `|---|---|---|---|---|\n`;
      savedVerbs.forEach((v) => {
        md += `| **${v.v1}** | ${v.v2} | ${v.v3} | ${v.patternGroup} | ${v.definition} |\n`;
      });
      md += `\n`;
    }

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div
        className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Personal Study Deck
              </h2>
              <p className="text-xs text-slate-500">
                {totalSaved} items bookmarked for review
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {totalSaved > 0 && (
              <button
                onClick={exportAsMarkdown}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
                title="Copy Deck as Markdown"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied Markdown</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Export Markdown</span>
                  </>
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {totalSaved === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-3">
              <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-medium">Your study deck is currently empty.</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Click "Save to Deck" on any grammar module or irregular verb to curate your revision list.
              </p>
            </div>
          ) : (
            <>
              {/* Saved Topics */}
              {savedTopics.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Saved Grammar Topics ({savedTopics.length})
                  </div>
                  <div className="space-y-2">
                    {savedTopics.map((topic) => (
                      <div
                        key={topic.id}
                        className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                      >
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => {
                            onClose();
                            onSelectTopic(topic);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                              {topic.cefr}
                            </span>
                            <span className="font-bold text-sm text-slate-900 hover:text-indigo-600">
                              {topic.title}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            {topic.summary}
                          </div>
                        </div>

                        <button
                          onClick={() => onRemoveTopic(topic.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove from deck"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Saved Irregular Verbs */}
              {savedVerbs.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Saved Irregular Verbs ({savedVerbs.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {savedVerbs.map((v) => (
                      <div
                        key={v.v1}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-serif-scholarly font-bold text-sm text-slate-900">
                            {v.v1} → {v.v2} → {v.v3}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {v.patternGroup} Pattern · {v.ipa}
                          </div>
                        </div>
                        <button
                          onClick={() => onRemoveVerb(v.v1)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove verb"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Synced locally with browser storage</span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
