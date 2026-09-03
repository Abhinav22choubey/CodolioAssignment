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
  Folder,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import type { Topic, SubTopic, Question } from "../../types/sheet";
import { DragHandle } from "../common/DragHandle";
import { SubTopicItem } from "./SubTopicItem";
import { EmptyState } from "../common/EmptyState";
import { useUIStore } from "../../store/uiStore";
import { useReorderSubTopics } from "../../hooks/useSubTopics";

function getErrorMessage(err: unknown, fallback: string): string {
  const axiosError = err as AxiosError<{ message?: string }>;
  return axiosError?.response?.data?.message || axiosError?.message || fallback;
}

interface FilteredSubTopicData {
  subTopic: SubTopic;
  filteredQuestions?: Question[];
}

interface TopicItemProps {
  topic: Topic;
  index: number;
  filteredSubTopics?: FilteredSubTopicData[];
}

export const TopicItem = ({
  topic,
  index,
  filteredSubTopics,
}: TopicItemProps) => {
  const {
    expandedTopics,
    toggleTopic,
    openModal,
    isQuestionSolved,
    searchQuery,
    difficultyFilter,
    solvedFilter,
    platformFilter,
  } = useUIStore();

  const queryClient = useQueryClient();
  const reorderSubTopicsMutation = useReorderSubTopics();

  const isFilterActive =
    searchQuery.trim() !== "" ||
    difficultyFilter !== "ALL" ||
    solvedFilter !== "ALL" ||
    platformFilter !== "ALL";

  const isExpanded = isFilterActive ? true : Boolean(expandedTopics[topic.id]);

  // Determine subtopics to display (all or filtered)
  const allSubTopics = topic.subTopics || [];
  const activeSubTopicsList = filteredSubTopics
    ? filteredSubTopics.map((f) => f.subTopic)
    : allSubTopics;

  // Sortable hook for this topic
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 30 : 1,
  };

  // Sensors for nested SubTopic DndContext
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleSubTopicDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = activeSubTopicsList.findIndex((s) => s.id === active.id);
    const newIndex = activeSubTopicsList.findIndex((s) => s.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(activeSubTopicsList, oldIndex, newIndex);
    const subTopicIds = newOrder.map((s) => s.id);

    // Optimistic cache update in React Query
    queryClient.setQueryData(["topics", topic.id, "subtopics"], newOrder);
    queryClient.setQueryData(["topics"], (oldTopics: Topic[] | undefined) => {
      if (!oldTopics) return oldTopics;
      return oldTopics.map((top) => {
        if (top.id !== topic.id) return top;
        return { ...top, subTopics: newOrder };
      });
    });

    reorderSubTopicsMutation.mutate(
      {
        topicId: topic.id,
        subTopicIds,
      },
      {
        onSuccess: () => {
          toast.success("Sub-topics reordered successfully");
        },
        onError: (err: unknown) => {
          toast.error(getErrorMessage(err, "Failed to save sub-topic order"));
          queryClient.invalidateQueries({ queryKey: ["topics"] });
        },
      }
    );
  };

  // Calculate statistics for this topic
  let totalQuestions = 0;
  let solvedQuestions = 0;

  allSubTopics.forEach((sub) => {
    const questions = sub.questions || [];
    totalQuestions += questions.length;
    questions.forEach((q) => {
      if (isQuestionSolved(q.id)) {
        solvedQuestions++;
      }
    });
  });

  const percent =
    totalQuestions > 0 ? Math.round((solvedQuestions / totalQuestions) * 100) : 0;

  // Map filtered questions lookup for children
  const filteredQuestionsMap = new Map<string, Question[]>();
  if (filteredSubTopics) {
    filteredSubTopics.forEach((f) => {
      if (f.filteredQuestions) {
        filteredQuestionsMap.set(f.subTopic.id, f.filteredQuestions);
      }
    });
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700 overflow-hidden"
    >
      {/* Topic Card Header */}
      <div className="flex items-center justify-between gap-3 p-4 bg-slate-50/90 dark:bg-slate-900 border-b border-slate-200/70 dark:border-slate-800/80 transition-colors">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Drag Handle */}
          <DragHandle {...attributes} {...listeners} label={`Drag ${topic.title}`} />

          {/* Sequence index */}
          <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
            #{index + 1}
          </span>

          {/* Expand/Collapse Chevron */}
          <button
            type="button"
            onClick={() => toggleTopic(topic.id)}
            aria-label={isExpanded ? `Collapse ${topic.title}` : `Expand ${topic.title}`}
            className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white transition-transform"
          >
            <ChevronRight
              className={`w-5 h-5 transition-transform duration-200 ${
                isExpanded ? "rotate-90 text-indigo-600 dark:text-indigo-400" : ""
              }`}
            />
          </button>

          {/* Topic Title */}
          <button
            type="button"
            onClick={() => toggleTopic(topic.id)}
            className="flex items-center gap-2 text-left font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-base sm:text-lg tracking-tight truncate"
          >
            <Folder className="w-5 h-5 text-indigo-500 shrink-0" />
            <span className="truncate">{topic.title}</span>
          </button>

          {/* Metrics Pill */}
          <div className="hidden md:flex items-center gap-2 shrink-0 ml-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Layers className="w-3 h-3 text-slate-400" />
              {allSubTopics.length} sub-topics
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              {solvedQuestions} / {totalQuestions} solved ({percent}%)
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => openModal("create-subtopic", { topicId: topic.id, topic })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Sub-topic</span>
          </button>

          <button
            type="button"
            onClick={() => openModal("edit-topic", { topic })}
            aria-label={`Edit ${topic.title}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => openModal("delete-topic", { topic })}
            aria-label={`Delete ${topic.title}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Subtopics Container */}
      {isExpanded && (
        <div className="p-4 bg-white/50 dark:bg-slate-950/30">
          {activeSubTopicsList.length === 0 ? (
            <EmptyState
              type="subtopics"
              action={
                <button
                  type="button"
                  onClick={() =>
                    openModal("create-subtopic", { topicId: topic.id, topic })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add First Sub-Topic
                </button>
              }
            />
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleSubTopicDragEnd}
            >
              <SortableContext
                items={activeSubTopicsList.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {activeSubTopicsList.map((subTopic) => (
                  <SubTopicItem
                    key={subTopic.id}
                    subTopic={subTopic}
                    topicId={topic.id}
                    filteredQuestions={filteredQuestionsMap.get(subTopic.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}
    </div>
  );
};

