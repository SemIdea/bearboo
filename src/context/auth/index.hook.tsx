import { useState } from "react";
import { ISessionWithUser } from "@/server/entities/session/DTO";
import { setAuthData, clearAuthData } from "@/utils/authStorage";

const useAuthLogic = () => {
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [session, setSession] = useState<ISessionWithUser | null>(null);

  const updateAuthData = (data?: ISessionWithUser) => {
    if (!data) {
      setSession(null);
      clearAuthData();
      return;
    }
    setSession(data);
    setAuthData(data);
  };

  const clearSession = () => {
    updateAuthData();
  };

  return {
    session,
    isLoadingSession,
    setSession,
    setIsLoadingSession,
    updateAuthData,
    clearSession
  };
};

type UseAuthLogicReturn = ReturnType<typeof useAuthLogic>;

export { useAuthLogic };
export type { UseAuthLogicReturn };
