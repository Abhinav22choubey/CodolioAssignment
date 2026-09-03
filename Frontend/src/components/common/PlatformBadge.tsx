interface PlatformBadgeProps {
  platform?: string | null;
}

export const PlatformBadge = ({ platform }: PlatformBadgeProps) => {
  if (!platform) return null;

  const normalized = platform.trim().toLowerCase();

  let colorClasses =
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";

  if (normalized.includes("leetcode")) {
    colorClasses =
      "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30";
  } else if (normalized.includes("gfg") || normalized.includes("geeks")) {
    colorClasses =
      "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30";
  } else if (normalized.includes("codestudio") || normalized.includes("naukri") || normalized.includes("ninja")) {
    colorClasses =
      "bg-orange-500/10 text-orange-700 border-orange-500/20 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30";
  } else if (normalized.includes("hackerrank")) {
    colorClasses =
      "bg-green-500/10 text-green-700 border-green-500/20 dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/30";
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border uppercase tracking-wider ${colorClasses}`}
    >
      {platform}
    </span>
  );
};

