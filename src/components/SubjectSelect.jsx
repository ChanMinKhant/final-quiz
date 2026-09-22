import React from 'react';
import { ShieldCheck, BookOpen, GraduationCap, ArrowRight, Award, ListFilter } from 'lucide-react';

export default function SubjectSelect({ subjects, onSelectSubject, savedStats }) {
  const getSubjectIcon = (key) => {
    switch (key) {
      case 'cyber_security':
        return <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'english_negotiation':
        return <BookOpen className="w-5 h-5 text-sky-600 dark:text-sky-400" />;
      case 'english_grammar':
        return <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      default:
        return <ListFilter className="w-5 h-5 text-slate-600 dark:text-slate-400" />;
    }
  };

  const getQuestionTypeBadges = (questions) => {
    const types = new Set(questions.map((q) => q.type));
    const labels = [];
    if (types.has('mcq')) labels.push('MCQ');
    if (types.has('true_false')) labels.push('True/False');
    if (types.has('fill_blank')) labels.push('Fill in Blank');
    return labels;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 mb-3">
          <span>Practice & Benchmark Mode</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Select Practice Subject
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-xl">
          Choose a subject to configure your practice session with custom question limits, shuffling, and instant validation.
        </p>
      </div>

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {Object.entries(subjects).map(([subjectKey, subject]) => {
          const stats = savedStats?.[subjectKey];
          const questionTypes = getQuestionTypeBadges(subject.questions);

          return (
            <div
              key={subjectKey}
              onClick={() => onSelectSubject(subjectKey)}
              className="group relative flex flex-col justify-between p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-400 dark:hover:border-slate-700 hover:shadow-sm transition-all duration-200 cursor-pointer"
            >
              <div>
                {/* Top Row: Icon & Total Badge */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200/80 dark:border-slate-700/60">
                    {getSubjectIcon(subjectKey)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
                      {subject.questions.length} Questions
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {subject.title}
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {subject.description}
                </p>

                {/* Question Types Pills */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {questionTypes.map((type) => (
                    <span
                      key={type}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Meta & Action */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                {stats ? (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      Best: <strong className="font-semibold text-slate-800 dark:text-slate-200">{stats.bestScore}%</strong> ({stats.timesCompleted} {stats.timesCompleted === 1 ? 'try' : 'tries'})
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                    Not attempted yet
                  </span>
                )}

                <div className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:translate-x-0.5 transition-transform">
                  <span>Configure</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
