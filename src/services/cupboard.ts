import api from "./api";

// Request interface for creating/updating cupboard
interface CupboardRequest {
  name: string;
}

// Response interface for cupboard
interface CupboardResponse {
  id: string;
  name: string;
  order: number;
  created_at: string;
  updated_at: string;
  binders?: Array<{
    id: string;
    name: string;
    cupboard_id: string;
    order: number;
  }>;
}

export async function getCupboards(): Promise<CupboardResponse[]> {
  try {
    const response = await api.get("/cupboards");
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch cupboards");
  }
}

export async function createCupboard(
  data: CupboardRequest
): Promise<CupboardResponse> {
  try {
    const response = await api.post("/cupboards", data);
    return response.data;
  } catch (error) {
    throw new Error("Failed to create cupboard");
  }
}

export async function getCupboard(
  cupboardId: string
): Promise<CupboardResponse> {
  try {
    const response = await api.get(`/cupboards/${cupboardId}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch cupboard");
  }
}

export async function updateCupboard(
  cupboardId: string,
  data: CupboardRequest
): Promise<CupboardResponse> {
  try {
    const response = await api.post(`/cupboards/${cupboardId}`, data);
    return response.data;
  } catch (error) {
    throw new Error("Failed to update cupboard");
  }
}

export async function deleteCupboard(cupboardId: string): Promise<void> {
  try {
    await api.delete(`/cupboards/${cupboardId}`);
  } catch (error) {
    throw new Error("Failed to delete cupboard");
  }
}
