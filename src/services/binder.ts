import api from "./api";

// Request interface for creating/updating binder
interface BinderRequest {
  name: string;
  cupboard_id: string;
}

// Response interface for binder
export interface BinderResponse {
  id: string;
  name: string;
  cupboard_id: string;
  order: number;
  created_at: string;
  updated_at: string;
  cupboard?: {
    id: string;
    name: string;
    order: number;
  };
  documents?: Array<{
    id: string;
    title: string;
    description: string | null;
    type: string;
    ocr: string | null;
    tags: string[];
    binder_id: string;
    path: string;
    is_searchable: boolean;
    permissions: ["view", "edit", "delete", "download"];
  }>;
}

export async function getBinders(): Promise<BinderResponse[]> {
  try {
    const response = await api.get("/binders");
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch binders");
  }
}

export async function createBinder(
  data: BinderRequest
): Promise<BinderResponse> {
  try {
    const response = await api.post("/binders", data);
    return response.data;
  } catch (error) {
    throw new Error("Failed to create binder");
  }
}

export async function getBinder(binderId: string): Promise<BinderResponse> {
  try {
    const response = await api.get(`/binders/${binderId}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch binder");
  }
}

export async function updateBinder(
  binderId: string,
  data: BinderRequest
): Promise<BinderResponse> {
  try {
    const response = await api.post(`/binders/${binderId}`, data);
    return response.data;
  } catch (error) {
    throw new Error("Failed to update binder");
  }
}

export async function deleteBinder(binderId: string): Promise<void> {
  try {
    await api.delete(`/binders/${binderId}`);
  } catch (error) {
    throw new Error("Failed to delete binder");
  }
}
