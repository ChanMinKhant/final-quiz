import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SubjectSelect from './components/SubjectSelect';
import QuizConfig from './components/QuizConfig';
import QuizPlay from './components/QuizPlay';
import QuizSummary from './components/QuizSummary';
import { quizData } from './data/quizData';
import { shuffleArray } from './utils/shuffle';

export default function App() {
  // Theme state: dark / light
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('quizlab_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Step state: 'select' | 'config' | 'play' | 'summary'
  const [currentStep, setCurrentStep] = useState('select');
  const [selectedSubjectKey, setSelectedSubjectKey] = useState(null);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [quizResults, setQuizResults] = useState([]);

  // Saved Stats state from localStorage
  const [savedStats, setSavedStats] = useState(() => {
    try {
      const stored = localStorage.getItem('quizlab_stats');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Handle Theme switching
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('quizlab_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('quizlab_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Helper to prepare questions based on config
  const buildQuestionsPool = (subjectKey, config) => {
    const subject = quizData[subjectKey];
    if (!subject) return [];

    const { fromQuestion, toQuestion, shuffleQuestions, shuffleOptions } = config;

    // Slice questions within selected range (1-indexed to 0-indexed)
    let pool = subject.questions.slice(fromQuestion - 1, toQuestion);

    // Deep copy options so we don't mutate original dataset
    pool = pool.map((q) => ({
      ...q,
      options: q.options ? [...q.options] : undefined
    }));

    // Shuffle questions if requested
    if (shuffleQuestions) {
      pool = shuffleArray(pool);
    }

    // Shuffle options for MCQ questions if requested
    if (shuffleOptions) {
      pool = pool.map((q) => {
        if (q.type === 'mcq' && q.options) {
          return {
            ...q,
            options: shuffleArray(q.options)
          };
        }
        return q;
      });
    }

    return pool;
  };

  // Step 1: Select Subject
  const handleSelectSubject = (key) => {
    setSelectedSubjectKey(key);
    setCurrentStep('config');
  };

  // Step 2: Start Practice
  const handleStartPractice = (config) => {
    setCurrentConfig(config);
    const questions = buildQuestionsPool(selectedSubjectKey, config);
    setActiveQuestions(questions);
    setCurrentStep('play');
  };

  // Step 3: Finish Quiz
  const handleFinishQuiz = (results) => {
    setQuizResults(results);

    // Update LocalStorage stats
    if (selectedSubjectKey && results.length > 0) {
      const correct = results.filter((r) => r.isCorrect).length;
      const pct = Math.round((correct / results.length) * 100);

      const existing = savedStats[selectedSubjectKey] || {
        bestScore: 0,
        timesCompleted: 0
      };

      const updatedStats = {
        ...savedStats,
        [selectedSubjectKey]: {
          bestScore: Math.max(existing.bestScore, pct),
          lastScore: pct,
          timesCompleted: existing.timesCompleted + 1,
          lastPracticed: new Date().toISOString()
        }
      };

      setSavedStats(updatedStats);
      try {
        localStorage.setItem('quizlab_stats', JSON.stringify(updatedStats));
      } catch (e) {
        console.error('Failed to save quiz stats', e);
      }
    }

    setCurrentStep('summary');
  };

  // Quit during quiz
  const handleQuitQuiz = () => {
    setCurrentStep('config');
  };

  // Step 4: Restart with same settings
  const handleRestartSameSettings = () => {
    if (selectedSubjectKey && currentConfig) {
      const refreshedQuestions = buildQuestionsPool(selectedSubjectKey, currentConfig);
      setActiveQuestions(refreshedQuestions);
      setCurrentStep('play');
    }
  };

  // Adjust settings
  const handleAdjustSettings = () => {
    setCurrentStep('config');
  };

  // Return to subjects
  const handleReturnToSubjects = () => {
    setCurrentStep('select');
    setSelectedSubjectKey(null);
    setCurrentConfig(null);
    setActiveQuestions([]);
    setQuizResults([]);
  };

  const currentSubject = selectedSubjectKey ? quizData[selectedSubjectKey] : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        currentStep={currentStep}
        subjectTitle={currentSubject?.title}
        onHome={handleReturnToSubjects}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {currentStep === 'select' && (
          <SubjectSelect
            subjects={quizData}
            onSelectSubject={handleSelectSubject}
            savedStats={savedStats}
          />
        )}

        {currentStep === 'config' && currentSubject && (
          <QuizConfig
            subjectKey={selectedSubjectKey}
            subject={currentSubject}
            onBack={handleReturnToSubjects}
            onStartPractice={handleStartPractice}
          />
        )}

        {currentStep === 'play' && currentSubject && activeQuestions.length > 0 && (
          <QuizPlay
            subjectTitle={currentSubject.title}
            questions={activeQuestions}
            onFinishQuiz={handleFinishQuiz}
            onQuitQuiz={handleQuitQuiz}
          />
        )}

        {currentStep === 'summary' && currentSubject && (
          <QuizSummary
            subjectTitle={currentSubject.title}
            results={quizResults}
            onRestartSameSettings={handleRestartSameSettings}
            onAdjustSettings={handleAdjustSettings}
            onReturnToSubjects={handleReturnToSubjects}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>QuizLab Minimalist Practice Web Application</span>
          <span className="font-mono">React + Vite + Tailwind CSS</span>
        </div>
      </footer>
    </div>
  );
}
