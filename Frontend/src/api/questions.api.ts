import api from "./axios";
import type { Question } from "../types/sheet";

export interface CreateQuestionData {
  title: string;
  difficulty?: string | null;
  platform?: string | null;
  problemUrl?: string | null;
  resource?: string | null;
}

export interface UpdateQuestionData {
  title?: string;
  difficulty?: string | null;
  platform?: string | null;
  problemUrl?: string | null;
  resource?: string | null;
}

// GET
export async function getQuestions(
  subTopicId: string
): Promise<Question[]> {
  const response = await api.get<Question[]>(
    `/subtopics/${subTopicId}/questions`
  );

  return response.data;
}

// CREATE
export async function createQuestion(
  subTopicId: string,
  data: CreateQuestionData
): Promise<Question> {
  const response = await api.post<Question>(
    `/subtopics/${subTopicId}/questions`,
    data
  );

  return response.data;
}

// UPDATE
export async function updateQuestion(
  id: string,
  data: UpdateQuestionData
): Promise<Question> {
  const response = await api.put<Question>(
    `/questions/${id}`,
    data
  );

  return response.data;
}

// DELETE
export async function deleteQuestion(
  id: string
) {
  const response = await api.delete<{
    message: string;
    question: Question;
  }>(`/questions/${id}`);

  return response.data;
}

// REORDER
export async function reorderQuestions(
  subTopicId: string,
  questionIds: string[]
): Promise<Question[]> {
  const response = await api.put<Question[]>(
    "/questions/reorder",
    {
      subTopicId,
      questionIds,
    }
  );

  return response.data;
}