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
  HelpCircle,
} from "lucide-react";

import { toast } from "sonner";

import type { AxiosError } from "axios";

import type {
  SubTopic,
  Question,
  Topic,
} from "../../types/sheet";

import { DragHandle } from "../common/DragHandle";
import { QuestionItem } from "./QuestionItem";
import { EmptyState } from "../common/EmptyState";

import { useUIStore } from "../../store/uiStore";

import {
  useQuestions,
  useReorderQuestions,
} from "../../hooks/useQuestions";

function getErrorMessage(
  err: unknown,
  fallback: string
): string {
  const axiosError =
    err as AxiosError<{ message?: string }>;

  return (
    axiosError?.response?.data?.message ||
    axiosError?.message ||
    fallback
  );
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
    searchQuery,
    difficultyFilter,
    platformFilter,
  } = useUIStore();

  const queryClient = useQueryClient();

  /*
   * Fetch questions specifically for this sub-topic.
   *
   * React Query key:
   * ["subtopics", subTopic.id, "questions"]
   */
  const {
    data: questions = [],
    isLoading: isQuestionsLoading,
    isError: isQuestionsError,
  } = useQuestions(subTopic.id);

  const reorderQuestionsMutation =
    useReorderQuestions();

  const isFilterActive =
    searchQuery.trim() !== "" ||
    difficultyFilter !== "ALL" ||
    platformFilter !== "ALL";

  const isExpanded = isFilterActive
    ? true
    : Boolean(
        expandedSubTopics[subTopic.id]
      );

  /*
   * IMPORTANT:
   *
   * Do NOT use:
   *
   *   subTopic.questions
   *
   * anymore.
   *
   * The questions endpoint is now the source of truth.
   */
  const allQuestions = questions;

  /*
   * When filters are active, use the filtered questions
   * passed from the parent.
   *
   * Otherwise show ALL questions fetched for this sub-topic.
   */
  const displayQuestions = isFilterActive
    ? filteredQuestions ?? []
    : allQuestions;

  const totalCount = allQuestions.length;

  /*
   * Sortable hook for the sub-topic itself.
   */
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: subTopic.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 20 : 1,
  };

  /*
   * Sensors for nested Question DndContext.
   */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleQuestionDragEnd = (
    event: DragEndEvent
  ) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = displayQuestions.findIndex(
      (question) =>
        question.id === active.id
    );

    const newIndex = displayQuestions.findIndex(
      (question) =>
        question.id === over.id
    );

    if (
      oldIndex === -1 ||
      newIndex === -1
    ) {
      return;
    }

    /*
     * Create the new order.
     */
    const newOrder = arrayMove(
      displayQuestions,
      oldIndex,
      newIndex
    );

    const questionIds = newOrder.map(
      (question) => question.id
    );

    /*
     * Save the previous cache values so we can
     * restore them if the API request fails.
     */
    const previousQuestions =
      queryClient.getQueryData<Question[]>([
        "subtopics",
        subTopic.id,
        "questions",
      ]);

    const previousTopics =
      queryClient.getQueryData<Topic[]>([
        "topics",
      ]);

    /*
     * Optimistically update questions query.
     */
    queryClient.setQueryData<Question[]>(
      [
        "subtopics",
        subTopic.id,
        "questions",
      ],
      newOrder
    );

    /*
     * Also update topics cache because other
     * components may be reading questions from
     * the topics cache.
     */
    queryClient.setQueryData<Topic[]>(
      ["topics"],
      (oldTopics) => {
        if (!oldTopics) {
          return oldTopics;
        }

        return oldTopics.map((topic) => {
          if (topic.id !== topicId) {
            return topic;
          }

          return {
            ...topic,

            subTopics: (
              topic.subTopics || []
            ).map((sub) => {
              if (
                sub.id !== subTopic.id
              ) {
                return sub;
              }

              return {
                ...sub,
                questions: newOrder,
              };
            }),
          };
        });
      }
    );

    /*
     * Persist new order to backend.
     */
    reorderQuestionsMutation.mutate(
      {
        subTopicId: subTopic.id,
        questionIds,
      },
      {
        onSuccess: () => {
          toast.success(
            "Questions reordered successfully"
          );

          /*
           * Backend is the final source of truth.
           * Refetch the questions after successful
           * reorder.
           */
          queryClient.invalidateQueries({
            queryKey: [
              "subtopics",
              subTopic.id,
              "questions",
            ],
          });

          queryClient.invalidateQueries({
            queryKey: ["topics"],
          });
        },

        onError: (err: unknown) => {
          toast.error(
            getErrorMessage(
              err,
              "Failed to save question order"
            )
          );

          /*
           * Restore previous questions cache.
           */
          if (previousQuestions) {
            queryClient.setQueryData(
              [
                "subtopics",
                subTopic.id,
                "questions",
              ],
              previousQuestions
            );
          } else {
            queryClient.removeQueries({
              queryKey: [
                "subtopics",
                subTopic.id,
                "questions",
              ],
            });
          }

          /*
           * Restore previous topics cache.
           */
          if (previousTopics) {
            queryClient.setQueryData(
              ["topics"],
              previousTopics
            );
          }
        },
      }
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="mb-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 overflow-hidden shadow-2xs"
    >
      {/* Subtopic Header */}
      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200/60 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Drag Handle */}
          <DragHandle
            {...attributes}
            {...listeners}
            label={`Drag ${subTopic.title}`}
          />

          {/* Expand / Collapse */}
          <button
            type="button"
            onClick={() =>
              toggleSubTopic(
                subTopic.id
              )
            }
            aria-label={
              isExpanded
                ? `Collapse ${subTopic.title}`
                : `Expand ${subTopic.title}`
            }
            className="p-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-transform"
          >
            <ChevronRight
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded
                  ? "rotate-90 text-orange-500"
                  : ""
              }`}
            />
          </button>

          {/* Subtopic Title */}
          <button
            type="button"
            onClick={() =>
              toggleSubTopic(
                subTopic.id
              )
            }
            className="flex items-center gap-2 text-left font-medium text-slate-800 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 text-sm truncate"
          >
            <FolderOpen className="w-4 h-4 text-orange-400 shrink-0" />

            <span className="truncate">
              {subTopic.title}
            </span>
          </button>

          {/* Question Count */}
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
            <HelpCircle className="w-3 h-3 text-slate-400" />

            {isQuestionsLoading
              ? "..."
              : totalCount}

            {!isQuestionsLoading &&
              ` ${
                totalCount === 1
                  ? "question"
                  : "questions"
              }`}
          </span>
        </div>

        {/* Subtopic Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Add Question */}
          <button
            type="button"
            onClick={() =>
              openModal(
                "create-question",
                {
                  subTopicId:
                    subTopic.id,
                  subTopic,
                  topicId,
                }
              )
            }
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />

            <span className="hidden sm:inline">
              Add Question
            </span>
          </button>

          {/* Edit */}
          <button
            type="button"
            onClick={() =>
              openModal(
                "edit-subtopic",
                {
                  subTopic,
                  topicId,
                }
              )
            }
            aria-label={`Edit ${subTopic.title}`}
            className="p-1.5 rounded-md text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() =>
              openModal(
                "delete-subtopic",
                {
                  subTopic,
                  topicId,
                }
              )
            }
            aria-label={`Delete ${subTopic.title}`}
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Questions */}
      {isExpanded && (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {/* Loading */}
          {isQuestionsLoading ? (
            <div className="p-6 bg-white dark:bg-slate-900 text-center text-sm text-slate-500 dark:text-slate-400">
              Loading questions...
            </div>
          ) : isQuestionsError ? (
            /* Error */
            <div className="p-6 bg-white dark:bg-slate-900 text-center">
              <p className="text-sm text-rose-500">
                Failed to load questions.
              </p>

              <button
                type="button"
                onClick={() =>
                  queryClient.invalidateQueries({
                    queryKey: [
                      "subtopics",
                      subTopic.id,
                      "questions",
                    ],
                  })
                }
                className="mt-2 text-xs font-medium text-orange-500 hover:text-orange-600"
              >
                Try again
              </button>
            </div>
          ) : displayQuestions.length === 0 ? (
            /* Empty */
            <div className="p-4 bg-white dark:bg-slate-900">
              <EmptyState
                type="questions"
                action={
                  <button
                    type="button"
                    onClick={() =>
                      openModal(
                        "create-question",
                        {
                          subTopicId:
                            subTopic.id,
                          subTopic,
                          topicId,
                        }
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add First Question
                  </button>
                }
              />
            </div>
          ) : (
            /* Questions List */
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={
                handleQuestionDragEnd
              }
            >
              <SortableContext
                items={displayQuestions.map(
                  (question) =>
                    question.id
                )}
                strategy={
                  verticalListSortingStrategy
                }
              >
                {displayQuestions.map(
                  (question, qIndex) => (
                    <QuestionItem
                      key={question.id}
                      question={question}
                      index={qIndex}
                    />
                  )
                )}
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}
    </div>
  );
};