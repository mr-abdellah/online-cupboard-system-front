import api from "./api";
export interface UserPermission {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  permissions: string[];
}

export interface CupboardWithPermissionsResponse {
  cupboard: {
    id: string;
    name: string;
    order: number;
    created_at: string;
    updated_at: string;
  };
  users: UserPermission[];
}

export interface CupboardWithUserPermissionsResponse {
  cupboard: {
    id: string;
    name: string;
    order: number;
    created_at: string;
    updated_at: string;
  };
  user: UserPermission | null;
}

export interface PermissionUpdateResponse {
  message: string;
}

export async function getCupboardWithUsersAndPermissions(
  cupboardId: string
): Promise<CupboardWithPermissionsResponse> {
  const response = await api.get(`/cupboards/${cupboardId}/permissions`);
  return response.data;
}

export async function getCupboardWithUserPermissions(
  cupboardId: string,
  userId: string
): Promise<CupboardWithUserPermissionsResponse> {
  const response = await api.get(
    `/cupboards/${cupboardId}/permissions/${userId}`
  );
  return response.data;
}

export async function assignManagePermissionToUserForCupboards(
  userId: string,
  cupboardIds: string[]
): Promise<PermissionUpdateResponse> {
  const response = await api.put(`/users/${userId}/cupboards/permissions`, {
    cupboard_ids: cupboardIds,
  });
  return response.data;
}

export async function assignManagePermissionToUsersForCupboard(
  cupboardId: string,
  userIds: string[]
): Promise<PermissionUpdateResponse> {
  const response = await api.put(`/cupboards/${cupboardId}/users/permissions`, {
    user_ids: userIds,
  });
  return response.data;
}
