import { Permission } from "@/services/user";
import { useAuth } from "./useAuth";

export const usePermission = () => {
  const { user } = useAuth();

  const userPermissions: Permission[] = user?.permissions || [];

  const hasPermission = (permissions: Permission | Permission[]) => {
    if (!userPermissions.length || !user) {
      return false;
    }
    const required = Array.isArray(permissions) ? permissions : [permissions];
    return required.every((p) => userPermissions.includes(p));
  };

  const canViewDocuments = hasPermission("can_view_documents");
  const canEditDocuments = hasPermission("can_edit_documents");
  const canDeleteDocument = hasPermission("can_delete_document");
  const canUploadDocuments = hasPermission("can_upload_documents");
  const canViewUsers = hasPermission("can_view_users");
  const canEditUsers = hasPermission("can_edit_users");
  const canDeleteUsers = hasPermission("can_delete_users");
  const canCreateUsers = hasPermission("can_create_users");
  return {
    hasPermission,
    canViewDocuments,
    canEditDocuments,
    canDeleteDocument,
    canUploadDocuments,
    canViewUsers,
    canEditUsers,
    canDeleteUsers,
    canCreateUsers,
  };
};
