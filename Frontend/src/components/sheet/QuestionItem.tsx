import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ExternalLink,
  Video,
  Pencil,
  Trash2,
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
  const { openModal } = useUIStore();

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
      className="group bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 hover:bg-orange-50/30 dark:hover:bg-slate-800/50 transition-colors p-3 sm:px-3.5 sm:py-2.5"
    >
      {/* Responsive layout: stacked on mobile, single flex row on desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
        {/* Left/Top section: Drag handle + Index + Title */}
        <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
          {/* Drag Handle */}
          <div className="pt-0.5 sm:pt-0 shrink-0">
            <DragHandle {...attributes} {...listeners} label={`Drag ${question.title}`} />
          </div>

          {/* Question Sequence Index */}
          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 w-5 text-left sm:text-right shrink-0 pt-0.5 sm:pt-0">
            {index + 1}.
          </span>

          {/* Question Title - Unhindered, clear, prominent */}
          <div className="min-w-0 flex-1">
            <h4
              className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug break-words sm:truncate"
              title={question.title}
            >
              {question.title}
            </h4>
          </div>
        </div>

        {/* Right/Bottom section: Badges + Action CTAs */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pl-7 sm:pl-0 pt-1 sm:pt-0 border-t border-slate-100/60 dark:border-slate-800/60 sm:border-0">
          {/* Badges: Difficulty & Platform */}
          <div className="flex items-center gap-1.5 shrink-0">
            <DifficultyBadge difficulty={question.difficulty} />
            <PlatformBadge platform={question.platform} />
          </div>

          {/* Action CTAs Toolbar */}
          <div className="flex items-center gap-1 shrink-0 bg-slate-50 dark:bg-slate-800/60 sm:bg-transparent sm:dark:bg-transparent p-1 sm:p-0 rounded-lg">
            {/* Problem external link CTA */}
            {question.problemUrl && (
              <a
                href={question.problemUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open Problem Link"
                aria-label={`Open external link for ${question.title}`}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/10 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden xs:inline sm:hidden">Link</span>
              </a>
            )}

            {/* Video / Resource tutorial CTA */}
            {question.resource && (
              <a
                href={question.resource}
                target="_blank"
                rel="noopener noreferrer"
                title="Watch Solution Tutorial"
                aria-label={`Watch tutorial for ${question.title}`}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <Video className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden xs:inline sm:hidden">Video</span>
              </a>
            )}

            {/* Edit Question CTA */}
            <button
              type="button"
              onClick={() => openModal("edit-question", { question })}
              title="Edit Question"
              aria-label={`Edit ${question.title}`}
              className="p-1.5 rounded-md text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/10 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

            {/* Delete Question CTA */}
            <button
              type="button"
              onClick={() => openModal("delete-question", { question })}
              title="Delete Question"
              aria-label={`Delete ${question.title}`}
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
