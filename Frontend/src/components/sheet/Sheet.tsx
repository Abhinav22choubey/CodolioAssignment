import { useMemo } from "react";
import {
  useSensors,
  useSensor,
  PointerSensor,
  closestCenter,
  DndContext,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import type { AxiosError } from "axios";
import type { Topic, SubTopic, Question } from "../../types/sheet";
import { TopicItem } from "./TopicItem";
import { EmptyState } from "../common/EmptyState";
import { useUIStore } from "../../store/uiStore";
import { useReorderTopics } from "../../hooks/useTopics";

function getErrorMessage(err: unknown, fallback: string): string {
  const axiosError = err as AxiosError<{ message?: string }>;
  return axiosError?.response?.data?.message || axiosError?.message || fallback;
}

interface SheetProps {
  topics: Topic[];
}

interface FilteredSubTopicData {
  subTopic: SubTopic;
  filteredQuestions?: Question[];
}

interface FilteredTopicData {
  topic: Topic;
  filteredSubTopics: FilteredSubTopicData[];
}

export const Sheet = ({ topics }: SheetProps) => {
  const {
    searchQuery,
    difficultyFilter,
    platformFilter,
    resetFilters,
    openModal,
  } = useUIStore();

  const queryClient = useQueryClient();
  const reorderTopicsMutation = useReorderTopics();

  // Sensors for topic-level drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleTopicDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = topics.findIndex((t) => t.id === active.id);
    const newIndex = topics.findIndex((t) => t.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(topics, oldIndex, newIndex);
    const topicIds = newOrder.map((t) => t.id);

    // Optimistic update in React Query
    queryClient.setQueryData(["topics"], newOrder);

    reorderTopicsMutation.mutate(topicIds, {
      onSuccess: () => {
        toast.success("Topics reordered successfully");
      },
      onError: (err: unknown) => {
        toast.error(getErrorMessage(err, "Failed to save topic order"));
        queryClient.invalidateQueries({ queryKey: ["topics"] });
      },
    });
  };

  const isFilterActive =
    searchQuery.trim() !== "" ||
    difficultyFilter !== "ALL" ||
    platformFilter !== "ALL";

  // Filtered dataset computation
  const filteredData = useMemo<FilteredTopicData[]>(() => {
    if (!isFilterActive) {
      return topics.map((topic) => ({
        topic,
        filteredSubTopics: (topic.subTopics || []).map((sub) => ({
          subTopic: sub,
          filteredQuestions: sub.questions || [],
        })),
      }));
    }

    const qLower = searchQuery.toLowerCase().trim();

    const results: FilteredTopicData[] = [];

    topics.forEach((topic) => {
      const topicMatches = qLower && topic.title.toLowerCase().includes(qLower);

      const matchingSubTopics: FilteredSubTopicData[] = [];

      (topic.subTopics || []).forEach((subTopic) => {
        const subTopicMatches =
          qLower && subTopic.title.toLowerCase().includes(qLower);

        // Filter questions in this subtopic
        const matchingQuestions = (subTopic.questions || []).filter((question) => {
          // 1. Search Query
          if (qLower) {
            const matchesTitle = question.title.toLowerCase().includes(qLower);
            const matchesDiff = question.difficulty?.toLowerCase().includes(qLower);
            const matchesPlatform = question.platform?.toLowerCase().includes(qLower);
            if (!matchesTitle && !matchesDiff && !matchesPlatform && !subTopicMatches && !topicMatches) {
              return false;
            }
          }

          // 2. Difficulty Filter
          if (difficultyFilter !== "ALL") {
            if (!question.difficulty || question.difficulty.toLowerCase() !== difficultyFilter.toLowerCase()) {
              return false;
            }
          }

          // 3. Platform Filter
          if (platformFilter !== "ALL") {
            if (!question.platform || question.platform.toLowerCase() !== platformFilter.toLowerCase()) {
              return false;
            }
          }

          return true;
        });

        // Keep subtopic if it has matching questions or itself matched search (with no stricter filters applied)
        if (matchingQuestions.length > 0) {
          matchingSubTopics.push({
            subTopic,
            filteredQuestions: matchingQuestions,
          });
        } else if (subTopicMatches && difficultyFilter === "ALL" && platformFilter === "ALL") {
          matchingSubTopics.push({
            subTopic,
            filteredQuestions: subTopic.questions || [],
          });
        }
      });

      if (matchingSubTopics.length > 0) {
        results.push({
          topic,
          filteredSubTopics: matchingSubTopics,
        });
      } else if (topicMatches && difficultyFilter === "ALL" && platformFilter === "ALL") {
        results.push({
          topic,
          filteredSubTopics: (topic.subTopics || []).map((sub) => ({
            subTopic: sub,
            filteredQuestions: sub.questions || [],
          })),
        });
      }
    });

    return results;
  }, [
    topics,
    isFilterActive,
    searchQuery,
    difficultyFilter,
    platformFilter,
  ]);

  if (topics.length === 0) {
    return (
      <EmptyState
        type="topics"
        action={
          <button
            type="button"
            onClick={() => openModal("create-topic")}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white bg-orange-500 hover:bg-orange-600 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Your First Topic
          </button>
        }
      />
    );
  }

  if (isFilterActive && filteredData.length === 0) {
    return (
      <EmptyState
        type="search"
        action={
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-xs"
          >
            Reset Filters
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleTopicDragEnd}
      >
        <SortableContext
          items={filteredData.map((f) => f.topic.id)}
          strategy={verticalListSortingStrategy}
        >
          {filteredData.map(({ topic, filteredSubTopics }, index) => (
            <TopicItem
              key={topic.id}
              topic={topic}
              index={index}
              filteredSubTopics={filteredSubTopics}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};
