import type { ReactNode } from "react";
import { FolderPlus, Search, HelpCircle } from "lucide-react";

interface EmptyStateProps {
  type?: "topics" | "subtopics" | "questions" | "search";
  title?: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({
  type = "topics",
  title,
  description,
  action,
}: EmptyStateProps) => {
  const defaults = {
    topics: {
      icon: <FolderPlus className="w-10 h-10 text-orange-500/80" />,
      title: "No topics yet",
      description: "Create your first topic to start building your interactive question sheet.",
    },
    subtopics: {
      icon: <FolderPlus className="w-8 h-8 text-slate-400" />,
      title: "No sub-topics yet",
      description: "Add a sub-topic to organize your practice questions under this category.",
    },
    questions: {
      icon: <HelpCircle className="w-7 h-7 text-slate-400" />,
      title: "No questions added",
      description: "Add your first coding problem to this sub-topic to begin tracking.",
    },
    search: {
      icon: <Search className="w-10 h-10 text-slate-400" />,
      title: "No matching questions or topics",
      description: "Try adjusting your search query or reset your difficulty and status filters.",
    },
  }[type];

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
      <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 mb-3 shadow-inner">
        {defaults.icon}
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
        {title || defaults.title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-4">
        {description || defaults.description}
      </p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};

