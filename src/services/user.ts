import api from "./api";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

interface PaginatedUsersResponse {
  data: User[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export async function getAllUsers(
  page: number = 1,
  perPage: number = 10,
  searchQuery: string = ""
): Promise<PaginatedUsersResponse> {
  try {
    const response = await api.get("/users/all", {
      params: {
        page,
        per_page: perPage,
        query: searchQuery || undefined, // Only include query if it exists
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch users");
  }
}
