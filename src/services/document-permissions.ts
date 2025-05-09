import api from "./api";

// Interface for a single user's permission data
export interface UserPermission {
  user_id: string;
  permissions: string[];
}

// Response interface for bulk permission updates
export interface BulkPermissionResponse {
  message: string;
  users: { user_id: string; permissions: string[] }[];
}

// Response export interface for document with users and permissions
export interface DocumentUserPermission {
  id: string;
  title: string;
  description: string | null;
  type: string;
  path: string;
  is_searchable: boolean;
  is_public: boolean;
  tags: string[];
  binder_id: string;
  created_at: string;
  updated_at: string;
}

export interface UserWithPermissions {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  permissions: string[];
}

export interface DocumentWithUsersResponse {
  document: DocumentUserPermission;
  users: UserWithPermissions[];
}

// API function to update (store or update) permissions for multiple users on a document
export async function updateDocumentPermissions(
  documentId: string,
  users: UserPermission[],
  is_public?: boolean
): Promise<BulkPermissionResponse> {
  const response = await api.post(
    `/document/${documentId}/manage-permissions`,
    { documentId, users, is_public },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}

// API function to get document info with users and their permissions
export async function getDocumentWithUsersAndPermissions(
  documentId: string
): Promise<DocumentWithUsersResponse> {
  const response = await api.get(`/document/${documentId}/permission-details`);
  return response.data;
}
