import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getTopics,
  getTopic,
  createTopic,
  updateTopic,
  deleteTopic,
  reorderTopics,
} from "../api/topics.api";

// GET ALL
export function useTopics() {
  return useQuery({
    queryKey: ["topics"],
    queryFn: getTopics,
  });
}

// GET ONE
export function useTopic(id: string) {
  return useQuery({
    queryKey: ["topics", id],
    queryFn: () => getTopic(id),
    enabled: Boolean(id),
  });
}

// CREATE
export function useCreateTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTopic,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["topics"],
      });
    },
  });
}

// UPDATE
export function useUpdateTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      title,
    }: {
      id: string;
      title: string;
    }) => updateTopic(id, title),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["topics"],
      });
    },
  });
}

// DELETE
export function useDeleteTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTopic,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["topics"],
      });
    },
  });
}

// REORDER
export function useReorderTopics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reorderTopics,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["topics"],
      });
    },
  });
}