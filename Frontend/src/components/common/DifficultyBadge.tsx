interface DifficultyBadgeProps {
  difficulty?: string | null;
  size?: "sm" | "md";
}

export const DifficultyBadge = ({ difficulty, size = "sm" }: DifficultyBadgeProps) => {
  if (!difficulty) return null;

  const normalized = difficulty.trim().toLowerCase();
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs font-medium" : "px-2.5 py-1 text-xs font-semibold";

  if (normalized === "easy") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Easy
      </span>
    );
  }

  if (normalized === "medium") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Medium
      </span>
    );
  }

  if (normalized === "hard") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        Hard
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 ${sizeClasses}`}
    >
      {difficulty}
    </span>
  );
};

