import { useEffect, useRef, type RefObject } from "react";
import {
  Search,
  X,
  ChevronsDown,
  ChevronsUp,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import {
  useUIStore,
  type DifficultyFilter,
} from "../../store/uiStore";
import type { Topic } from "../../types/sheet";

interface SheetFilterBarProps {
  topics: Topic[];
  searchRef: RefObject<HTMLInputElement | null>;
  availablePlatforms: string[];
}

export const SheetFilterBar = ({
  topics,
  searchRef,
  availablePlatforms,
}: SheetFilterBarProps) => {
  const {
    searchQuery,
    difficultyFilter,
    platformFilter,
    setSearchQuery,
    setDifficultyFilter,
    setPlatformFilter,
    resetFilters,
    expandAll,
    collapseAll,
  } = useUIStore();

  const internalRef = useRef<HTMLInputElement>(null);
  const activeInputRef = searchRef || internalRef;

  // Keyboard shortcut Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        activeInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeInputRef]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    difficultyFilter !== "ALL" ||
    platformFilter !== "ALL";

  return (
    <div className="mb-6 space-y-3 bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
      {/* Top row: Search input + Platform dropdown + Expand/Collapse */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            ref={activeInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics, subtopics, questions, difficulty, platform... (Ctrl + K)"
            className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Platform filter select */}
        {availablePlatforms.length > 0 && (
          <div className="shrink-0">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              aria-label="Filter by platform"
              className="w-full sm:w-auto px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="ALL">All Platforms</option>
              {availablePlatforms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Expand / Collapse All buttons */}
        <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => expandAll(topics)}
            title="Expand All Topics and Sub-topics"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronsDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Expand All</span>
          </button>
          <button
            type="button"
            onClick={collapseAll}
            title="Collapse All Topics and Sub-topics"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronsUp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Collapse All</span>
          </button>
        </div>
      </div>

      {/* Bottom row: Filter chips (Difficulty) + Reset button */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Difficulty:
          </span>

          {/* Difficulty filter chips */}
          <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
            {(["ALL", "Easy", "Medium", "Hard"] as DifficultyFilter[]).map((diff) => {
              const isActive = difficultyFilter === diff;
              return (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficultyFilter(diff)}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    isActive
                      ? diff === "Easy"
                        ? "bg-emerald-500 text-white shadow-xs"
                        : diff === "Medium"
                        ? "bg-amber-500 text-white shadow-xs"
                        : diff === "Hard"
                        ? "bg-rose-500 text-white shadow-xs"
                        : "bg-orange-500 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {diff === "ALL" ? "All Levels" : diff}
                </button>
              );
            })}
          </div>
        </div>

        {/* Reset Filters button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset all filters
          </button>
        )}
      </div>
    </div>
  );
};
