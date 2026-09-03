export const StatsSkeleton = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 my-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse"
        >
          <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded mb-3" />
          <div className="h-7 w-14 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800/60 rounded" />
        </div>
      ))}
    </div>
  );
};

export const QuestionRowSkeleton = () => {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/80 animate-pulse">
      <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-800 shrink-0" />
      <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
      <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
      <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded ml-auto" />
      <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
      <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-800" />
    </div>
  );
};

export const SheetSkeleton = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((topicIdx) => (
        <div
          key={topicIdx}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden animate-pulse"
        >
          {/* Topic header skeleton */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="w-5 h-5 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
            </div>
            <div className="h-8 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>

          {/* Subtopic skeleton */}
          <div className="p-4 space-y-3">
            <div className="p-3 bg-slate-50/60 dark:bg-slate-950/40 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
                <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>

              {/* Questions skeleton */}
              <div className="rounded border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                <QuestionRowSkeleton />
                <QuestionRowSkeleton />
                <QuestionRowSkeleton />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

