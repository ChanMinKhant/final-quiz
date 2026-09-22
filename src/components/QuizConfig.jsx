import React, { useState } from 'react';
import { ArrowLeft, Play, Shuffle, SlidersHorizontal } from 'lucide-react';

export default function QuizConfig({ subject, onBack, onStartPractice }) {
  const totalQuestions = subject.questions.length;

  const [fromQuestion, setFromQuestion] = useState(1);
  const [toQuestion, setToQuestion] = useState(totalQuestions);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);

  // Validation
  const validFrom = Math.max(1, Math.min(Number(fromQuestion) || 1, totalQuestions));
  const validTo = Math.max(validFrom, Math.min(Number(toQuestion) || totalQuestions, totalQuestions));
  const selectedCount = Math.max(0, validTo - validFrom + 1);

  const handleFromChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) {
      setFromQuestion('');
    } else {
      const clamped = Math.max(1, Math.min(val, totalQuestions));
      setFromQuestion(clamped);
      if (clamped > toQuestion) {
        setToQuestion(clamped);
      }
    }
  };

  const handleToChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) {
      setToQuestion('');
    } else {
      const clamped = Math.max(1, Math.min(val, totalQuestions));
      setToQuestion(clamped);
      if (clamped < fromQuestion) {
        setFromQuestion(clamped);
      }
    }
  };

  const setPreset = (from, to) => {
    setFromQuestion(from);
    setToQuestion(to);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onStartPractice({
      fromQuestion: validFrom,
      toQuestion: validTo,
      shuffleQuestions,
      shuffleOptions
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Subjects</span>
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-2">
          <span>Configuration</span>
          <span>•</span>
          <span>{totalQuestions} Total Available</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {subject.title}
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Customize your question slice and randomization rules before starting.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Range Selector Card */}
        <div className="p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Question Range
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Max pool: {totalQuestions}
            </span>
          </div>

          {/* Range Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                From Question
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max={totalQuestions}
                  value={fromQuestion}
                  onChange={handleFromChange}
                  onBlur={() => setFromQuestion(validFrom)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 focus:border-transparent transition-all"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono pointer-events-none">
                  #
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                To Question
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max={totalQuestions}
                  value={toQuestion}
                  onChange={handleToChange}
                  onBlur={() => setToQuestion(validTo)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 focus:border-transparent transition-all"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono pointer-events-none">
                  #
                </span>
              </div>
            </div>
          </div>

          {/* Quick Preset Chips */}
          <div className="pt-1 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 mr-1">Quick Select:</span>
            <button
              type="button"
              onClick={() => setPreset(1, totalQuestions)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                validFrom === 1 && validTo === totalQuestions
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All ({totalQuestions})
            </button>

            {totalQuestions > 5 && (
              <button
                type="button"
                onClick={() => setPreset(1, Math.min(5, totalQuestions))}
                className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                  validFrom === 1 && validTo === Math.min(5, totalQuestions)
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                First 5
              </button>
            )}

            {totalQuestions >= 10 && (
              <button
                type="button"
                onClick={() => setPreset(1, 10)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                  validFrom === 1 && validTo === 10
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                First 10
              </button>
            )}

            {totalQuestions >= 20 && (
              <button
                type="button"
                onClick={() => setPreset(1, 20)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                  validFrom === 1 && validTo === 20
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                First 20
              </button>
            )}
          </div>
        </div>

        {/* Shuffling & Randomization Toggles */}
        <div className="p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Shuffle className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Randomization Options
            </h2>
          </div>

          {/* Toggle 1: Shuffle Questions */}
          <label className="flex items-start gap-3.5 p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850/50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={shuffleQuestions}
              onChange={(e) => setShuffleQuestions(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-slate-900 dark:text-slate-100 focus:ring-slate-900 dark:focus:ring-slate-100 border-slate-300 dark:border-slate-700 accent-slate-900 dark:accent-slate-100"
            />
            <div className="flex-1">
              <span className="block text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
                Shuffle Questions
              </span>
              <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Randomizes the sequence of questions using the Fisher-Yates algorithm.
              </span>
            </div>
          </label>

          {/* Toggle 2: Shuffle Options */}
          <label className="flex items-start gap-3.5 p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850/50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={shuffleOptions}
              onChange={(e) => setShuffleOptions(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-slate-900 dark:text-slate-100 focus:ring-slate-900 dark:focus:ring-slate-100 border-slate-300 dark:border-slate-700 accent-slate-900 dark:accent-slate-100"
            />
            <div className="flex-1">
              <span className="block text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
                Shuffle MCQ Options
              </span>
              <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Randomizes option choices (A, B, C, D) for multiple choice questions.
              </span>
            </div>
          </label>
        </div>

        {/* Launch CTA & Session Summary */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Session ready:{' '}
            <strong className="text-slate-800 dark:text-slate-200 font-mono">
              {selectedCount}
            </strong>{' '}
            questions ({validFrom} to {validTo})
          </div>

          <button
            type="submit"
            disabled={selectedCount <= 0}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-medium text-sm hover:bg-slate-800 dark:hover:bg-white active:scale-[0.99] transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Practice ({selectedCount})</span>
          </button>
        </div>
      </form>
    </div>
  );
}
