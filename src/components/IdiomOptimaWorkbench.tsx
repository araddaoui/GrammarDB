import React, { useState, useMemo, useEffect } from 'react';
import {
  Cpu,
  Play,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Layers,
  ArrowRight,
  RotateCcw,
  Sliders,
  Check,
  X,
  Sparkles,
  HelpCircle,
  Code,
  FileText,
  AlertTriangle,
  Copy,
  Trash2,
  Clipboard,
  Eye,
  GitCompare,
  Beaker,
  CheckCheck,
  RefreshCw,
  Zap,
  Clock,
  Search,
} from 'lucide-react';
import { IdiomOptimaEngine } from '../engine/engine';
import { EngineConfig, EngineMode, EngineResult, TestSuiteResult } from '../engine/types';
import { runEngineTestSuite, TEST_SUITE_CASES } from '../engine/testRunner';
import { SEED_RULES } from '../engine/rules';
import { OFFICIAL_GRAMMAR_EXCEPTIONS } from '../engine/guards';

interface DiffToken {
  type: 'same' | 'added' | 'removed';
  value: string;
}

function computeWordDiff(text1: string, text2: string): DiffToken[] {
  if (text1 === text2) return [{ type: 'same', value: text1 }];

  const tokens1 = text1.split(/(\s+|[.,!?;:()[\]"'])/).filter(Boolean);
  const tokens2 = text2.split(/(\s+|[.,!?;:()[\]"'])/).filter(Boolean);

  const m = tokens1.length;
  const n = tokens2.length;

  if (m * n > 40000) {
    return [
      { type: 'removed', value: text1 },
      { type: 'added', value: text2 },
    ];
  }

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (tokens1[i] === tokens2[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const diff: DiffToken[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && tokens1[i - 1] === tokens2[j - 1]) {
      diff.unshift({ type: 'same', value: tokens1[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.unshift({ type: 'added', value: tokens2[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      diff.unshift({ type: 'removed', value: tokens1[i - 1] });
      i--;
    }
  }
  return diff;
}

export const IdiomOptimaWorkbench: React.FC = () => {
  const [inputText, setInputText] = useState(
    'The summary of all the submitted research articles, which was reviewed by two senior editors, have been rejected due to lack of evidence. Having analyzed the dataset, the results shows that participants who speaks more than one languages suffers from less cognitive decline in old age, which it is a significant finding for public health.'
  );

  const [engineMode, setEngineMode] = useState<EngineMode>('autoApply');
  const [enableL1, setEnableL1] = useState(true);
  const [skipQuotes, setSkipQuotes] = useState(false);
  const [outputViewMode, setOutputViewMode] = useState<'clean' | 'diff'>('diff');
  const [copied, setCopied] = useState(false);

  // Transform execution states
  const [activeInputText, setActiveInputText] = useState(inputText);
  const [isTransforming, setIsTransforming] = useState(false);
  const [lastTransformedAt, setLastTransformedAt] = useState<string>(() => new Date().toLocaleTimeString());
  const [autoTransform, setAutoTransform] = useState(true);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [justPasted, setJustPasted] = useState(false);
  const [transformPulse, setTransformPulse] = useState(false);

  // Accepted and rejected suggestion sets in suggestion mode
  const [subTab, setSubTab] = useState<'workbench' | 'discourse' | 'suite' | 'rules' | 'exceptions'>('workbench');
  const [suiteResult, setSuiteResult] = useState<TestSuiteResult | null>(null);
  const [aiModalPayload, setAiModalPayload] = useState<any | null>(null);
  const [ruleSearch, setRuleSearch] = useState('');
  const [selectedRuleCategory, setSelectedRuleCategory] = useState<string>('ALL');

  const filteredRules = useMemo(() => {
    return SEED_RULES.filter((r) => {
      const matchesCat =
        selectedRuleCategory === 'ALL' || r.category === selectedRuleCategory;
      const matchesSearch =
        !ruleSearch.trim() ||
        r.id.toLowerCase().includes(ruleSearch.toLowerCase()) ||
        r.description.toLowerCase().includes(ruleSearch.toLowerCase()) ||
        r.category.toLowerCase().includes(ruleSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [selectedRuleCategory, ruleSearch]);

  const engine = useMemo(() => new IdiomOptimaEngine(), []);

  const config: EngineConfig = useMemo(
    () => ({
      mode: engineMode,
      enableL1Support: enableL1,
      skipDirectQuotes: skipQuotes,
      maxPasses: 3,
    }),
    [engineMode, enableL1, skipQuotes]
  );

  const [result, setResult] = useState<EngineResult>(() => engine.process(inputText, config));

  useEffect(() => {
    if (autoTransform) {
      const res = engine.process(inputText, config);
      setResult(res);
      setActiveInputText(inputText);
    }
  }, [inputText, config, autoTransform, engine]);

  const wordDiff = useMemo(() => {
    return computeWordDiff(activeInputText, result.outputText);
  }, [activeInputText, result.outputText]);

  const [actionNotification, setActionNotification] = useState<string | null>(null);

  const handleTransform = (overrideText?: string) => {
    const textToProcess = overrideText !== undefined ? overrideText : inputText;
    setIsTransforming(true);
    setTransformPulse(true);
    setInputText(textToProcess);
    setActiveInputText(textToProcess);

    const evalRes = engine.process(textToProcess, config);
    setResult(evalRes);
    setLastTransformedAt(new Date().toLocaleTimeString());
    setHasPendingChanges(false);
    setJustPasted(false);

    const notice = evalRes.hasChanged
      ? `✓ Transform Success: Applied ${evalRes.appliedCandidates.length} grammar rule(s) in ${evalRes.processingTimeMs}ms.`
      : evalRes.stylisticAdvisories && evalRes.stylisticAdvisories.length > 0
      ? `⚡ Evaluated: 0 grammar errors. Flagged ${evalRes.stylisticAdvisories.length} stylistic advisory (dangling participle).`
      : `✓ Evaluated in ${evalRes.processingTimeMs}ms: Text is clean under active rules (0 modifications needed).`;
    setActionNotification(notice);
    setTimeout(() => setActionNotification(null), 5000);

    setTimeout(() => {
      setIsTransforming(false);
    }, 250);
    setTimeout(() => {
      setTransformPulse(false);
    }, 1200);
  };

  const handleApplyStylisticSuggestion = (originalSentence: string, replacementSentence: string) => {
    const updated = inputText.replace(originalSentence, replacementSentence);
    setInputText(updated);
    handleTransform(updated);
    setActionNotification(`Applied stylistic rewrite: "${replacementSentence.slice(0, 45)}..."`);
    setTimeout(() => setActionNotification(null), 4500);
  };

  const handleCopyOutput = () => {
    if (!result?.outputText) return;
    navigator.clipboard.writeText(result.outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePasteInput = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
        setActiveInputText(text);
        setHasPendingChanges(false);
        setJustPasted(false);
        handleTransform(text);
      }
    } catch {
      const manualText = window.prompt('Paste your English sentence or paragraph here to transform:');
      if (manualText) {
        setInputText(manualText);
        setActiveInputText(manualText);
        setHasPendingChanges(false);
        setJustPasted(false);
        handleTransform(manualText);
      } else {
        setActionNotification('Clipboard access restricted in browser preview. Please use Ctrl+V directly in Box 1.');
        setTimeout(() => setActionNotification(null), 4500);
      }
    }
  };

  const handleRunSuite = () => {
    const res = runEngineTestSuite();
    setSuiteResult(res);
  };

  const handleLoadSample = (sample: string) => {
    setInputText(sample);
    handleTransform(sample);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Subsystem Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
            <Cpu className="w-4 h-4" />
            <span>IdiomOptima Linguistic Machinery — v0.1.0</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Deterministic-First English Correction Subsystem
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Executes conservative, testable, meaning-preserving grammar and mechanics rules locally before escalating ambiguous or stylistic decisions to the AI layer.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => setSubTab('workbench')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              subTab === 'workbench'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Beaker className="w-3.5 h-3.5 text-indigo-600" />
            <span>Input & Output Live Test</span>
          </button>
          <button
            onClick={() => setSubTab('discourse')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              subTab === 'discourse'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Clause & Discourse Architecture
          </button>
          <button
            onClick={() => {
              setSubTab('suite');
              if (!suiteResult) handleRunSuite();
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              subTab === 'suite'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Regression Suite & Metrics
          </button>
          <button
            onClick={() => setSubTab('rules')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              subTab === 'rules'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rule Contract Database
          </button>
          <button
            onClick={() => setSubTab('exceptions')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              subTab === 'exceptions'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Exceptions & Guards
          </button>
        </div>
      </div>

      {subTab === 'workbench' && (
        <div className="space-y-6">
          {/* Top Banner: Dual-Box Test Bench Title & Quick Presets */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600/30 border border-indigo-400/30 rounded-xl text-indigo-300">
                  <Beaker className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                    <span>Interactive Dual-Box Test Bench</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                      Live Engine v0.1.0
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Type or paste any English sentence into <strong className="text-indigo-300">Box 1 (Left)</strong> to inspect instant deterministic grammar corrections and word-level diffs in <strong className="text-emerald-300">Box 2 (Right)</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() =>
                    handleLoadSample(
                      'The summary of all the submitted research articles, which was reviewed by two senior editors, have been rejected due to lack of evidence. Having analyzed the dataset, the results shows that participants who speaks more than one languages suffers from less cognitive decline in old age, which it is a significant finding for public health.'
                    )
                  }
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Load Benchmark Passage</span>
                </button>
                <button
                  onClick={() => setInputText('')}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 font-medium text-xs rounded-xl transition-all border border-white/10 flex items-center gap-1 whitespace-nowrap"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Box</span>
                </button>
              </div>
            </div>

            {/* Quick Test Presets Palette */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
                Click a Preset to Test Instantly:
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  onClick={() =>
                    handleLoadSample(
                      'If the government had invested more money in renewable energy last year, pollution levels will drop significantly today.'
                    )
                  }
                  className="px-2.5 py-1 bg-cyan-500/25 hover:bg-cyan-500/35 text-cyan-200 font-semibold rounded-lg border border-cyan-400/50 font-mono text-[11px] flex items-center gap-1 shadow-xs"
                >
                  <span>✨</span>
                  <span>Conditional Harmonization (Mixed: will drop ➔ would drop)</span>
                </button>

                <button
                  onClick={() =>
                    handleLoadSample(
                      'Pollution levels will drop significantly today if the government had invested more money in renewable energy last year.'
                    )
                  }
                  className="px-2.5 py-1 bg-teal-500/25 hover:bg-teal-500/35 text-teal-200 font-semibold rounded-lg border border-teal-400/50 font-mono text-[11px] flex items-center gap-1 shadow-xs"
                >
                  <span>🔄</span>
                  <span>Reverse Order Conditional (will drop ➔ would drop)</span>
                </button>

                <button
                  onClick={() =>
                    handleLoadSample(
                      'The director recommended that the employee is present at the meeting. Not only the team failed to meet the deadline, but they also lacked of equipments needed for completing the project. Despite of discussing this issue for many hours, everyone insisted on to postpone the final decision.'
                    )
                  }
                  className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold rounded-lg border border-rose-400/40 font-mono text-[11px] flex items-center gap-1 shadow-xs"
                >
                  <span>🔥</span>
                  <span>Benchmark 1: Subjunctive 'be' / Negative Inversion / Equipment / Lack / Despite / Insisted on</span>
                </button>

                <button
                  onClick={() =>
                    handleLoadSample(
                      'If the government would invest more money in renewable energy last year, pollution level will drop significantly today. We must to consider that a technology continue to evolve rapid, even though many engineers didn\'t realized how important is environmental protection until recent.'
                    )
                  }
                  className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-semibold rounded-lg border border-emerald-400/40 font-mono text-[11px] flex items-center gap-1 shadow-xs"
                >
                  <span>⚡</span>
                  <span>Benchmark 2: Conditionals / Do-Support / Agreement / Modals / Flat Adverbs (9 Transformations)</span>
                </button>

                <button
                  onClick={() =>
                    handleLoadSample(
                      'The summary of all the submitted research articles, which was reviewed by two senior editors, have been rejected due to lack of evidence. Having analyzed the dataset, the results shows that participants who speaks more than one languages suffers from less cognitive decline in old age, which it is a significant finding for public health.'
                    )
                  }
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold rounded-lg border border-amber-400/40 font-mono text-[11px] flex items-center gap-1"
                >
                  <span>🔬</span>
                  <span>Scientific Benchmark (All 6 Auto-Corrections + 1 Dangling Advisory)</span>
                </button>

                <button
                  onClick={() =>
                    handleLoadSample(
                      "We must to consider the results. They didn't realize how important is environmental protection. Until recent, the mechanisms were unverified."
                    )
                  }
                  className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-semibold rounded-lg border border-emerald-400/40 font-mono text-[11px] flex items-center gap-1"
                >
                  <span>⚡</span>
                  <span>Modals, Inversion & Adverbs (must consider / how important ... is / until recently)</span>
                </button>

                <button
                  onClick={() =>
                    handleLoadSample(
                      'If I would have known the answer, I would have replied. If he was to assist with the research, we would proceed. We wish that it was simpler.'
                    )
                  }
                  className="px-2.5 py-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 font-semibold rounded-lg border border-sky-400/40 font-mono text-[11px] flex items-center gap-1"
                >
                  <span>⚖️</span>
                  <span>Conditionals & Subjunctives (If I had known / If he were / wish it were)</span>
                </button>

                <button
                  onClick={() =>
                    handleLoadSample(
                      'There is many reasons for this. Each of the participants were tested. More than one languages was studied.'
                    )
                  }
                  className="px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 font-semibold rounded-lg border border-indigo-400/40 font-mono text-[11px] flex items-center gap-1"
                >
                  <span>📊</span>
                  <span>Agreement & Quantifiers (There are many / Each ... was / more than one language)</span>
                </button>

                <button
                  onClick={() =>
                    handleLoadSample(
                      'The results depend of the environmental factors. The participants speak fluent in two languages. She completed a evaluation of a study.'
                    )
                  }
                  className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 font-semibold rounded-lg border border-purple-400/40 font-mono text-[11px] flex items-center gap-1"
                >
                  <span>🎯</span>
                  <span>Prepositions, Flat Adverbs & Articles (depend on / fluently / an evaluation)</span>
                </button>

                <button
                  onClick={() =>
                    handleLoadSample(
                      'The archivist realized he had had sufficient warning prior to the storm. Refer to https://treaty.org/v2 and [@un_2026:4].'
                    )
                  }
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg border border-white/10 font-mono text-[11px] flex items-center gap-1"
                >
                  <span>🛡️</span>
                  <span>Negative Control ('had had' Guard & Protected URL/Citation)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dual Text Stage: Box 1 (Input) & Box 2 (Output) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* BOX 1: INPUT PANE */}
            <div className="bg-white rounded-2xl border-2 border-indigo-200/90 shadow-sm p-5 sm:p-6 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-extrabold uppercase px-2.5 py-1 rounded-md bg-indigo-600 text-white tracking-wider">
                    BOX 1
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-none">
                      Raw Input Text
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Live Editable Document Stream
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTransform()}
                    disabled={isTransforming}
                    className={`px-3.5 py-1.5 font-bold text-xs rounded-lg transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
                      hasPendingChanges || justPasted
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white ring-2 ring-emerald-300 animate-pulse'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                    title="Apply deterministic rules and transform output (Ctrl+Enter)"
                  >
                    {isTransforming ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    )}
                    <span>{isTransforming ? 'Transforming...' : 'Transform Output'}</span>
                  </button>

                  <button
                    onClick={handlePasteInput}
                    title="Paste from clipboard and transform"
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-slate-200 text-xs flex items-center gap-1"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px] font-medium">Paste</span>
                  </button>
                  <button
                    onClick={() => {
                      setInputText('');
                      setActiveInputText('');
                      setHasPendingChanges(false);
                      setJustPasted(false);
                    }}
                    title="Clear text"
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200 text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px] font-medium">Clear</span>
                  </button>
                </div>
              </div>

              {/* Text Area */}
              <div className="flex-1 flex flex-col space-y-2">
                <textarea
                  value={inputText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInputText(val);
                    if (autoTransform) {
                      setActiveInputText(val);
                      setLastTransformedAt(new Date().toLocaleTimeString());
                      setHasPendingChanges(false);
                      setJustPasted(false);
                    } else {
                      setHasPendingChanges(true);
                    }
                  }}
                  onPaste={(e) => {
                    const pastedText = e.clipboardData?.getData('text');
                    if (pastedText) {
                      e.preventDefault();
                      const target = e.target as HTMLTextAreaElement;
                      const start = target.selectionStart ?? 0;
                      const end = target.selectionEnd ?? 0;
                      const currentVal = inputText;
                      const newVal = currentVal.slice(0, start) + pastedText + currentVal.slice(end);
                      setInputText(newVal);
                      setActiveInputText(newVal);
                      handleTransform(newVal);
                    }
                  }}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                      e.preventDefault();
                      handleTransform();
                    }
                  }}
                  rows={9}
                  placeholder="Type or paste any English sentence or complex scientific paragraph here to test..."
                  className="w-full flex-1 p-4 text-sm sm:text-base font-serif-scholarly bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 resize-y leading-relaxed min-h-[220px]"
                />

                {/* Dedicated Transform Action Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/80 p-3 rounded-xl border border-indigo-100 shadow-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTransform()}
                      disabled={isTransforming}
                      className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 text-white ${
                        hasPendingChanges || justPasted || inputText !== activeInputText
                          ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 ring-2 ring-emerald-400 shadow-emerald-500/30 animate-pulse'
                          : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 shadow-indigo-600/30'
                      }`}
                      title="Apply deterministic rules to the input text and update output (Shortcut: Ctrl+Enter)"
                    >
                      {isTransforming ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                      )}
                      <span className="tracking-wide">
                        {isTransforming ? 'Transforming & Applying Rules...' : '⚡ Transform (Apply Rules)'}
                      </span>
                      <span className="text-[10px] font-mono opacity-80 font-normal px-1.5 py-0.5 rounded bg-black/20 text-white ml-0.5">
                        Ctrl+Enter
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
                    {/* Auto-sync switch */}
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 hover:text-slate-900 select-none text-[11px]">
                      <input
                        type="checkbox"
                        checked={autoTransform}
                        onChange={(e) => setAutoTransform(e.target.checked)}
                        className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                      <span>Auto-sync on type</span>
                    </label>

                    {/* Status indicator */}
                    <div
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 ${
                        hasPendingChanges || justPasted || inputText !== activeInputText
                          ? 'bg-amber-100/90 text-amber-900 border-amber-300 font-bold'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          hasPendingChanges || justPasted || inputText !== activeInputText
                            ? 'bg-amber-500 animate-ping'
                            : 'bg-emerald-500'
                        }`}
                      />
                      <span>
                        {hasPendingChanges || justPasted || inputText !== activeInputText
                          ? 'New text detected — Click Transform'
                          : `Synced at ${lastTransformedAt}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Instant Action Feedback Toast Banner */}
                {actionNotification && (
                  <div className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-medium flex items-center justify-between gap-2 shadow-sm border border-slate-700 animate-fadeIn">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                      <span>{actionNotification}</span>
                    </span>
                    <button
                      onClick={() => setActionNotification(null)}
                      className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                      title="Dismiss notification"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Box 1 Footer Stats */}
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="font-semibold text-slate-700">{inputText.length}</span> chars
                  <span>·</span>
                  <span className="font-semibold text-slate-700">
                    {inputText.trim() ? inputText.trim().split(/\s+/).length : 0}
                  </span>{' '}
                  words
                  <span>·</span>
                  <span className="font-semibold text-slate-700">{result.sentencesCount}</span>{' '}
                  sentences
                </div>

                <div className="text-[11px] text-indigo-600 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Live Parser Active</span>
                </div>
              </div>
            </div>

            {/* BOX 2: OUTPUT PANE */}
            <div
              className={`bg-white rounded-2xl border-2 shadow-sm p-5 sm:p-6 flex flex-col justify-between space-y-4 transition-all duration-300 ${
                isTransforming
                  ? 'border-indigo-400 ring-4 ring-indigo-200/50 scale-[1.002]'
                  : 'border-emerald-300/80'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-extrabold uppercase px-2.5 py-1 rounded-md bg-emerald-600 text-white tracking-wider">
                    BOX 2
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-none">
                      Engine Output & Analysis
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Deterministic-First Resolution
                    </span>
                  </div>
                </div>

                {/* View Mode Toggle and Copy Button */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
                    <button
                      onClick={() => setOutputViewMode('clean')}
                      className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                        outputViewMode === 'clean'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Clean</span>
                    </button>
                    <button
                      onClick={() => setOutputViewMode('diff')}
                      className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                        outputViewMode === 'diff'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                      <span>Visual Diff</span>
                    </button>
                  </div>

                  <button
                    onClick={handleCopyOutput}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5"
                    title="Copy corrected output"
                  >
                    {copied ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Output Content Display */}
              <div className="flex-1 flex flex-col space-y-3">
                {/* Active Transforming Scanning Indicator */}
                {isTransforming && (
                  <div className="p-3 bg-indigo-600 text-white rounded-xl flex items-center justify-center gap-2 text-xs font-semibold shadow-md animate-pulse">
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Processing text with deterministic rule engine...</span>
                  </div>
                )}

                {/* Pending Transformation Alert when input has changed */}
                {inputText !== activeInputText && !isTransforming && (
                  <div className="p-3 bg-amber-50 border-2 border-dashed border-amber-300 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs text-amber-900 animate-fadeIn">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <div className="font-bold">New text in Box 1 awaiting transformation</div>
                        <div className="text-[11px] text-amber-700">Click &quot;⚡ Transform (Apply Rules)&quot; in Box 1 or below to process.</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleTransform()}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shrink-0 active:scale-95 transition-all"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                      <span>Transform Now</span>
                    </button>
                  </div>
                )}

                {/* Status Diagnostic Banner */}
                {!result.hasChanged ? (
                  result.stylisticAdvisories && result.stylisticAdvisories.length > 0 ? (
                    <div className={`p-3 bg-amber-50 border border-amber-200/90 rounded-xl space-y-2 text-xs transition-all ${transformPulse ? 'ring-2 ring-amber-400' : ''}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-amber-900 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Output Matches Input: 1 Stylistic Advisory Detected</span>
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-amber-200/70 text-amber-900 rounded font-mono">
                          Non-Destructive Policy
                        </span>
                      </div>
                      <p className="text-amber-800 text-[11px] leading-relaxed">
                        All mandatory grammar and agreement checks passed. The introductory clause contains a{' '}
                        <strong>dangling participle modifier</strong> (&quot;{result.stylisticAdvisories[0].text}&quot;). Per conservative design, human agency is preserved. You can adopt any valid rewrite below with one click:
                      </p>
                      <div className="space-y-1.5 pt-1 border-t border-amber-200/60">
                        {result.stylisticAdvisories[0].suggestions.map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() =>
                              handleApplyStylisticSuggestion(
                                result.stylisticAdvisories![0].originalSentence,
                                sug
                              )
                            }
                            className="w-full text-left p-2 bg-white hover:bg-amber-100/60 border border-amber-300 rounded-lg text-xs font-serif-scholarly text-slate-800 transition-all flex items-center justify-between gap-2 group shadow-2xs"
                          >
                            <span className="line-clamp-1">{sug}</span>
                            <span className="shrink-0 px-2 py-0.5 rounded bg-amber-600 group-hover:bg-amber-700 text-white font-sans text-[10px] font-bold flex items-center gap-1">
                              <Zap className="w-2.5 h-2.5" />
                              <span>Apply Rewrite</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className={`p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs transition-all ${transformPulse ? 'ring-2 ring-indigo-400 bg-indigo-50/40' : ''}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 font-bold text-slate-800">
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Engine Executed: Text is clean under active rules (0 modifications needed)</span>
                        </span>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-500">
                          {result.processingTimeMs}ms • Output = Input
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        All 45 deterministic grammar, agreement, and mechanic rules evaluated this text across 3 validation passes. Zero mechanical errors detected under conservative policy.
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60 text-[11px]">
                        <span className="text-slate-500 font-medium">Quick-load test samples:</span>
                        <button
                          onClick={() => handleLoadSample('The researcher conclude that this results indicates a pattern.')}
                          className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-indigo-600 font-semibold text-[11px] hover:border-indigo-300 transition-colors"
                        >
                          Subject-Verb Agreement
                        </button>
                        <button
                          onClick={() => handleLoadSample('They was surprised because they should of verified the data.')}
                          className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-indigo-600 font-semibold text-[11px] hover:border-indigo-300 transition-colors"
                        >
                          Past Tense & Modals
                        </button>
                        <button
                          onClick={() => handleLoadSample('She completed a evaluation of an study on memory.')}
                          className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-indigo-600 font-semibold text-[11px] hover:border-indigo-300 transition-colors"
                        >
                          Indefinite Articles
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  <div className={`p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-900 transition-all ${transformPulse ? 'ring-2 ring-emerald-400 bg-emerald-100/60' : ''}`}>
                    <span className="flex items-center gap-1.5 font-bold">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{result.appliedCandidates.length} Grammar Correction(s) Applied Deterministically</span>
                    </span>
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      <span className="px-2 py-0.5 bg-emerald-200/80 text-emerald-800 rounded font-semibold">
                        {result.processingTimeMs}ms • 3 passes
                      </span>
                      <span className="px-2 py-0.5 bg-white border border-emerald-300 text-emerald-700 rounded">
                        Visual Diff Active
                      </span>
                    </div>
                  </div>
                )}

                <div className={`w-full flex-1 p-4 text-sm sm:text-base font-serif-scholarly bg-slate-50/80 border border-slate-200 rounded-xl text-slate-900 leading-relaxed overflow-y-auto min-h-[200px] transition-all duration-300 ${transformPulse ? 'ring-2 ring-indigo-500/50 bg-indigo-50/20' : ''}`}>
                  {outputViewMode === 'clean' ? (
                    <div>{result.outputText}</div>
                  ) : (
                    <div className="space-y-1">
                      {wordDiff.map((token, idx) => {
                        if (token.type === 'removed') {
                          return (
                            <span
                              key={idx}
                              title="Original removed by rule"
                              className="line-through bg-rose-100 text-rose-800 font-semibold px-1 py-0.5 rounded mx-0.5 border border-rose-200"
                            >
                              {token.value}
                            </span>
                          );
                        }
                        if (token.type === 'added') {
                          return (
                            <span
                              key={idx}
                              title="Corrected replacement applied"
                              className="bg-emerald-100 text-emerald-900 font-bold px-1.5 py-0.5 rounded mx-0.5 border border-emerald-300 no-underline shadow-xs"
                            >
                              {token.value}
                            </span>
                          );
                        }
                        return <span key={idx}>{token.value}</span>;
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Box 2 Footer Diagnostics & Corrections Carousel */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-[11px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wide border ${
                        result.appliedCandidates.length > 0
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {result.appliedCandidates.length > 0
                        ? `✓ ${result.appliedCandidates.length} Correction(s) Applied`
                        : '✓ Clean Text (0 Alterations)'}
                    </span>

                    <span className="font-mono text-[11px] text-slate-400">
                      {result.processingTimeMs}ms · {result.passesExecuted} pass(es)
                    </span>
                  </div>

                  <div className="text-slate-500 font-mono text-[11px]">
                    <span className="font-bold text-slate-800">
                      {result.appliedCandidates.length}
                    </span>{' '}
                    applied ·{' '}
                    <span className="font-bold text-amber-700">
                      {result.suggestedCandidates.length}
                    </span>{' '}
                    suggested ·{' '}
                    <span className="font-bold text-slate-400">
                      {result.suppressedCandidates.length}
                    </span>{' '}
                    guarded
                  </div>
                </div>

                {/* Applied Corrections Pills Carousel */}
                {result.appliedCandidates.length > 0 && (
                  <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-200/80 space-y-1.5">
                    <div className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Applied Linguistic Rules:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.appliedCandidates.map((cand, i) => (
                        <div
                          key={i}
                          className="px-2 py-1 bg-white border border-emerald-200 rounded-lg text-xs font-mono shadow-xs flex items-center gap-1.5"
                        >
                          <span className="line-through text-rose-700 bg-rose-50 px-1 rounded text-[11px]">
                            {cand.original}
                          </span>
                          <ArrowRight className="w-3 h-3 text-emerald-600" />
                          <span className="font-bold text-emerald-800 bg-emerald-50 px-1 rounded text-[11px]">
                            {cand.replacement}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1 font-sans">
                            ({cand.ruleId})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stylistic Advisory Alert (e.g. Dangling Participle) */}
                {result.stylisticAdvisories && result.stylisticAdvisories.length > 0 && (
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-bold text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Stylistic Advisory: Dangling Modifier Diagnostic</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-semibold">
                        Action Required
                      </span>
                    </div>
                    {result.stylisticAdvisories.map((adv) => (
                      <div key={adv.id} className="text-amber-800 space-y-2">
                        <p className="leading-relaxed">{adv.explanation}</p>
                        <div className="font-medium text-amber-900 text-[11px] space-y-1.5">
                          <span>Click to apply verified author revision:</span>
                          <div className="space-y-1 font-serif-scholarly">
                            {adv.suggestions.map((sug, sIdx) => (
                              <button
                                key={sIdx}
                                onClick={() =>
                                  handleApplyStylisticSuggestion(adv.originalSentence, sug)
                                }
                                className="w-full text-left p-2 bg-white hover:bg-amber-100/70 border border-amber-300/80 rounded-lg text-xs text-slate-800 transition-all flex items-center justify-between gap-2 group shadow-2xs"
                              >
                                <span>{sug}</span>
                                <span className="shrink-0 px-2 py-0.5 rounded bg-amber-600 group-hover:bg-amber-700 text-white font-sans text-[10px] font-bold">
                                  Adopt
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Discourse Escalation Alert */}
                {result.discourseEscalations && result.discourseEscalations.length > 0 && (
                  <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 space-y-1.5 text-xs text-purple-900">
                    <div className="flex items-center gap-2 font-bold">
                      <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>Discourse Pronoun Escalation Required</span>
                    </div>
                    <p className="text-purple-800">
                      Pronoun reference mismatch detected between antecedent and anaphor across clauses. Deterministic engine preserved original text and prepared AI escalation candidate.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Engine Parameters & Controls Bar (Compact) */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Mode Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Processing Mode:
                </span>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  {(
                    [
                      ['autoApply', 'Auto-Apply (>=0.98)'],
                      ['suggest', 'Suggestion Mode'],
                      ['shadow', 'Shadow Mode (Observe)'],
                    ] as const
                  ).map(([modeKey, label]) => (
                    <button
                      key={modeKey}
                      onClick={() => setEngineMode(modeKey)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                        engineMode === modeKey
                          ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableL1}
                    onChange={(e) => setEnableL1(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Opt-in L1 Transfer Rules (AR/FR)</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skipQuotes}
                    onChange={(e) => setSkipQuotes(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Protect Direct Quotes</span>
                </label>
              </div>
            </div>
          </div>

          {/* Trace Inspector Deck */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Execution Trace & Provenance Breakdown
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Rule Policy: confidence ≥ 0.98 auto-applies; 0.90–0.979 suggests; guarded = suppressed
              </span>
            </div>

            {/* Protected Spans Table */}
            {result.protectedSpans.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>
                    Protected Spans Identified ({result.protectedSpans.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.protectedSpans.map((span, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg"
                    >
                      <strong className="uppercase text-[10px] mr-1 text-emerald-600">
                        {span.kind}:
                      </strong>
                      "{span.matchedText}" [{span.start}..{span.end}]
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Proposed / Applied Candidates List */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Rule Matches & Candidate Decisions ({result.candidates.length}):
              </span>

              {result.candidates.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                  No rule triggered on this text. Clean text preserved with zero modifications.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {result.candidates.map((cand, idx) => {
                    const isApplied = cand.status === 'auto_applied';
                    const isSuggested = cand.status === 'suggested';
                    const isSuppressed = cand.status === 'suppressed_by_guard' || cand.status === 'conflict_dropped';

                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border text-xs space-y-2 transition-colors ${
                          isApplied
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : isSuggested
                            ? 'bg-amber-50/40 border-amber-200'
                            : 'bg-slate-50 border-slate-200 opacity-75'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {cand.ruleId}
                            </span>
                            <span className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                              {cand.category}
                            </span>
                            <span className="font-mono text-slate-500">
                              conf: {(cand.confidence * 100).toFixed(1)}%
                            </span>
                          </div>

                          <span
                            className={`font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              isApplied
                                ? 'bg-emerald-600 text-white'
                                : isSuggested
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {cand.status}
                          </span>
                        </div>

                        {/* Diff representation */}
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="line-through text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            "{cand.original}"
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            "{cand.replacement}"
                          </span>
                          <span className="text-[11px] text-slate-400">
                            at [{cand.start}..{cand.end}]
                          </span>
                        </div>

                        {/* Rationale and provenance */}
                        <div className="text-slate-600 pt-1 border-t border-slate-100">
                          <span className="font-semibold text-slate-800">Rationale: </span>
                          {cand.rationale}
                          {cand.provenance && (
                            <span className="italic text-slate-400 block mt-0.5 text-[11px]">
                              Provenance: {cand.provenance}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* TIER 2: Intrasentential Clause Structure */}
            {result.clauses && result.clauses.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-blue-100 text-blue-800 font-mono">
                      Tier 2: Syntax
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Intrasentential Clause Structure & Tense Analysis ({result.clauses.length} clauses)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Matrix & Subordinate boundaries identified deterministically
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.clauses.map((clause, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-blue-100 bg-blue-50/30 text-xs space-y-1.5 font-mono"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded text-[11px]">
                          {clause.clauseId} · {clause.type.toUpperCase()} CLAUSE
                        </span>
                        {clause.subordinator && (
                          <span className="text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 text-[10px]">
                            Subordinator: "{clause.subordinator}"
                          </span>
                        )}
                      </div>
                      <p className="text-slate-800 font-sans italic text-xs">
                        "{clause.text}"
                      </p>
                      <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 pt-1 border-t border-blue-100/60 font-sans">
                        {clause.subject && (
                          <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                            <strong>Subject:</strong> {clause.subject.text} ({clause.subject.number}, {clause.subject.person})
                          </span>
                        )}
                        {clause.verb && (
                          <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                            <strong>Verb:</strong> {clause.verb.text} ({clause.verb.tense.replace('_', ' ')})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TIER 2: Stylistic & Agency Advisories (Dangling Modifiers) */}
            {result.stylisticAdvisories && result.stylisticAdvisories.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-amber-100 text-amber-800 font-mono">
                      Tier 2: Syntax / Style
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-950">
                      Stylistic & Agency Advisories ({result.stylisticAdvisories.length})
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-700 font-medium">
                    Non-Destructive Editorial Policy: Preserves sentence agency without auto-rewriting
                  </span>
                </div>

                <div className="space-y-3">
                  {result.stylisticAdvisories.map((adv, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border-2 border-amber-200 bg-amber-50/40 text-xs space-y-3 shadow-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-900 bg-white px-2.5 py-1 rounded-md border border-amber-200 shadow-xs">
                            {adv.ruleId}
                          </span>
                          <span className="font-semibold text-amber-900">
                            Dangling Participial Modifier Detected
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-700 text-white font-mono text-[10px] uppercase font-bold tracking-wider">
                          Stylistic Advisory · Suggestion Only
                        </span>
                      </div>

                      <p className="text-slate-800 leading-relaxed font-sans">{adv.explanation}</p>

                      <div className="bg-white p-3 rounded-xl border border-amber-100 space-y-2">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          Recommended Editorial Revisions:
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
                          {adv.suggestions.map((sug, sIdx) => (
                            <li key={sIdx} className="italic text-slate-800">
                              "{sug}"
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TIER 3: Discourse Escalation & Anaphoric Reference Card */}
            {result.discourseEscalations && result.discourseEscalations.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-purple-100 text-purple-800 font-mono">
                      Tier 3: Discourse
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-950">
                      Discourse Reference & Semantic Escalations ({result.discourseEscalations.length})
                    </span>
                  </div>
                  <span className="text-[11px] text-purple-600 font-medium">
                    Ambiguity Escalation Policy: Preserves authorial intent without ad-hoc patches
                  </span>
                </div>

                <div className="space-y-4">
                  {result.discourseEscalations.map((esc, idx) => (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 rounded-2xl border-2 border-purple-200 bg-purple-50/40 text-xs space-y-4 shadow-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-purple-900 bg-white px-2.5 py-1 rounded-md border border-purple-200 shadow-xs">
                            {esc.id}
                          </span>
                          <span className="font-semibold text-purple-900">
                            Pronoun-Antecedent Discordance: "{esc.pronoun}" ↔ "{esc.potentialAntecedent}"
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-700 text-white font-mono text-[10px] uppercase font-bold tracking-wider">
                          Escalate to AI / Author Review
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-purple-100 text-slate-700 space-y-1.5 leading-relaxed">
                        <p className="font-semibold text-purple-950">
                          Linguistic Context & Why Flat Regex Cannot Patch This:
                        </p>
                        <p className="text-xs text-slate-600">
                          In complex sentence <code className="bg-slate-100 px-1 py-0.5 rounded text-purple-900 font-mono">"{esc.sentenceText}"</code>, the singular pronoun <code className="text-purple-700 font-mono font-bold">"{esc.pronoun}"</code> has matrix subject <code className="text-purple-700 font-mono font-bold">"{esc.potentialAntecedent}"</code> (plural). Because this may represent either an anaphoric number error <em>or</em> a legitimate reference to an external individual, the engine isolates two grammatically sound hypotheses rather than applying a destructive guess:
                        </p>
                      </div>

                      {/* Hypotheses Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {esc.hypotheses.map((hyp) => (
                          <div
                            key={hyp.id}
                            className="bg-white p-3.5 rounded-xl border border-purple-200/80 hover:border-purple-300 transition-colors flex flex-col justify-between space-y-3"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-purple-900 text-xs">
                                  {hyp.label}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {(hyp.confidence * 100).toFixed(0)}% conf
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 leading-normal">
                                {hyp.explanation}
                              </p>
                              <div className="p-2 bg-slate-50 rounded-lg font-mono text-[11px] text-slate-800 border border-slate-100">
                                "{hyp.revisedSentence}"
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setInputText(hyp.revisedSentence);
                              }}
                              className="w-full py-1.5 text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg border border-purple-200 transition-colors"
                            >
                              Apply Hypothesis to Workbench
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-purple-100/70">
                        <span className="text-[11px] text-purple-700 italic">
                          IdiomOptima Principle 2: Preserve authorial meaning without guessing.
                        </span>
                        <button
                          onClick={() => setAiModalPayload(esc.aiPromptPayload)}
                          className="px-3 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>View Structured AI Escalation Payload</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clause & Discourse Reference Architecture Tab */}
      {subTab === 'discourse' && (
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 text-white rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-300">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Linguistic Theory & System Design</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Unified 3-Tier Grammar Model: Solving Anaphora & Meaning Beyond Ad-Hoc Regex
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
              Why flat regex patches fail on complex sentences: In English prose, pronouns like <code className="text-purple-300 bg-purple-950/60 px-1 py-0.5 rounded font-mono">"she"</code> in subordinate clauses are anaphoric references governed by discourse context. A simple SVO pattern matcher cannot distinguish between an anaphoric number error (referring to plural <code className="text-purple-300 bg-purple-950/60 px-1 py-0.5 rounded font-mono">"The researchers"</code>) and a legitimate reference to an unstated female individual. Rather than accumulating fragile regex patches, IdiomOptima employs a mathematically stratified 3-tier architecture.
            </p>
          </div>

          {/* 3-Tier Layer Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-800 font-mono">
                  Tier 1: Local
                </span>
                <span className="text-[11px] text-slate-400 font-mono">&lt; 1ms latency</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Surface Mechanics & Adjacency</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deterministic token-bounded edits where context is 100% local. Adjacent duplicate words (<em>"the the"</em>), spacing before punctuation, and direct pronoun-auxiliary clashes (<em>"she have"</em> → <em>"she has"</em>).
              </p>
              <div className="pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500">
                <strong>Prerequisites:</strong> Tokenizer, Protected Spans
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-100 text-blue-800 font-mono">
                  Tier 2: Syntax
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Structural AST</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Intrasentential Dependency & Clauses</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Segments matrix and subordinate clauses (<em>"although..."</em>). Analyzes head-verb agreement across intervening prepositional phrases and enforces sequence-of-tense harmony between clauses.
              </p>
              <div className="pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500">
                <strong>Prerequisites:</strong> Clause Segmenter, Dependency Parser
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-100 text-purple-800 font-mono">
                  Tier 3: Discourse
                </span>
                <span className="text-[11px] text-purple-600 font-bold font-mono">AI Escalation</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Discourse Anaphora & Coreference</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Resolves cross-clause and cross-sentence anaphoric links. When reference is ambiguous (e.g., <em>"researchers"</em> vs. <em>"she"</em>), generates structured hypotheses and escalates to AI rather than corrupting authorial meaning.
              </p>
              <div className="pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500">
                <strong>Prerequisites:</strong> Coreference Graph, LLM Escalation Broker
              </div>
            </div>
          </div>

          {/* Deep Dive Case Study Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Case Study: Dissecting "The researchers entered the laboratory, although she has not finished yet"</span>
            </h4>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-slate-800">
              The researchers [Matrix Subject: 3rd Plural] entered [Matrix Verb: Past] the laboratory, although [Subordinator] she [Subordinate Subject: 3rd Singular Feminine] has not finished [Subordinate Verb: Present Perfect] yet.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2">
                <span className="font-bold text-rose-900 uppercase tracking-wide text-[11px] block">
                  The Fragility of Ad-Hoc Regex Patches:
                </span>
                <p className="text-rose-800 leading-relaxed">
                  If an engineer writes a regex rule: <code className="bg-white px-1 py-0.5 rounded text-rose-900 font-mono">/researchers.*although\s+she/ → "they"</code>, the app will break whenever a valid singular female actor is introduced:
                </p>
                <div className="p-2 bg-white rounded border border-rose-200 font-mono text-[11px] text-rose-900">
                  "The researchers completed their round, although she (the director) ordered a recount."
                </div>
                <p className="text-rose-700 italic text-[11px]">
                  Result: Blindly replacing "she" with "they" destroys authorial meaning and produces false-positive corruptions.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                <span className="font-bold text-emerald-900 uppercase tracking-wide text-[11px] block">
                  The IdiomOptima Tiered Escalation Solution:
                </span>
                <p className="text-emerald-800 leading-relaxed">
                  The engine's Clause & Discourse Analyzer identifies that the subordinate subject is an anaphor with no singular antecedent in the sentence. It generates two explicit hypotheses:
                </p>
                <ul className="list-disc list-inside space-y-1 text-emerald-900 font-medium">
                  <li><strong>Hypothesis 1:</strong> Antecedent alignment to plural <em>"they had not finished yet"</em>.</li>
                  <li><strong>Hypothesis 2:</strong> Legitimate external referent with past tense harmony: <em>"she had not finished yet"</em>.</li>
                </ul>
                <p className="text-emerald-700 text-[11px]">
                  Decision is cleanly escalated to the author or AI review, guaranteeing zero false-positive mutations.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regression Suite & Metrics Tab */}
      {subTab === 'suite' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900 text-white rounded-2xl shadow-sm">
            <div>
              <h3 className="text-xl font-bold">Standard Regression Suite Execution</h3>
              <p className="text-xs text-slate-300 mt-1">
                Executes all positive and negative control test cases from grammar_test_suite.json to verify precision, recall, and zero false-positive rate.
              </p>
            </div>
            <button
              onClick={handleRunSuite}
              className="px-5 py-2.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center gap-2 shrink-0 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Run Regression Suite</span>
            </button>
          </div>

          {suiteResult && (
            <div className="space-y-6">
              {/* Scorecard Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="p-4 bg-white rounded-xl border border-slate-200 text-center">
                  <div className="text-2xl font-bold font-mono text-emerald-600">
                    {suiteResult.precision}%
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">Precision</div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 text-center">
                  <div className="text-2xl font-bold font-mono text-indigo-600">
                    {suiteResult.recall}%
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">Recall</div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 text-center">
                  <div className="text-2xl font-bold font-mono text-emerald-600">
                    {suiteResult.falsePositiveRate}%
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">
                    False Positives (Controls)
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 text-center">
                  <div className="text-2xl font-bold font-mono text-slate-900">
                    {suiteResult.passed} / {suiteResult.total}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">Test Cases Passed</div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 text-center">
                  <div className="text-2xl font-bold font-mono text-purple-600">
                    {suiteResult.averageLatencyMs}ms
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">Average Latency</div>
                </div>
              </div>

              {/* Individual Test Case Breakdown */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Regression Cases Detail ({suiteResult.details.length})
                </div>
                <div className="divide-y divide-slate-100">
                  {suiteResult.details.map((d) => (
                    <div
                      key={d.caseId}
                      className="p-4 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/50"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`p-0.5 rounded-full ${
                              d.passed ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {d.passed ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                          </span>
                          <span className="font-mono font-bold text-slate-900">{d.caseId}</span>
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                            {d.status}
                          </span>
                        </div>
                        <div className="font-serif-scholarly text-sm text-slate-800">
                          Result: "{d.actualOutput}"
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          Target / Spec: "{d.expectedOutput}"
                        </div>
                        {d.errorMessage && (
                          <div className="text-rose-600 font-mono text-[11px]">
                            {d.errorMessage}
                          </div>
                        )}
                      </div>

                      <div className="font-mono text-[11px] text-slate-500 shrink-0">
                        Rule: {d.expectedRule}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rules Database Catalog */}
      {subTab === 'rules' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Seed Grammar Rules Registry (grammar_rules.json)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing all active mechanical rules alongside explicitly disabled parser-dependent rule families.
                </p>
              </div>
              <span className="font-mono text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg font-bold">
                Showing {filteredRules.length} of {SEED_RULES.length} rules
              </span>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {['ALL', 'AGR', 'MODAL', 'COND', 'SYN', 'ADV', 'PREP', 'ART', 'STYLE'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedRuleCategory(cat)}
                    className={`px-3 py-1 rounded-lg font-mono text-[11px] font-bold transition-all ${
                      selectedRuleCategory === cat
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'ALL' ? 'All Rules' : cat}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={ruleSearch}
                  onChange={(e) => setRuleSearch(e.target.value)}
                  placeholder="Search rules by ID or keyword..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
              {filteredRules.map((r) => (
                <div
                  key={r.id}
                  className={`p-4 rounded-xl border text-xs space-y-2.5 transition-all shadow-2xs ${
                    r.enabled
                      ? 'bg-white border-slate-200 hover:border-indigo-300'
                      : 'bg-slate-50/80 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{r.id}</span>
                      <span className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px] font-bold border border-indigo-100">
                        {r.category}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                          r.autoApply
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.autoApply ? 'Level 1: Auto' : 'Level 2/3: Advisory'}
                      </span>
                    </div>
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        r.enabled
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {r.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  <p className="text-slate-800 font-medium leading-relaxed">{r.description}</p>

                  <div className="font-mono text-[11px] text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200 break-words leading-normal">
                    <span className="font-bold text-slate-500 mr-1">Match [{r.match.type}]:</span>
                    {typeof r.match.pattern === 'string'
                      ? r.match.pattern
                      : JSON.stringify(r.match)}
                    <span className="mx-1 text-slate-400">→</span>
                    <span className="text-emerald-800 font-bold">
                      {typeof r.replacement === 'string'
                        ? r.replacement
                        : JSON.stringify(r.replacement)}
                    </span>
                  </div>

                  {r.examples?.positive && r.examples.positive.length > 0 && (
                    <div className="text-[11px] bg-slate-50/60 p-2 rounded border border-slate-100 space-y-1">
                      <div className="text-slate-500 font-semibold text-[10px] uppercase">Example:</div>
                      <div className="line-through text-rose-700 font-serif-scholarly">
                        "{r.examples.positive[0].input}"
                      </div>
                      <div className="text-emerald-800 font-semibold font-serif-scholarly">
                        "{r.examples.positive[0].expected}"
                      </div>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 flex flex-wrap gap-2 pt-1 border-t border-slate-100">
                    <span>Priority: {r.priority}</span>
                    <span>·</span>
                    <span>Confidence: {(r.confidence * 100).toFixed(0)}%</span>
                    <span>·</span>
                    <span>Tier: {r.tier || 'tier1-local'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Exceptions & Guards Catalog */}
      {subTab === 'exceptions' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Global Guards & Exception Invariants (grammar_exceptions.json)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pre-flight and pre-application invariants ensuring protected spans, semantic scopes, quotes, and dialects remain untouched.
                </p>
              </div>
              <span className="font-mono text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                Schema v{OFFICIAL_GRAMMAR_EXCEPTIONS.schemaVersion}
              </span>
            </div>

            {/* Protected Span Kinds */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Protected Span Kinds ({OFFICIAL_GRAMMAR_EXCEPTIONS.protectedSpanKinds.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {OFFICIAL_GRAMMAR_EXCEPTIONS.protectedSpanKinds.map((kind) => (
                  <span
                    key={kind}
                    className="px-2.5 py-1 text-xs font-mono text-emerald-800 bg-white border border-emerald-200 rounded-md shadow-2xs"
                  >
                    {kind}
                  </span>
                ))}
              </div>
            </div>

            {/* Global Guards Table / Cards */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Enforced Global Guards ({OFFICIAL_GRAMMAR_EXCEPTIONS.globalGuards.length}):
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {OFFICIAL_GRAMMAR_EXCEPTIONS.globalGuards.map((g) => (
                  <div
                    key={g.id}
                    className="p-4 bg-white rounded-xl border border-slate-200 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-indigo-700 text-xs">
                        {g.id}
                      </span>
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                          g.action === 'reject_candidate'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : g.action === 'escalate'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {g.action.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="text-xs font-medium text-slate-800">
                      Condition: <span className="font-normal text-slate-600">{g.condition}</span>
                    </div>

                    <div className="text-xs text-slate-500 pt-1 border-t border-slate-100">
                      Reason: {g.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dialect and Application Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-800 uppercase tracking-wide text-[11px] block">
                  Dialect Notes:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  {OFFICIAL_GRAMMAR_EXCEPTIONS.dialectNotes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-800 uppercase tracking-wide text-[11px] block">
                  Application Invariants:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  {OFFICIAL_GRAMMAR_EXCEPTIONS.applicationNotes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Escalation Structured Payload Modal */}
      {aiModalPayload && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h4 className="text-base font-bold text-slate-900">
                  AI Escalation Structured Payload
                </h4>
              </div>
              <button
                onClick={() => setAiModalPayload(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              This structured JSON payload is formatted for IdiomOptima's server-side LLM proxy route. It passes complete discourse context, isolating the anaphoric tension without hallucination:
            </p>

            <div className="bg-slate-900 text-purple-300 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-80 border border-slate-800">
              <pre>{JSON.stringify(aiModalPayload, null, 2)}</pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 font-mono">
                Schema: IdiomOptimaDiscourseEscalationPayload v0.1.0
              </span>
              <button
                onClick={() => setAiModalPayload(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
