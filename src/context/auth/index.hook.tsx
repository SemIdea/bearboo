import { useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { ISessionWithUser } from "@/server/entities/session/DTO";

const useAuthLogic = () => {
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [session, setSession] = useState<ISessionWithUser | null>(null);

  const updateAuthData = (data?: ISessionWithUser) => {
    if (!data) {
      setSession(null);
      document.cookie = `accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
      document.cookie = `session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
      localStorage.removeItem("refreshToken");

      return;
    }
    setSession(data);
    document.cookie = `accessToken=${data.accessToken}; path=/;`;
    document.cookie = `session=${JSON.stringify(data)}; path=/;`;
    localStorage.setItem("refreshToken", data.refreshToken);
  };

  const { mutate: login } = trpc.auth.loginUser.useMutation({
    onSuccess: (data) => updateAuthData(data),
  });

  const { mutate: register } = trpc.auth.registerUser.useMutation({
    onSuccess: (data) => updateAuthData(data),
  });

  const logout = () => {};

  return {
    session,
    isLoadingSession,
    setSession,
    setIsLoadingSession,
    updateAuthData,
    login,
    register,
    logout,
  };
};

type UseAuthLogicReturn = ReturnType<typeof useAuthLogic>;

export { useAuthLogic };
export type { UseAuthLogicReturn };
