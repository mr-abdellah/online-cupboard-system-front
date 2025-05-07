import api from "./api";

interface AllUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

interface PaginatedAllUsersResponse {
  data: AllUser[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  status: string;
  last_login_at: string | null;
  last_login_ip: string | null;
  creator?: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  } | null;
  updater?: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  } | null;
}

interface UserPermission extends User {
  permissions: [
    {
      id: number;
      name: Permission;
      pivot: {
        model_type: string;
        model_id: string;
        permission_id: number;
      };
    }
  ];
}

export type Permission =
  | "can_view_documents"
  | "can_edit_documents"
  | "can_delete_document"
  | "can_upload_documents"
  | "can_view_users"
  | "can_edit_users"
  | "can_delete_users"
  | "can_create_users";

// Request interface for creating/updating user
interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  avatar?: File;
  status: "active" | "inactive";
  permissions: Permission[];
}

interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  avatar?: File;
  status?: "active" | "inactive";
  permissions?: Permission[];
}

// Paginated users response interface
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
): Promise<PaginatedAllUsersResponse> {
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

export async function getUsers(
  page: number = 1,
  perPage: number = 10,
  searchQuery: string = "",
  status: string = ""
): Promise<PaginatedUsersResponse> {
  try {
    const response = await api.get("/users", {
      params: {
        page,
        per_page: perPage,
        query: searchQuery || undefined,
        status: status || undefined,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch users");
  }
}

export async function createUser(data: CreateUserRequest): Promise<User> {
  try {
    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (data.email) formData.append("email", data.email);
    if (data.password) formData.append("password", data.password);
    if (data.password_confirmation)
      formData.append("password_confirmation", data.password_confirmation);
    if (data.avatar) formData.append("avatar", data.avatar);
    if (data.status) formData.append("status", data.status);
    if (data.permissions) {
      data.permissions.forEach((permission, idx) => {
        formData.append(`permissions[${idx}]`, permission);
      });
    }

    const response = await api.post("/users", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to create user");
  }
}

export async function getUser(userId: string): Promise<UserPermission> {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch user");
  }
}

export async function updateUser(
  userId: string,
  data: UpdateUserRequest
): Promise<User> {
  try {
    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (data.email) formData.append("email", data.email);
    if (data.password) formData.append("password", data.password);
    if (data.password_confirmation)
      formData.append("password_confirmation", data.password_confirmation);
    if (data.avatar) formData.append("avatar", data.avatar);
    if (data.status) formData.append("status", data.status);
    if (data.permissions) {
      data.permissions.forEach((permission, idx) => {
        formData.append(`permissions[${idx}]`, permission);
      });
    }

    const response = await api.post(`/users/${userId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to update user");
  }
}

export async function deactivateUser(userId: string): Promise<User> {
  try {
    const response = await api.post(`/users/${userId}/deactivate`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to deactivate user");
  }
}

export async function activateUser(userId: string): Promise<User> {
  try {
    const response = await api.post(`/users/${userId}/activate`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to activate user");
  }
}

export async function deleteUser(userId: string): Promise<void> {
  try {
    await api.delete(`/users/${userId}`);
  } catch (error) {
    throw new Error("Failed to delete user");
  }
}
