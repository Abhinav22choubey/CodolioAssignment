import { Layers, HelpCircle, CheckCircle, TrendingUp } from "lucide-react";

interface SheetStatsProps {
  totalTopics: number;
  totalQuestions: number;
  solvedQuestions: number;
}

export const SheetStats = ({
  totalTopics,
  totalQuestions,
  solvedQuestions,
}: SheetStatsProps) => {
  const percentage =
    totalQuestions > 0 ? Math.round((solvedQuestions / totalQuestions) * 100) : 0;
  const remaining = Math.max(0, totalQuestions - solvedQuestions);

  const stats = [
    {
      label: "Topics",
      value: totalTopics,
      subtext: "Categorized DSA areas",
      icon: <Layers className="w-5 h-5 text-indigo-500" />,
      bg: "bg-indigo-500/10 dark:bg-indigo-500/15",
    },
    {
      label: "Questions",
      value: totalQuestions,
      subtext: `${remaining} remaining to solve`,
      icon: <HelpCircle className="w-5 h-5 text-blue-500" />,
      bg: "bg-blue-500/10 dark:bg-blue-500/15",
    },
    {
      label: "Solved",
      value: solvedQuestions,
      subtext: `${totalQuestions > 0 ? ((solvedQuestions / totalQuestions) * 100).toFixed(1) : 0}% completion`,
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
      bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    },
    {
      label: "Overall Progress",
      value: `${percentage}%`,
      subtext: `${solvedQuestions} of ${totalQuestions} completed`,
      icon: <TrendingUp className="w-5 h-5 text-amber-500" />,
      bg: "bg-amber-500/10 dark:bg-amber-500/15",
      isProgress: true,
    },
  ];

  return (
    <div className="my-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {stat.label}
              </span>
              <div className={`p-2 rounded-lg ${stat.bg}`}>{stat.icon}</div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {stat.value}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {stat.subtext}
              </div>
            </div>

            {stat.isProgress && (
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

