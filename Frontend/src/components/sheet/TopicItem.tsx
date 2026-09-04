
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
  useSortable,
} from "@dnd-kit/sortable";

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

import type { Topic } from "../../types/sheet";

import { DragHandle } from "../common/DragHandle";
import { SubTopicItem } from "./SubTopicItem";
import { EmptyState } from "../common/EmptyState";

import { useUIStore } from "../../store/uiStore";

import {
  useReorderSubTopics,
  useSubTopics,
} from "../../hooks/useSubTopics";

function getErrorMessage(
  err: unknown,
  fallback: string,
): string {
  const axiosError =
    err as AxiosError<{ message?: string }>;

  return (
    axiosError?.response?.data?.message ||
    axiosError?.message ||
    fallback
  );
}

interface TopicItemProps {
  topic: Topic;
  index: number;
}

export const TopicItem = ({
  topic,
  index,
}: TopicItemProps) => {
  const {
    expandedTopics,
    toggleTopic,
    openModal,
  } = useUIStore();

  const queryClient = useQueryClient();

  const reorderSubTopicsMutation =
    useReorderSubTopics();

  const isExpanded = Boolean(
    expandedTopics[topic.id],
  );

  const {
    data: subTopics = [],
    isLoading,
    isError,
  } = useSubTopics(topic.id);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: topic.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 30 : 1,
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const handleSubTopicDragEnd = (
    event: DragEndEvent,
  ) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = subTopics.findIndex(
      (subTopic) =>
        subTopic.id === active.id,
    );

    const newIndex = subTopics.findIndex(
      (subTopic) =>
        subTopic.id === over.id,
    );

    if (
      oldIndex === -1 ||
      newIndex === -1
    ) {
      return;
    }

    const newOrder = arrayMove(
      subTopics,
      oldIndex,
      newIndex,
    );

    const subTopicIds = newOrder.map(
      (subTopic) => subTopic.id,
    );

    // Optimistically update the cache
    queryClient.setQueryData(
      ["topic-subtopics", topic.id],
      newOrder,
    );

    reorderSubTopicsMutation.mutate(
      {
        topicId: topic.id,
        subTopicIds,
      },
      {
        onSuccess: () => {
          toast.success(
            "Sub-topics reordered successfully",
          );
        },

        onError: (err: unknown) => {
          toast.error(
            getErrorMessage(
              err,
              "Failed to save sub-topic order",
            ),
          );

          queryClient.invalidateQueries({
            queryKey: [
              "topic-subtopics",
              topic.id,
            ],
          });
        },
      },
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="
        rounded-xl
        border
        border-slate-200/90
        dark:border-slate-800
        bg-white
        dark:bg-slate-900
        shadow-sm
        transition-all
        hover:border-slate-300
        dark:hover:border-slate-700
        overflow-hidden
      "
    >
      {/* =====================================================
          TOPIC HEADER
          ===================================================== */}

      <div
        className="
          flex
          flex-col
          gap-3
          p-3
          sm:p-4
          bg-slate-50/90
          dark:bg-slate-900
          border-b
          border-slate-200/70
          dark:border-slate-800/80
          transition-colors
        "
      >
        {/* =================================================
            TITLE ROW
            ================================================= */}

        <div
          className="
            flex
            items-start
            gap-2
            min-w-0
            w-full
          "
        >
          {/* Drag handle */}

          <div className="shrink-0 mt-0.5">
            <DragHandle
              {...attributes}
              {...listeners}
              label={`Drag ${topic.title}`}
            />
          </div>

          {/* Topic number */}

          <span
            className="
              text-xs
              font-mono
              font-semibold
              text-orange-600
              dark:text-orange-400
              bg-orange-500/10
              px-2
              py-0.5
              rounded
              shrink-0
              mt-0.5
            "
          >
            #{index + 1}
          </span>

          {/* Expand / collapse */}

          <button
            type="button"
            onClick={() =>
              toggleTopic(topic.id)
            }
            aria-label={
              isExpanded
                ? `Collapse ${topic.title}`
                : `Expand ${topic.title}`
            }
            className="
              p-1
              rounded
              text-slate-500
              hover:text-slate-900
              dark:hover:text-white
              transition-transform
              shrink-0
              mt-0.5
            "
          >
            <ChevronRight
              className={`
                w-5
                h-5
                transition-transform
                duration-200
                ${
                  isExpanded
                    ? "rotate-90 text-orange-500"
                    : ""
                }
              `}
            />
          </button>

          {/* Topic title */}

          <button
            type="button"
            onClick={() =>
              toggleTopic(topic.id)
            }
            className="
              flex
              items-start
              gap-2
              text-left
              font-semibold
              text-slate-900
              dark:text-white
              hover:text-orange-600
              dark:hover:text-orange-400
              text-base
              sm:text-lg
              tracking-tight
              min-w-0
              flex-1
              leading-6
            "
          >
            <Folder
              className="
                w-5
                h-5
                text-orange-500
                shrink-0
                mt-0.5
              "
            />

            {/* 
              IMPORTANT:
              No truncate here.
              The title can wrap to multiple lines.
            */}

            <span
              className="
                whitespace-normal
                break-words
                overflow-wrap-anywhere
              "
            >
              {topic.title}
            </span>
          </button>
        </div>

        {/* =================================================
            META + ACTIONS
            ================================================= */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-2
            w-full
            sm:justify-end
          "
        >
          {/* Sub-topic count */}

          <span
            className="
              inline-flex
              items-center
              gap-1
              px-2.5
              py-1
              rounded-full
              text-xs
              font-medium
              bg-slate-100
              dark:bg-slate-800
              text-slate-600
              dark:text-slate-300
              border
              border-slate-200
              dark:border-slate-700
              shrink-0
            "
          >
            <Layers
              className="
                w-3
                h-3
                text-slate-400
                shrink-0
              "
            />

            <span>
              {subTopics.length}
            </span>

            <span className="hidden sm:inline">
              {subTopics.length === 1
                ? "sub-topic"
                : "sub-topics"}
            </span>
          </span>

          {/* Action buttons */}

          <div
            className="
              flex
              items-center
              gap-1.5
              sm:gap-2
              shrink-0
            "
          >
            {/* Add Sub-topic */}

            <button
              type="button"
              onClick={() =>
                openModal(
                  "create-subtopic",
                  {
                    topicId: topic.id,
                    topic,
                  },
                )
              }
              className="
                inline-flex
                items-center
                justify-center
                gap-1.5
                px-2.5
                sm:px-3
                py-1.5
                rounded-lg
                text-xs
                font-semibold
                bg-orange-500
                hover:bg-orange-600
                active:bg-orange-700
                text-white
                shadow-xs
                transition-colors
                whitespace-nowrap
              "
            >
              <Plus
                className="
                  w-3.5
                  h-3.5
                  shrink-0
                "
              />

              {/* Desktop */}

              <span className="hidden sm:inline">
                Add Sub-topic
              </span>

              {/* Mobile */}

              <span className="sm:hidden">
                Add
              </span>
            </button>

            {/* Edit */}

            <button
              type="button"
              onClick={() =>
                openModal(
                  "edit-topic",
                  { topic },
                )
              }
              aria-label={`Edit ${topic.title}`}
              className="
                p-1.5
                rounded-lg
                text-slate-400
                hover:text-orange-600
                dark:hover:text-orange-400
                hover:bg-slate-100
                dark:hover:bg-slate-800
                transition-colors
                shrink-0
              "
            >
              <Pencil
                className="
                  w-4
                  h-4
                "
              />
            </button>

            {/* Delete */}

            <button
              type="button"
              onClick={() =>
                openModal(
                  "delete-topic",
                  { topic },
                )
              }
              aria-label={`Delete ${topic.title}`}
              className="
                p-1.5
                rounded-lg
                text-slate-400
                hover:text-rose-600
                dark:hover:text-rose-400
                hover:bg-slate-100
                dark:hover:bg-slate-800
                transition-colors
                shrink-0
              "
            >
              <Trash2
                className="
                  w-4
                  h-4
                "
              />
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          EXPANDED SUB-TOPICS
          ===================================================== */}

      {isExpanded && (
        <div
          className="
            p-3
            sm:p-4
            bg-white/50
            dark:bg-slate-950/30
          "
        >
          {/* Loading */}

          {isLoading ? (
            <div
              className="
                py-6
                text-center
                text-sm
                text-slate-500
              "
            >
              Loading sub-topics...
            </div>
          ) : isError ? (
            /* Error */

            <div
              className="
                py-6
                text-center
                text-sm
                text-rose-500
              "
            >
              Failed to load sub-topics.
            </div>
          ) : subTopics.length === 0 ? (
            /* Empty state */

            <EmptyState
              type="subtopics"
              action={
                <button
                  type="button"
                  onClick={() =>
                    openModal(
                      "create-subtopic",
                      {
                        topicId: topic.id,
                        topic,
                      },
                    )
                  }
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    px-3
                    py-1.5
                    text-xs
                    font-semibold
                    rounded-lg
                    bg-orange-500
                    text-white
                    hover:bg-orange-600
                    transition-colors
                  "
                >
                  <Plus
                    className="
                      w-3.5
                      h-3.5
                    "
                  />

                  Add First Sub-Topic
                </button>
              }
            />
          ) : (
            /* Sub-topic list */

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={
                handleSubTopicDragEnd
              }
            >
              <SortableContext
                items={subTopics.map(
                  (subTopic) =>
                    subTopic.id,
                )}
                strategy={
                  verticalListSortingStrategy
                }
              >
                {subTopics.map(
                  (subTopic) => (
                    <SubTopicItem
                      key={subTopic.id}
                      subTopic={subTopic}
                      topicId={topic.id}
                    />
                  ),
                )}
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}
    </div>
  );
};
