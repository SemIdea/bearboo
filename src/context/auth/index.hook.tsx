import { Session } from "@prisma/client";
import { useState } from "react";
import { trpc } from "@/app/_trpc/client";

const useAuthLogic = () => {
  const [session, setSession] = useState<Partial<Session> | null>(null);

  const login = () => { };

  const { mutate: register } = trpc.auth.registerUser.useMutation({
    onSuccess: (data) => {
      setSession(data);
      document.cookie = `accessToken=${data.accessToken}; path=/;`;
      localStorage.setItem("refreshToken", data.refreshToken);
    },
  });

  const logout = () => { };

  const { mutate: refreshSession } = trpc.auth.refreshSession.useMutation({
    onSuccess: (data) => {
      setSession(data);
      document.cookie = `accessToken=${data.accessToken}; path=/;`;
      localStorage.setItem("refreshToken", data.refreshToken);
    }
  })

  return { session, login, register, logout, refreshSession };
};

type UseAuthLogicReturn = ReturnType<typeof useAuthLogic>;

export { useAuthLogic };
export type { UseAuthLogicReturn };
