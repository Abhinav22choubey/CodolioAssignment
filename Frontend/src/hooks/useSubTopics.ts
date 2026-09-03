import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getSubTopics,
  createSubTopic,
  updateSubTopic,
  deleteSubTopic,
  reorderSubTopics,
} from "../api/subtopics.api";

// GET
export function useSubTopics(
  topicId: string
) {
  return useQuery({
    queryKey: [
      "topics",
      topicId,
      "subtopics",
    ],

    queryFn: () =>
      getSubTopics(topicId),

    enabled: Boolean(topicId),
  });
}

// CREATE
export function useCreateSubTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      topicId,
      title,
    }: {
      topicId: string;
      title: string;
    }) =>
      createSubTopic(
        topicId,
        title
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "topics",
          variables.topicId,
          "subtopics",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: ["topics"],
      });
    },
  });
}

// UPDATE
export function useUpdateSubTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      title,
    }: {
      id: string;
      title: string;
    }) =>
      updateSubTopic(id, title),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["topics"],
      });
    },
  });
}

// DELETE
export function useDeleteSubTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSubTopic,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["topics"],
      });
    },
  });
}

// REORDER
export function useReorderSubTopics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      topicId,
      subTopicIds,
    }: {
      topicId: string;
      subTopicIds: string[];
    }) =>
      reorderSubTopics(
        topicId,
        subTopicIds
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "topics",
          variables.topicId,
          "subtopics",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: ["topics"],
      });
    },
  });
}