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
import type { Topic } from "../../types/sheet";
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
export const Sheet = ({ topics }: SheetProps) => {
  const { searchQuery, resetFilters, openModal } = useUIStore();
  const queryClient = useQueryClient();
  const reorderTopicsMutation = useReorderTopics();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );
  const handleTopicDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const oldIndex = topics.findIndex((topic) => topic.id === active.id);
    const newIndex = topics.findIndex((topic) => topic.id === over.id);
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }
    const newOrder = arrayMove(topics, oldIndex, newIndex);
    const topicIds = newOrder.map((topic) => topic.id);
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
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredTopics = normalizedSearch
    ? topics.filter((topic) =>
        topic.title.toLowerCase().includes(normalizedSearch),
      )
    : topics;
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
            {" "}
            <Plus className="w-4 h-4" /> Create Your First Topic{" "}
          </button>
        }
      />
    );
  }
  if (normalizedSearch && filteredTopics.length === 0) {
    return (
      <EmptyState
        type="search"
        action={
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-xs"
          >
            {" "}
            Reset Filters{" "}
          </button>
        }
      />
    );
  }
  return (
    <div className="space-y-4">
      {" "}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleTopicDragEnd}
      >
        {" "}
        <SortableContext
          items={filteredTopics.map((topic) => topic.id)}
          strategy={verticalListSortingStrategy}
        >
          {" "}
          {filteredTopics.map((topic, index) => (
            <TopicItem key={topic.id} topic={topic} index={index} />
          ))}{" "}
        </SortableContext>{" "}
      </DndContext>{" "}
    </div>
  );
};
