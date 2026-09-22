import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  RotateCcw, 
  SlidersHorizontal, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatCorrectAnswer } from '../utils/quizEvaluator';

export default function QuizSummary({
  subjectTitle,
  results,
  onRestartSameSettings,
  onAdjustSettings,
  onReturnToSubjects
}) {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'incorrect' | 'correct'
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const totalQuestions = results.length;
  const correctCount = results.filter((r) => r.isCorrect).length;
  const incorrectCount = totalQuestions - correctCount;
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // Trigger celebration confetti for high scores
  useEffect(() => {
    if (percentage >= 80) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {
        // Fallback silently if canvas context is unavailable
      }
    }
  }, [percentage]);

  // Determine Mastery Badge & Message
  const getMasteryData = (pct) => {
    if (pct >= 90) {
      return {
        badge: 'Mastered',
        badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        message: 'Outstanding performance! You have demonstrated exceptional command over these concepts.'
      };
    }
    if (pct >= 75) {
      return {
        badge: 'Proficient',
        badgeColor: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
        message: 'Great job! You have a solid understanding with just a few minor gaps to polish.'
      };
    }
    if (pct >= 50) {
      return {
        badge: 'Developing',
        badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        message: 'Good foundation. Review your missed questions below and try another practice round.'
      };
    }
    return {
      badge: 'Needs Practice',
      badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      message: 'Keep going! Targeted practice and review will build your retention and mastery.'
    };
  };

  const mastery = getMasteryData(percentage);

  // Filtered list
  const filteredResults = results.filter((item) => {
    if (activeFilter === 'incorrect') return !item.isCorrect;
    if (activeFilter === 'correct') return item.isCorrect;
    return true;
  });

  const toggleExpand = (id) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Return to subjects link */}
      <button
        type="button"
        onClick={onReturnToSubjects}
        className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Subjects</span>
      </button>

      {/* Main Score Hero Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
              Practice Complete
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-50">
              {subjectTitle}
            </h1>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-mono border self-start sm:self-auto ${mastery.badgeColor}`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>{mastery.badge}</span>
          </span>
        </div>

        {/* Score Metric Display */}
        <div className="grid grid-cols-3 gap-3 pt-2 pb-2">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 text-center">
            <span className="block text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {percentage}%
            </span>
            <span className="block text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-wider">
              Accuracy
            </span>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 text-center">
            <span className="block text-2xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {correctCount}
            </span>
            <span className="block text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-wider">
              Correct
            </span>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 text-center">
            <span className="block text-2xl sm:text-3xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {incorrectCount}
            </span>
            <span className="block text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-wider">
              Incorrect
            </span>
          </div>
        </div>

        {/* Encouraging Feedback Text */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
          {mastery.message}
        </p>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={onRestartSameSettings}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-medium text-sm hover:bg-slate-800 dark:hover:bg-white active:scale-[0.99] transition-all shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart with Same Settings</span>
          </button>

          <button
            type="button"
            onClick={onAdjustSettings}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Adjust Settings</span>
          </button>
        </div>
      </div>

      {/* Detailed Question Review Section */}
      <div className="mt-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Review Questions ({results.length})
          </h2>

          {/* Filter Pills */}
          <div className="inline-flex items-center p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                activeFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
            >
              All ({totalQuestions})
            </button>
            <button
              onClick={() => setActiveFilter('incorrect')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                activeFilter === 'incorrect'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
            >
              Incorrect ({incorrectCount})
            </button>
            <button
              onClick={() => setActiveFilter('correct')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                activeFilter === 'correct'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
            >
              Correct ({correctCount})
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-3">
          {filteredResults.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              No questions in this filter category.
            </div>
          ) : (
            filteredResults.map((item, index) => {
              const isExpanded = expandedQuestions[item.questionId];

              return (
                <div
                  key={`${item.questionId}-${index}`}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 overflow-hidden transition-all"
                >
                  <div
                    onClick={() => toggleExpand(item.questionId)}
                    className="p-4 flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-850/40 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {item.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-1 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 mt-1 flex-shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-mono text-slate-400">
                            #{item.questionId}
                          </span>
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {item.type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">
                          {item.question}
                        </p>
                      </div>
                    </div>

                    <div className="text-slate-400 mt-1">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-medium w-24">Your Answer:</span>
                        <span
                          className={`font-mono font-medium ${
                            item.isCorrect
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-rose-700 dark:text-rose-400 line-through'
                          }`}
                        >
                          {item.userAnswer || '(blank)'}
                        </span>
                      </div>

                      {!item.isCorrect && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-slate-500 font-medium">
                            {Array.isArray(item.correctAnswer) && item.correctAnswer.length > 1
                              ? 'Accepted Answers:'
                              : 'Correct Answer:'}
                          </span>
                          {Array.isArray(item.correctAnswer) && item.correctAnswer.length > 1 ? (
                            item.correctAnswer.map((ans, idx) => (
                              <React.Fragment key={ans}>
                                {idx > 0 && <span className="text-slate-400 text-xs font-mono">or</span>}
                                <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded bg-emerald-100/60 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800">
                                  {ans}
                                </span>
                              </React.Fragment>
                            ))
                          ) : (
                            <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded bg-emerald-100/60 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800">
                              {formatCorrectAnswer(item.correctAnswer)}
                            </span>
                          )}
                        </div>
                      )}

                      {item.isCorrect && Array.isArray(item.correctAnswer) && item.correctAnswer.length > 1 && (
                        <div className="flex flex-wrap items-center gap-1.5 text-slate-500 text-[11px] pt-1">
                          <span>Other accepted forms:</span>
                          {item.correctAnswer
                            .filter((a) => a.toLowerCase().trim() !== String(item.userAnswer || '').toLowerCase().trim())
                            .map((alt, idx) => (
                              <React.Fragment key={alt}>
                                {idx > 0 && <span>•</span>}
                                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                                  {alt}
                                </span>
                              </React.Fragment>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
