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

export async function updateProfile(data: {
  name?: string;
  password?: string;
  password_confirmation?: string;
  avatar?: File;
}) {
  try {
    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (data.password) formData.append("password", data.password);
    if (data.password_confirmation)
      formData.append("password_confirmation", data.password_confirmation);
    if (data.avatar) formData.append("avatar", data.avatar);

    const response = await api.post("/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Update user store with new data
    useUserStore.getState().setUser(response.data);

    return response.data;
  } catch (error) {
    throw new Error("Failed to update profile");
  }
}
