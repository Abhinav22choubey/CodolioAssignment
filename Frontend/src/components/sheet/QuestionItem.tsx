import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ExternalLink,
  Video,
  Pencil,
  Trash2,
  Check,
} from "lucide-react";
import type { Question } from "../../types/sheet";
import { DifficultyBadge } from "../common/DifficultyBadge";
import { PlatformBadge } from "../common/PlatformBadge";
import { DragHandle } from "../common/DragHandle";
import { useUIStore } from "../../store/uiStore";

interface QuestionItemProps {
  question: Question;
  index: number;
}

export const QuestionItem = ({ question, index }: QuestionItemProps) => {
  const { isQuestionSolved, toggleQuestionSolved, openModal } = useUIStore();
  const isSolved = isQuestionSolved(question.id);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 20 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center justify-between gap-3 px-3.5 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
        isSolved ? "bg-slate-50/50 dark:bg-slate-900/40" : ""
      }`}
    >
      {/* Left side: Drag handle + Index + Solved Checkbox + Title */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Drag Handle */}
        <DragHandle {...attributes} {...listeners} label={`Drag ${question.title}`} />

        {/* Question Sequence Index */}
        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 w-5 text-right shrink-0">
          {index + 1}.
        </span>

        {/* Solved Checkbox */}
        <button
          type="button"
          onClick={() => toggleQuestionSolved(question.id)}
          aria-label={isSolved ? `Mark "${question.title}" as unsolved` : `Mark "${question.title}" as solved`}
          className={`flex items-center justify-center w-5 h-5 rounded border transition-all shrink-0 cursor-pointer ${
            isSolved
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-500"
          }`}
        >
          {isSolved && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Question Title */}
        <div className="min-w-0 flex-1 flex items-baseline gap-2">
          <span
            className={`text-sm font-medium tracking-tight truncate ${
              isSolved
                ? "text-slate-400 dark:text-slate-500 line-through decoration-slate-300 dark:decoration-slate-600"
                : "text-slate-800 dark:text-slate-200"
            }`}
            title={question.title}
          >
            {question.title}
          </span>
        </div>
      </div>

      {/* Right side: Difficulty + Platform + Links + Context Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Difficulty Badge */}
        <DifficultyBadge difficulty={question.difficulty} />

        {/* Platform Badge (Hidden on smallest screens) */}
        <div className="hidden sm:block">
          <PlatformBadge platform={question.platform} />
        </div>

        {/* Problem external link */}
        {question.problemUrl && (
          <a
            href={question.problemUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open Problem in new tab"
            className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}

        {/* Video / Resource link */}
        {question.resource && (
          <a
            href={question.resource}
            target="_blank"
            rel="noopener noreferrer"
            title="Watch Solution / Tutorial"
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Video className="w-3.5 h-3.5" />
          </a>
        )}

        {/* Quick action buttons (Edit & Delete) */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity ml-1">
          <button
            type="button"
            onClick={() => openModal("edit-question", { question })}
            title="Edit question"
            aria-label={`Edit ${question.title}`}
            className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => openModal("delete-question", { question })}
            title="Delete question"
            aria-label={`Delete ${question.title}`}
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

