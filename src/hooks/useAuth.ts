import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/services/auth";
import { getToken } from "@/utils/token";

export const useAuth = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: getMe,
    enabled: !!getToken(),
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
};
