import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Flame, 
  CornerDownLeft, 
  LogOut, 
  Check, 
  AlertCircle
} from 'lucide-react';
import { evaluateAnswer, countBlanks, formatCorrectAnswer, normalizeText } from '../utils/quizEvaluator';

export default function QuizPlay({
  subjectTitle,
  questions,
  onFinishQuiz,
  onQuitQuiz
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]); // Array of { questionId, userAnswer, isCorrect, correctAnswer }
  const [currentInput, setCurrentInput] = useState('');
  const [committed, setCommitted] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const inputRef = useRef(null);
  const currentQuestion = questions[currentIndex];
  const total = questions.length;
  const progressPercent = Math.round(((currentIndex + (committed ? 1 : 0)) / total) * 100);

  // Live Score stats
  const correctCount = userAnswers.filter((a) => a.isCorrect).length + (committed && currentResult?.isCorrect ? 1 : 0);
  const answeredCount = userAnswers.length + (committed ? 1 : 0);
  const currentAccuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  // Calculate current streak
  let currentStreak = 0;
  for (let i = userAnswers.length - 1; i >= 0; i--) {
    if (userAnswers[i].isCorrect) {
      currentStreak++;
    } else {
      break;
    }
  }
  if (committed && currentResult?.isCorrect) {
    currentStreak++;
  }

  // Auto-focus input for fill_blank on question change without setState
  useEffect(() => {
    if (currentQuestion?.type === 'fill_blank' && !committed) {
      inputRef.current?.focus();
    }
  }, [currentIndex, currentQuestion, committed]);

  // Submit Answer
  const handleCommitAnswer = useCallback((answerValue) => {
    if (committed || !currentQuestion) return;

    const evaluation = evaluateAnswer(answerValue, currentQuestion);
    setCommitted(true);
    setCurrentResult({
      userAnswer: answerValue,
      isCorrect: evaluation.isCorrect,
      correctAnswer: currentQuestion.answer,
      displayAnswer: evaluation.displayAnswer,
      allAnswers: evaluation.allAnswers
    });
  }, [committed, currentQuestion]);

  // Next Question or Finish
  const handleNext = useCallback(() => {
    if (!committed || !currentResult) return;

    const recorded = [
      ...userAnswers,
      {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        type: currentQuestion.type,
        options: currentQuestion.options,
        userAnswer: currentResult.userAnswer,
        isCorrect: currentResult.isCorrect,
        correctAnswer: currentResult.correctAnswer
      }
    ];

    setUserAnswers(recorded);
    setCurrentInput('');
    setCommitted(false);
    setCurrentResult(null);

    if (currentIndex + 1 < total) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onFinishQuiz(recorded);
    }
  }, [committed, currentResult, userAnswers, currentQuestion, currentIndex, total, onFinishQuiz]);

  // Keyboard Navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // If modal is open, don't trigger quiz keys
      if (showExitConfirm) return;

      // When answer is committed, Enter or Space advances
      if (committed) {
        if (e.key === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          handleNext();
        }
        return;
      }

      // If Fill in Blank, Enter commits
      if (currentQuestion?.type === 'fill_blank') {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (currentInput.trim().length > 0) {
            handleCommitAnswer(currentInput);
          }
        }
        return;
      }

      // If MCQ: support 1-4 or A-D
      if (currentQuestion?.type === 'mcq' && currentQuestion?.options) {
        const key = e.key.toUpperCase();
        const num = parseInt(e.key, 10);
        let selectedOption = null;

        if (num >= 1 && num <= currentQuestion.options.length) {
          selectedOption = currentQuestion.options[num - 1];
        } else if (['A', 'B', 'C', 'D'].includes(key)) {
          const idx = key.charCodeAt(0) - 65;
          if (idx < currentQuestion.options.length) {
            selectedOption = currentQuestion.options[idx];
          }
        }

        if (selectedOption !== null) {
          e.preventDefault();
          handleCommitAnswer(selectedOption);
        }
        return;
      }

      // If True/False: support T/F or 1/2
      if (currentQuestion?.type === 'true_false') {
        const key = e.key.toLowerCase();
        if (key === 't' || key === '1') {
          e.preventDefault();
          handleCommitAnswer('True');
        } else if (key === 'f' || key === '2') {
          e.preventDefault();
          handleCommitAnswer('False');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [committed, currentQuestion, currentInput, showExitConfirm, handleCommitAnswer, handleNext]);

  const blanksCount = countBlanks(currentQuestion?.question);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Top Meta Bar */}
      <div className="mb-6 space-y-3">
        {/* Header line: Subject title, Question counter, Running score, streak & quit */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[150px] sm:max-w-xs">
              {subjectTitle}
            </span>
            <span>•</span>
            <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
              {currentIndex + 1} / {total}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Streak */}
            {currentStreak > 1 && (
              <div className="inline-flex items-center gap-1 font-mono text-amber-600 dark:text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{currentStreak}</span>
              </div>
            )}

            {/* Live Score */}
            <div className="inline-flex items-center gap-1.5 font-mono">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {correctCount}
              </span>
              <span>/</span>
              <span>{answeredCount}</span>
              {answeredCount > 0 && (
                <span className="text-slate-400 dark:text-slate-500">
                  ({currentAccuracy}%)
                </span>
              )}
            </div>

            {/* Quit Practice Button */}
            <button
              onClick={() => setShowExitConfirm(true)}
              className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors ml-1"
              title="Quit session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-slate-900 dark:bg-slate-100 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Question Type Pill */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium tracking-wide uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {currentQuestion.type === 'mcq' && 'Multiple Choice'}
            {currentQuestion.type === 'true_false' && 'True / False'}
            {currentQuestion.type === 'fill_blank' && 'Fill in the Blank'}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono bold">
            Q #{currentQuestion.id}
          </span>
        </div>

        {/* Question Prompt */}
        <div className="text-lg sm:text-xl font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
          {currentQuestion.question}
        </div>

        {/* Question Interactive Area */}
        <div className="pt-2">
          {/* FORMAT 1: MCQ */}
          {currentQuestion.type === 'mcq' && (
            <div className="grid grid-cols-1 gap-2.5">
              {currentQuestion.options.map((option, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelected = currentResult?.userAnswer === option;
                const isCorrectOption = Array.isArray(currentQuestion.answer)
                  ? currentQuestion.answer.some((a) => a.toLowerCase() === option.toLowerCase())
                  : option.toLowerCase() === String(currentQuestion.answer).toLowerCase();

                let cardStyle =
                  'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-600';

                if (committed) {
                  if (isSelected && currentResult.isCorrect) {
                    // Correct Choice
                    cardStyle =
                      'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-medium ring-1 ring-emerald-500/50';
                  } else if (isSelected && !currentResult.isCorrect) {
                    // Incorrect Choice
                    cardStyle =
                      'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 ring-1 ring-rose-500/50';
                  } else if (!isSelected && isCorrectOption) {
                    // Revealed Correct Choice
                    cardStyle =
                      'border-emerald-500/70 bg-emerald-50/40 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 font-medium';
                  } else {
                    // Other options
                    cardStyle = 'border-slate-200/50 dark:border-slate-800/40 opacity-40 text-slate-400';
                  }
                }

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={committed}
                    onClick={() => handleCommitAnswer(option)}
                    className={`relative w-full text-left p-4 rounded-lg border transition-all duration-150 flex items-center justify-between group ${cardStyle} ${
                      committed ? 'cursor-default' : 'cursor-pointer active:scale-[0.995]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono font-medium border transition-colors ${
                          committed && isSelected && currentResult.isCorrect
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : committed && isSelected && !currentResult.isCorrect
                            ? 'bg-rose-600 text-white border-rose-600'
                            : committed && isCorrectOption
                            ? 'bg-emerald-600/80 text-white border-emerald-600'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 group-hover:border-slate-400'
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="text-sm sm:text-base">{option}</span>
                    </div>

                    {/* Feedback Icons */}
                    {committed && (
                      <div className="flex items-center">
                        {isSelected && currentResult.isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        )}
                        {isSelected && !currentResult.isCorrect && (
                          <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                        )}
                        {!isSelected && isCorrectOption && (
                          <div className="flex items-center gap-1 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                            <span>Correct answer</span>
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* FORMAT 2: True / False */}
          {currentQuestion.type === 'true_false' && (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {['True', 'False'].map((option) => {
                const isSelected = currentResult?.userAnswer === option;
                const isCorrectOption = Array.isArray(currentQuestion.answer)
                  ? currentQuestion.answer.some((a) => a.toLowerCase() === option.toLowerCase())
                  : option.toLowerCase() === String(currentQuestion.answer).toLowerCase();

                let btnStyle =
                  'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-600';

                if (committed) {
                  if (isSelected && currentResult.isCorrect) {
                    btnStyle =
                      'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-medium ring-1 ring-emerald-500/50';
                  } else if (isSelected && !currentResult.isCorrect) {
                    btnStyle =
                      'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 ring-1 ring-rose-500/50';
                  } else if (!isSelected && isCorrectOption) {
                    btnStyle =
                      'border-emerald-500/70 bg-emerald-50/40 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 font-medium';
                  } else {
                    btnStyle = 'border-slate-200/50 dark:border-slate-800/40 opacity-40 text-slate-400';
                  }
                }

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={committed}
                    onClick={() => handleCommitAnswer(option)}
                    className={`py-4 px-5 rounded-lg border text-center font-medium transition-all duration-150 flex flex-col items-center justify-center gap-1.5 ${btnStyle} ${
                      committed ? 'cursor-default' : 'cursor-pointer active:scale-[0.99]'
                    }`}
                  >
                    <span className="text-base sm:text-lg">{option}</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      [{option[0]}]
                    </span>
                    {committed && isSelected && currentResult.isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-1" />
                    )}
                    {committed && isSelected && !currentResult.isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 mt-1" />
                    )}
                    {committed && !isSelected && isCorrectOption && (
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                        Correct Answer
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* FORMAT 3: Fill in the Blank */}
          {currentQuestion.type === 'fill_blank' && (
            <div className="space-y-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!committed && currentInput.trim()) {
                    handleCommitAnswer(currentInput);
                  }
                }}
                className="space-y-3"
              >
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    disabled={committed}
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder={
                      blanksCount > 1
                        ? `Enter ${blanksCount} answers separated by commas (e.g. word1, word2)...`
                        : 'Type your answer here...'
                    }
                    className={`w-full rounded-lg border px-4 py-3 text-sm sm:text-base font-medium transition-all focus:outline-none ${
                      committed
                        ? currentResult.isCorrect
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200'
                          : 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-950 dark:text-rose-200'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-slate-900 dark:focus:border-slate-100 focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100'
                    }`}
                  />
                  {!committed && (
                    <button
                      type="submit"
                      disabled={!currentInput.trim()}
                      className="absolute right-2 top-2 px-3 py-1.5 rounded-md bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium hover:bg-slate-800 dark:hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                    >
                      <span>Submit</span>
                      <CornerDownLeft className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Helper caption for multi-blank */}
                {!committed && blanksCount > 1 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      This question has <strong>{blanksCount} blanks</strong>. Separate each blank's answer with a comma.
                    </span>
                  </p>
                )}
              </form>
            </div>
          )}
        </div>

        {/* FEEDBACK REVEAL BLOCK */}
        {committed && currentResult && (
          <div
            className={`p-4 rounded-lg border transition-all duration-200 ${
              currentResult.isCorrect
                ? 'border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/30'
                : 'border-rose-500/40 bg-rose-50/60 dark:bg-rose-950/30'
            }`}
          >
            <div className="flex items-start gap-3">
              {currentResult.isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-semibold ${
                      currentResult.isCorrect
                        ? 'text-emerald-900 dark:text-emerald-200'
                        : 'text-rose-900 dark:text-rose-200'
                    }`}
                  >
                    {currentResult.isCorrect ? 'Correct!' : 'Incorrect'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Press [Enter ↵] to advance
                  </span>
                </div>

                {!currentResult.isCorrect && (
                  <div className="mt-2 pt-2 border-t border-rose-200/60 dark:border-rose-900/40 space-y-2 text-xs sm:text-sm">
                    <div className="text-slate-600 dark:text-slate-400">
                      Your answer:{' '}
                      <span className="line-through text-rose-600 dark:text-rose-400 font-mono">
                        {currentResult.userAnswer || '(blank)'}
                      </span>
                    </div>
                    <div className="text-slate-800 dark:text-slate-200 flex flex-wrap items-center gap-1.5">
                      <span className="font-medium">
                        {currentResult.allAnswers?.length > 1 ? 'Accepted answers:' : 'Correct answer:'}
                      </span>
                      {currentResult.allAnswers?.length > 1 ? (
                        currentResult.allAnswers.map((ans, idx) => (
                          <React.Fragment key={ans}>
                            {idx > 0 && <span className="text-slate-400 text-xs font-mono">or</span>}
                            <span className="font-semibold text-emerald-700 dark:text-emerald-300 font-mono px-2 py-0.5 rounded bg-emerald-100/70 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800">
                              {ans}
                            </span>
                          </React.Fragment>
                        ))
                      ) : (
                        <span className="font-semibold text-emerald-700 dark:text-emerald-300 font-mono px-2 py-0.5 rounded bg-emerald-100/70 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800">
                          {formatCorrectAnswer(currentResult.correctAnswer)}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {currentResult.isCorrect && currentResult.allAnswers?.length > 1 && (
                  <div className="mt-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300/90 flex flex-wrap items-center gap-1.5">
                    <span className="font-medium">Also accepted:</span>
                    {currentResult.allAnswers
                      .filter((ans) => normalizeText(ans) !== normalizeText(currentResult.userAnswer))
                      .map((alt, idx) => (
                        <React.Fragment key={alt}>
                          {idx > 0 && <span className="text-emerald-500 font-mono">•</span>}
                          <span className="font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-100/60 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
                            {alt}
                          </span>
                        </React.Fragment>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* NEXT QUESTION / FINISH CTA */}
        {committed && (
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-medium text-sm hover:bg-slate-800 dark:hover:bg-white active:scale-[0.99] transition-all shadow-sm"
            >
              <span>{currentIndex + 1 < total ? 'Next Question' : 'View Results'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Hint Bar */}
      <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
        <div className="flex items-center gap-3">
          {currentQuestion.type === 'mcq' && <span>Keys [1-4] or [A-D]</span>}
          {currentQuestion.type === 'true_false' && <span>Keys [T] / [F]</span>}
          {currentQuestion.type === 'fill_blank' && <span>[Enter] to submit</span>}
          {committed && <span>[Enter] / [Space] next</span>}
        </div>
        <div>
          <span>Esc to exit</span>
        </div>
      </div>

      {/* Confirmation Modal for Quitting */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Quit Practice Session?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Are you sure you want to exit? Your progress for the current session will be lost.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Continue Quiz
              </button>
              <button
                type="button"
                onClick={onQuitQuiz}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white"
              >
                Quit Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
