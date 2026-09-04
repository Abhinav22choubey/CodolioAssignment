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

export function useTopics() {
  return useQuery({
    queryKey: ["topics"],
    queryFn: getTopics,
  });
}

export function useTopic(id: string) {
  return useQuery({
    queryKey: ["topics", id],
    queryFn: () => getTopic(id),
    enabled: Boolean(id),
  });
}

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

    onSuccess: (updatedTopic) => {
      queryClient.setQueryData(
        ["topics"],
        (topics: ReturnType<typeof getTopics> extends Promise<infer T> ? T : never) =>
          topics?.map((topic) =>
            topic.id === updatedTopic.id
              ? updatedTopic
              : topic
          )
      );

      queryClient.setQueryData(
        ["topics", updatedTopic.id],
        updatedTopic
      );
    },
  });
}

export function useDeleteTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTopic,

    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(
        ["topics"],
        (topics: Awaited<ReturnType<typeof getTopics>>) =>
          topics?.filter(
            (topic) => topic.id !== deletedId
          )
      );

      queryClient.removeQueries({
        queryKey: ["topics", deletedId],
      });
    },
  });
}

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