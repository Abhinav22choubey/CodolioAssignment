import { useState } from "react";
import {
  Code2,
  Moon,
  Sun,
  Search,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import { useUIStore } from "../../store/uiStore";

interface HeaderProps {
  totalQuestions: number;
  totalTopics: number;
  onSearchFocus: () => void;
}

export const Header = ({
  totalQuestions,
  totalTopics,
  onSearchFocus,
}: HeaderProps) => {
  const { isDarkMode, toggleDarkMode } = useUIStore();
  const [isMac] = useState(
    () => typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Sheet Name */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25">
            <Code2 className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white tracking-tight text-base sm:text-lg">
                Codolio<span className="text-orange-500 font-extrabold">Sheet</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Interactive DSA Sheet and Curriculum Manager
            </p>
          </div>
        </div>

        {/* Right side: Questions count badge + Theme Toggle */}
        <div className="flex items-center gap-3">
          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-700 dark:text-orange-400 text-xs font-semibold">
            <HelpCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span>
              {totalQuestions} Questions <span className="hidden sm:inline">({totalTopics} Topics)</span>
            </span>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
