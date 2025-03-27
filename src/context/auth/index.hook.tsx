import { useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { ISessionWithUser } from "@/server/entities/session/DTO";

const useAuthLogic = () => {
  const [session, setSession] = useState<ISessionWithUser | null>(null);

  const { mutate: login } = trpc.auth.loginUser.useMutation({
    onSuccess: (data) => {
      setSession(data);
      document.cookie = `accessToken=${data.accessToken}; path=/;`;
      document.cookie = `session=${JSON.stringify(data)}; path=/;`;
      localStorage.setItem("refreshToken", data.refreshToken);
    },
  });

  const { mutate: register } = trpc.auth.registerUser.useMutation({
    onSuccess: (data) => {
      setSession(data);
      document.cookie = `accessToken=${data.accessToken}; path=/;`;
      document.cookie = `session=${JSON.stringify(data)}; path=/;`;
      localStorage.setItem("refreshToken", data.refreshToken);
    },
  });

  const logout = () => {};

  return { session, setSession, login, register, logout };
};

type UseAuthLogicReturn = ReturnType<typeof useAuthLogic>;

export { useAuthLogic };
export type { UseAuthLogicReturn };
