import { apiClient } from "./client";

export type TaskResponse = {
  id: number;
  task_id: number;
  applicant_id: number;
  status: "pending" | "accepted" | "rejected";
  message?: string;
  created_at: string;
  updated_at?: string;
};

export type CreateTaskResponsePayload = {
  task_id: number;
  message?: string;
};

export async function createTaskResponse(payload: CreateTaskResponsePayload): Promise<TaskResponse> {
  const response = await apiClient.post<TaskResponse>("/api/task_responses", payload);
  return response.data;
}

export async function listTaskResponses(params?: { task_id?: number; status?: string }): Promise<TaskResponse[]> {
  const response = await apiClient.get<TaskResponse[]>("/api/task_responses", { params });
  return response.data;
}
