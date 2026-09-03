import api from "./axios";
import type { SubTopic } from "../types/sheet";

// GET
export async function getSubTopics(
  topicId: string
): Promise<SubTopic[]> {
  const response = await api.get<SubTopic[]>(
    `/topics/${topicId}/subtopics`
  );

  return response.data;
}

// CREATE
export async function createSubTopic(
  topicId: string,
  title: string
): Promise<SubTopic> {
  const response = await api.post<SubTopic>(
    `/topics/${topicId}/subtopics`,
    {
      title,
    }
  );

  return response.data;
}

// UPDATE
export async function updateSubTopic(
  id: string,
  title: string
): Promise<SubTopic> {
  const response = await api.put<SubTopic>(
    `/subtopics/${id}`,
    {
      title,
    }
  );

  return response.data;
}

// DELETE
export async function deleteSubTopic(
  id: string
) {
  const response = await api.delete<{
    message: string;
    subTopic: SubTopic;
  }>(`/subtopics/${id}`);

  return response.data;
}

// REORDER
export async function reorderSubTopics(
  topicId: string,
  subTopicIds: string[]
): Promise<SubTopic[]> {
  const response = await api.put<SubTopic[]>(
    "/subtopics/reorder",
    {
      topicId,
      subTopicIds,
    }
  );

  return response.data;
}