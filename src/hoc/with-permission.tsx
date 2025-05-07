import type React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Permission } from "@/services/user";
import { usePermission } from "@/hooks/usePermission";

const Unauthorized: React.FC = () => (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Accès non autorisé</AlertTitle>
    <AlertDescription>
      Vous n'avez pas les permissions nécessaires pour accéder à cette
      ressource.
    </AlertDescription>
  </Alert>
);

// Create the HOC
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions: Permission | Permission[],
  UnauthorizedComponent: React.ComponentType = Unauthorized
) {
  const WithPermissionComponent: React.FC<P> = (props) => {
    const { user, isLoading } = useAuth();

    const { hasPermission } = usePermission();

    if (isLoading) {
      return <div>Chargement...</div>;
    }

    if (!user) {
      return <UnauthorizedComponent />;
    }

    if (!hasPermission(requiredPermissions)) {
      return <UnauthorizedComponent />;
    }

    return <Component {...props} />;
  };

  // Set display name for debugging
  const displayName = Component.displayName || Component.name || "Component";
  WithPermissionComponent.displayName = `withPermission(${displayName})`;

  return WithPermissionComponent;
}
