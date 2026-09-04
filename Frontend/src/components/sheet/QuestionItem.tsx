
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

export const QuestionItem = ({
  question,
  index,
}: QuestionItemProps) => {
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
      className="
        group w-full
        bg-white dark:bg-slate-900
        border-b border-slate-100 dark:border-slate-800/80
        hover:bg-orange-50/30 dark:hover:bg-slate-800/50
        transition-colors
        px-3 py-3
        sm:px-3.5 sm:py-2.5
      "
    >
      <div className="flex w-full min-w-0 flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">

        {/* Question */}
        <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:items-center">
          {/* Drag Handle */}
          <div className="shrink-0 pt-0.5 sm:pt-0">
            <DragHandle
              {...attributes}
              {...listeners}
              label={`Drag ${question.title}`}
            />
          </div>

          {/* Index */}
          <span
            className="
              w-5 shrink-0 pt-0.5
              text-left sm:text-right
              text-[11px] font-mono
              text-slate-400 dark:text-slate-500
              sm:pt-0
            "
          >
            {index + 1}.
          </span>

          {/* Title */}
          <div className="min-w-0 flex-1">
            <h4
              className="
                text-sm font-semibold
                leading-snug
                text-slate-800 dark:text-slate-200
                break-words
                sm:truncate
              "
              title={question.title}
            >
              {question.title}
            </h4>
          </div>
        </div>

        {/* Meta + Actions */}
        <div
          className="
            flex w-full min-w-0
            items-center justify-between
            gap-2
            border-t border-slate-100/70
            pt-2
            dark:border-slate-800/70
            sm:w-auto
            sm:shrink-0
            sm:justify-end
            sm:border-0
            sm:pt-0
          "
        >
          {/* Badges */}
          <div className="flex min-w-0 shrink-0 items-center gap-1.5">
            <DifficultyBadge difficulty={question.difficulty} />
            <PlatformBadge platform={question.platform} />
          </div>

          {/* Actions */}
          <div
            className="
              flex shrink-0 items-center
              gap-0.5
              rounded-lg
              bg-slate-50
              p-0.5
              dark:bg-slate-800/60
              sm:gap-1
              sm:bg-transparent
              sm:p-0
              sm:dark:bg-transparent
            "
          >
            {/* Problem Link */}
            {question.problemUrl && (
              <a
                href={question.problemUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open Problem Link"
                aria-label={`Open external link for ${question.title}`}
                className="
                  inline-flex shrink-0 items-center justify-center
                  rounded-md p-1.5
                  text-slate-500 dark:text-slate-300
                  transition-colors
                  hover:bg-orange-500/10
                  hover:text-orange-600
                  dark:hover:text-orange-400
                "
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}

            {/* Video */}
            {question.resource && (
              <a
                href={question.resource}
                target="_blank"
                rel="noopener noreferrer"
                title="Watch Solution Tutorial"
                aria-label={`Watch tutorial for ${question.title}`}
                className="
                  inline-flex shrink-0 items-center justify-center
                  rounded-md p-1.5
                  text-slate-500 dark:text-slate-300
                  transition-colors
                  hover:bg-rose-500/10
                  hover:text-rose-600
                  dark:hover:text-rose-400
                "
              >
                <Video className="h-3.5 w-3.5" />
              </a>
            )}

            {/* Edit */}
            <button
              type="button"
              onClick={() =>
                openModal("edit-question", { question })
              }
              title="Edit Question"
              aria-label={`Edit ${question.title}`}
              className="
                inline-flex shrink-0 items-center justify-center
                rounded-md p-1.5
                text-slate-400
                transition-colors
                hover:bg-orange-500/10
                hover:text-orange-600
                dark:hover:text-orange-400
              "
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() =>
                openModal("delete-question", { question })
              }
              title="Delete Question"
              aria-label={`Delete ${question.title}`}
              className="
                inline-flex shrink-0 items-center justify-center
                rounded-md p-1.5
                text-slate-400
                transition-colors
                hover:bg-rose-500/10
                hover:text-rose-600
                dark:hover:text-rose-400
              "
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};