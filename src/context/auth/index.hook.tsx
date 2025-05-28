import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import { ISessionWithUser } from "@/server/entities/session/DTO";
import { setAuthData, clearAuthData } from "@/utils/authStorage";

const useAuthLogic = () => {
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [session, setSession] = useState<ISessionWithUser | null>(null);
  const router = useRouter();

  const updateAuthData = (data?: ISessionWithUser) => {
    if (!data) {
      setSession(null);
      clearAuthData();

      return;
    }
    setSession(data);
    setAuthData(data);
    router.push("/");
  };

  const { mutate: login } = trpc.auth.loginUser.useMutation({
    onSuccess: (data) => setAuthData(data),
  });

  const { mutate: register } = trpc.auth.registerUser.useMutation({
    onSuccess: (data) => updateAuthData(data),
  });

  const { mutate: logout } = trpc.auth.session.logout.useMutation({
    onSuccess: () => {
      clearAuthData();
      setSession(null);
      router.push("/");
    },
  });

  return {
    session,
    isLoadingSession,
    setSession,
    setIsLoadingSession,
    login,
    register,
    logout,
  };
};

type UseAuthLogicReturn = ReturnType<typeof useAuthLogic>;

export { useAuthLogic };
export type { UseAuthLogicReturn };
