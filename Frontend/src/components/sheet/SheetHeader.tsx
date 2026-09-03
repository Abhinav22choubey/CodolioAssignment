import { Plus, Sparkles } from "lucide-react";
import { useUIStore } from "../../store/uiStore";

export const SheetHeader = () => {
  const { openModal } = useUIStore();

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-6 border-b border-slate-200 dark:border-slate-800">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Striver's SDE Sheet
          </h1>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3 h-3" />
            Most Popular
          </span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Practice and master your Data Structures & Algorithms coding questions.
          Organize hierarchical topics, track your solved problems, and reorder items seamlessly.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={() => openModal("create-topic")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Topic</span>
        </button>
      </div>
    </div>
  );
};

