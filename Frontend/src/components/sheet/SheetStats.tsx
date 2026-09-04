import { Layers, FolderTree, HelpCircle, BarChart3 } from "lucide-react";

interface SheetStatsProps {
  totalTopics: number;
  totalSubTopics: number;
  totalQuestions: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
}

export const SheetStats = ({
  totalTopics,
  totalSubTopics,
  totalQuestions,
  easyCount,
  mediumCount,
  hardCount,
}: SheetStatsProps) => {
  const easyPct = totalQuestions > 0 ? Math.round((easyCount / totalQuestions) * 100) : 0;
  const medPct = totalQuestions > 0 ? Math.round((mediumCount / totalQuestions) * 100) : 0;
  const hardPct = totalQuestions > 0 ? Math.round((hardCount / totalQuestions) * 100) : 0;

  const stats = [
    {
      label: "Topics",
      value: totalTopics,
      subtext: "Categorized DSA Domains",
      icon: <Layers className="w-5 h-5 text-orange-500" />,
      bg: "bg-orange-500/10 dark:bg-orange-500/15",
    },
    {
      label: "Sub-Topics",
      value: totalSubTopics,
      subtext: "Pattern and Concept Sub-groups",
      icon: <FolderTree className="w-5 h-5 text-amber-500" />,
      bg: "bg-amber-500/10 dark:bg-amber-500/15",
    },
    {
      label: "Total Questions",
      value: totalQuestions,
      subtext: "Curated Practice Problems",
      icon: <HelpCircle className="w-5 h-5 text-blue-500" />,
      bg: "bg-blue-500/10 dark:bg-blue-500/15",
    },
    {
      label: "Difficulty Mix",
      value: `${easyCount}E · ${mediumCount}M · ${hardCount}H`,
      subtext: `${easyPct}% Easy · ${medPct}% Med · ${hardPct}% Hard`,
      icon: <BarChart3 className="w-5 h-5 text-emerald-500" />,
      bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
      isDistribution: true,
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
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {stat.value}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {stat.subtext}
              </div>
            </div>

            {stat.isDistribution && totalQuestions > 0 && (
              <div className="flex w-full h-1.5 rounded-full overflow-hidden mt-3 gap-0.5 bg-slate-100 dark:bg-slate-800">
                <div
                  style={{ width: `${easyPct}%` }}
                  className="bg-emerald-500 h-full rounded-l-full"
                  title={`Easy: ${easyCount} (${easyPct}%)`}
                />
                <div
                  style={{ width: `${medPct}%` }}
                  className="bg-amber-500 h-full"
                  title={`Medium: ${mediumCount} (${medPct}%)`}
                />
                <div
                  style={{ width: `${hardPct}%` }}
                  className="bg-rose-500 h-full rounded-r-full"
                  title={`Hard: ${hardCount} (${hardPct}%)`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
