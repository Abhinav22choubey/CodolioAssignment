import api from "./axios";
import type { Topic } from "../types/sheet";

// GET /api/topics
export async function getTopics(): Promise<Topic[]> {
  const response = await api.get<Topic[]>("/topics");

  return response.data;
}

// GET /api/topics/:id
export async function getTopic(
  id: string
): Promise<Topic> {
  const response = await api.get<Topic>(
    `/topics/${id}`
  );

  return response.data;
}

// POST /api/topics
export async function createTopic(
  title: string
): Promise<Topic> {
  const response = await api.post<Topic>(
    "/topics",
    {
      title,
    }
  );

  return response.data;
}

// PUT /api/topics/:id
export async function updateTopic(
  id: string,
  title: string
): Promise<Topic> {
  const response = await api.put<Topic>(
    `/topics/${id}`,
    {
      title,
    }
  );

  return response.data;
}

// DELETE /api/topics/:id
export async function deleteTopic(
  id: string
) {
  // console.log(id)
  const response = await api.delete<{
    message: string;
    topic: Topic;
  }>(`/topics/${id}`);

  return response.data;
}

// PUT /api/topics/reorder
export async function reorderTopics(
  topicIds: string[]
): Promise<Topic[]> {
  const response = await api.put<Topic[]>(
    "/topics/reorder",
    {
      topicIds,
    }
  );

  return response.data;
}