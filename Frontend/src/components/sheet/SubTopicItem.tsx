import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import type { SubTopic, Question, Topic } from "../../types/sheet";
import { DragHandle } from "../common/DragHandle";
import { QuestionItem } from "./QuestionItem";
import { EmptyState } from "../common/EmptyState";
import { useUIStore } from "../../store/uiStore";
import { useReorderQuestions } from "../../hooks/useQuestions";

function getErrorMessage(err: unknown, fallback: string): string {
  const axiosError = err as AxiosError<{ message?: string }>;
  return axiosError?.response?.data?.message || axiosError?.message || fallback;
}

interface SubTopicItemProps {
  subTopic: SubTopic;
  topicId: string;
  filteredQuestions?: Question[];
}

export const SubTopicItem = ({
  subTopic,
  topicId,
  filteredQuestions,
}: SubTopicItemProps) => {
  const {
    expandedSubTopics,
    toggleSubTopic,
    openModal,
    isQuestionSolved,
    searchQuery,
    difficultyFilter,
    solvedFilter,
    platformFilter,
  } = useUIStore();

  const queryClient = useQueryClient();
  const reorderQuestionsMutation = useReorderQuestions();

  const isFilterActive =
    searchQuery.trim() !== "" ||
    difficultyFilter !== "ALL" ||
    solvedFilter !== "ALL" ||
    platformFilter !== "ALL";

  const isExpanded = isFilterActive ? true : Boolean(expandedSubTopics[subTopic.id]);

  const allQuestions = subTopic.questions || [];
  const displayQuestions = filteredQuestions !== undefined ? filteredQuestions : allQuestions;

  // Sortable hook for this sub-topic row
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subTopic.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 20 : 1,
  };

  // Sensors for nested Question DndContext
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleQuestionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = displayQuestions.findIndex((q) => q.id === active.id);
    const newIndex = displayQuestions.findIndex((q) => q.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(displayQuestions, oldIndex, newIndex);
    const questionIds = newOrder.map((q) => q.id);

    // Optimistic update in React Query cache
    queryClient.setQueryData(["subtopics", subTopic.id, "questions"], newOrder);
    queryClient.setQueryData(["topics"], (oldTopics: Topic[] | undefined) => {
      if (!oldTopics) return oldTopics;
      return oldTopics.map((top) => {
        if (top.id !== topicId) return top;
        return {
          ...top,
          subTopics: (top.subTopics || []).map((sub) => {
            if (sub.id !== subTopic.id) return sub;
            return { ...sub, questions: newOrder };
          }),
        };
      });
    });

    reorderQuestionsMutation.mutate(
      {
        subTopicId: subTopic.id,
        questionIds,
      },
      {
        onSuccess: () => {
          toast.success("Questions reordered successfully");
        },
        onError: (err: unknown) => {
          toast.error(getErrorMessage(err, "Failed to save question order"));
          queryClient.invalidateQueries({ queryKey: ["topics"] });
        },
      }
    );
  };

  // Calculate solved stats for this subtopic
  const solvedCount = allQuestions.filter((q) => isQuestionSolved(q.id)).length;
  const totalCount = allQuestions.length;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="mb-2.5 rounded-lg border border-orange-100 dark:border-slate-800 bg-orange-50/40 dark:bg-slate-900/60 overflow-hidden shadow-2xs"
    >
      {/* Subtopic Header */}
      <div
        className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-orange-100/50 dark:bg-slate-800/60 border-b border-orange-100 dark:border-slate-800 transition-colors cursor-pointer"
        onClick={() => toggleSubTopic(subTopic.id)}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Drag Handle */}
          <DragHandle
            {...attributes}
            {...listeners}
            onClick={(event) => event.stopPropagation()}
            label={`Drag ${subTopic.title}`}
          />

          {/* Expand/Collapse Chevron Button */}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              toggleSubTopic(subTopic.id);
            }}
            aria-label={isExpanded ? `Collapse ${subTopic.title}` : `Expand ${subTopic.title}`}
            className="p-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-transform"
          >
            <ChevronRight
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? "rotate-90 text-indigo-600 dark:text-indigo-400" : ""
              }`}
            />
          </button>

          {/* Subtopic Title & Question Count */}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              toggleSubTopic(subTopic.id);
            }}
            className="flex items-center gap-2 text-left font-medium text-slate-800 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 text-sm truncate"
          >
            <FolderOpen className="w-4 h-4 text-orange-400 shrink-0" />
            <span className="truncate">{subTopic.title}</span>
          </button>

          {/* Solved Progress Pill */}
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
            {solvedCount}/{totalCount} solved
          </span>
        </div>

        {/* Actions for Sub-topic */}
        <div className="flex items-center gap-1.5 shrink-0" onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            onClick={() =>
              openModal("create-question", {
                subTopicId: subTopic.id,
                subTopic,
                topicId,
              })
            }
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Question</span>
          </button>

          <button
            type="button"
            onClick={() => openModal("edit-subtopic", { subTopic, topicId })}
            aria-label={`Edit ${subTopic.title}`}
            className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => openModal("delete-subtopic", { subTopic, topicId })}
            aria-label={`Delete ${subTopic.title}`}
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Questions Area */}
      {isExpanded && (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {displayQuestions.length === 0 ? (
            <div className="p-4 bg-white dark:bg-slate-900">
              <EmptyState
                type="questions"
                action={
                  <button
                    type="button"
                    onClick={() =>
                      openModal("create-question", {
                        subTopicId: subTopic.id,
                        subTopic,
                        topicId,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add First Question
                  </button>
                }
              />
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleQuestionDragEnd}
            >
              <SortableContext
                items={displayQuestions.map((q) => q.id)}
                strategy={verticalListSortingStrategy}
              >
                {displayQuestions.map((q, qIndex) => (
                  <QuestionItem key={q.id} question={q} index={qIndex} />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}
    </div>
  );
};
