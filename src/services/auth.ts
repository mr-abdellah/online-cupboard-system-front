import { setToken } from "@/utils/token";
import api from "./api";
import { useUserStore } from "@/store/useUserStore";

export async function login(data: { email: string; password: string }) {
  const response = await api.post("/login", data);
  setToken(response.data.access_token);

  const userResponse = await getMe();
  useUserStore.getState().setUser(userResponse);

  return response.data;
}

export async function getMe() {
  try {
    const response = await api.get("/me");
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch user data");
  }
}

export async function logout() {
  try {
    await api.post("/logout");
  } catch (error) {
    throw new Error("Logout failed");
  }
}
