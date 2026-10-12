import React, { useState, useMemo } from 'react';
import { Award, CheckCircle, XCircle, RotateCcw, ArrowRight, Lightbulb, Check, X, Flame } from 'lucide-react';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import { QuizQuestion, CEFRLevel, GrammarCategory } from '../types/grammar';

export const QuizArenaView: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<GrammarCategory | 'ALL'>('ALL');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [userHistory, setUserHistory] = useState<{ questionId: string; wasCorrect: boolean }[]>([]);

  const questions = useMemo(() => {
    return QUIZ_QUESTIONS.filter((q) => {
      const matchLevel = selectedLevel === 'ALL' || q.cefr === selectedLevel;
      const matchCategory = selectedCategory === 'ALL' || q.category === selectedCategory;
      return matchLevel && matchCategory;
    });
  }, [selectedLevel, selectedCategory]);

  const currentQ: QuizQuestion | undefined = questions[currentIndex];

  const handleSelect = (opt: string) => {
    if (isSubmitted) return;
    setSelectedOption(opt);
  };

  const handleSubmit = () => {
    if (!currentQ || !selectedOption || isSubmitted) return;
    const isCorrect = selectedOption === currentQ.correctAnswer;
    setIsSubmitted(true);
    setAnsweredCount((prev) => prev + 1);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
    } else {
      setStreak(0);
    }

    setUserHistory((prev) => [...prev, { questionId: currentQ.id, wasCorrect: isCorrect }]);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Loop or finish
      setCurrentIndex(0);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setAnsweredCount(0);
    setStreak(0);
    setUserHistory([]);
  };

  const accuracy = answeredCount > 0 ? Math.round((score / answeredCount) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Interactive CEFR Assessment
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Grammar Practice Arena
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Test and consolidate your syntactic intuition with immediate pedagogical feedback.
          </p>
        </div>

        {/* Live Score & Streak Pills */}
        <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-xl border border-slate-200 shrink-0">
          <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-slate-700">
            <Award className="w-4 h-4 text-indigo-600" />
            <span className="font-mono tabular-nums">{score} / {answeredCount}</span>
            <span className="text-slate-400">({accuracy}%)</span>
          </div>
          <div className="h-4 w-px bg-slate-300" />
          <div className="flex items-center gap-1 px-2 text-xs font-semibold text-amber-700">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-mono tabular-nums">{streak} streak</span>
          </div>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* CEFR Level filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto">
          {(['ALL', 'A1', 'A2', 'B1', 'B2', 'C1'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                setSelectedLevel(lvl);
                handleReset();
              }}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedLevel === lvl
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lvl === 'ALL' ? 'All Levels' : lvl}
            </button>
          ))}
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Session</span>
        </button>
      </div>

      {/* Active Question Arena */}
      {currentQ ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-6 p-6 sm:p-8 animate-in fade-in duration-150">
          {/* Question Metadata */}
          <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                Level {currentQ.cefr}
              </span>
              <span>·</span>
              <span className="font-medium text-slate-700">{currentQ.topicTitle}</span>
            </div>
            <span className="font-mono text-slate-400">
              Item {currentIndex + 1} of {questions.length}
            </span>
          </div>

          {/* Question Prompt */}
          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-serif-scholarly leading-snug">
              {currentQ.prompt}
            </h3>
          </div>

          {/* Options List */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isCorrectTarget = opt === currentQ.correctAnswer;
              let itemClasses = 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800';

              if (isSelected && !isSubmitted) {
                itemClasses = 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-600 ring-inset';
              }

              if (isSubmitted) {
                if (isCorrectTarget) {
                  itemClasses = 'border-emerald-600 bg-emerald-50 text-emerald-950 font-medium ring-2 ring-emerald-600 ring-inset';
                } else if (isSelected && !isCorrectTarget) {
                  itemClasses = 'border-rose-600 bg-rose-50 text-rose-950 line-through ring-2 ring-rose-600 ring-inset';
                } else {
                  itemClasses = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isSubmitted}
                  onClick={() => handleSelect(opt)}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${itemClasses}`}
                >
                  <span className="font-mono text-xs font-bold shrink-0 mt-0.5 text-slate-400">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <span className="text-sm font-sans flex-1 leading-relaxed">
                    {opt}
                  </span>
                  {isSubmitted && isCorrectTarget && (
                    <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {isSubmitted && isSelected && !isCorrectTarget && (
                    <X className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Action / Next Button */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {!isSubmitted ? (
              <button
                disabled={!selectedOption}
                onClick={handleSubmit}
                className="ml-auto px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:pointer-events-none rounded-xl transition-colors shadow-sm"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="ml-auto px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
              >
                <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'Restart Loop'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Explanation Callout (Shown upon submission) */}
          {isSubmitted && (
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>Pedagogical Analysis & Grammatical Rule</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {currentQ.explanation}
              </p>
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 font-medium">
                <span className="font-bold">Rule Tip: </span>
                {currentQ.ruleTip}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
          No questions match the current filter selection. Try selecting "All Levels".
        </div>
      )}
    </div>
  );
};
