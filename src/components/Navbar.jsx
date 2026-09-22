import React from 'react';
import { Layers, Moon, Sun, RotateCcw } from 'lucide-react';

export default function Navbar({ currentStep, subjectTitle, onHome, isDark, onToggleTheme }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={onHome}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-slate-100 dark:text-slate-900 shadow-sm transition-transform group-hover:scale-105">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 text-sm">
              QuizLab
            </span>
            <span className="ml-1.5 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              v1.0
            </span>
          </div>
        </div>

        {/* Center Breadcrumb */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <span className={currentStep === 'select' ? 'font-medium text-slate-900 dark:text-slate-100' : ''}>
            Subjects
          </span>
          {subjectTitle && (
            <>
              <span>/</span>
              <span className="max-w-[200px] truncate font-medium text-slate-800 dark:text-slate-200">
                {subjectTitle}
              </span>
            </>
          )}
          {currentStep === 'play' && (
            <>
              <span>/</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Live
              </span>
            </>
          )}
          {currentStep === 'summary' && (
            <>
              <span>/</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Summary
              </span>
            </>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {currentStep !== 'select' && currentStep !== 'play' && (
            <button
              onClick={onHome}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 px-2.5 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Return to Subjects"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Subjects</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
