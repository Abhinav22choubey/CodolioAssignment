import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
  type CreateQuestionData,
  type UpdateQuestionData,
} from "../api/questions.api";

// GET
export function useQuestions(
  subTopicId: string
) {
  return useQuery({
    queryKey: [
      "subtopics",
      subTopicId,
      "questions",
    ],

    queryFn: () =>
      getQuestions(subTopicId),

    enabled: Boolean(subTopicId),
  });
}

// CREATE
export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      subTopicId,
      data,
    }: {
      subTopicId: string;
      data: CreateQuestionData;
    }) =>
      createQuestion(
        subTopicId,
        data
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "subtopics",
          variables.subTopicId,
          "questions",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: ["topics"],
      });
    },
  });
}

// UPDATE
export function useUpdateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateQuestionData;
    }) =>
      updateQuestion(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["topics"],
      });

      queryClient.invalidateQueries({
        queryKey: ["subtopics"],
      });
    },
  });
}

// DELETE
export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteQuestion,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["topics"],
      });

      queryClient.invalidateQueries({
        queryKey: ["subtopics"],
      });
    },
  });
}

// REORDER
export function useReorderQuestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      subTopicId,
      questionIds,
    }: {
      subTopicId: string;
      questionIds: string[];
    }) =>
      reorderQuestions(
        subTopicId,
        questionIds
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "subtopics",
          variables.subTopicId,
          "questions",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: ["topics"],
      });
    },
  });
}