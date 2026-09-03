import { useState } from "react";
import {
  Code2,
  Moon,
  Sun,
  Search,
  CheckCircle2,
  BookMarked,
} from "lucide-react";
import { useUIStore } from "../../store/uiStore";

interface HeaderProps {
  totalQuestions: number;
  solvedCount: number;
  onSearchFocus: () => void;
}

export const Header = ({
  totalQuestions,
  solvedCount,
  onSearchFocus,
}: HeaderProps) => {
  const { isDarkMode, toggleDarkMode } = useUIStore();
  const [isMac] = useState(
    () => typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0
  );

  const progressPercent =
    totalQuestions > 0 ? Math.round((solvedCount / totalQuestions) * 100) : 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Sheet Name */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20">
            <Code2 className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white tracking-tight text-base sm:text-lg">
                Codolio<span className="text-indigo-600 dark:text-indigo-400">Sheet</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <BookMarked className="w-3 h-3" />
                SDE Sheet
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Interactive Question Management Tracker
            </p>
          </div>
        </div>

        {/* Global Search Shortcut Trigger (Center on desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <button
            type="button"
            onClick={onSearchFocus}
            className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-slate-300 dark:hover:border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Search topics, subtopics, questions...</span>
            </span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-xs">
              {isMac ? "⌘" : "Ctrl"} K
            </kbd>
          </button>
        </div>

        {/* Right side: Stats pill + Theme Toggle */}
        <div className="flex items-center gap-3">
          {/* Progress pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              {solvedCount} / {totalQuestions}{" "}
              <span className="hidden sm:inline">({progressPercent}%)</span>
            </span>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600 transition-transform rotate-0 hover:-rotate-12" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

