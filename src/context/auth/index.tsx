"use client";

import { createContext, useContext, useEffect } from "react";
import { useAuthLogic, UseAuthLogicReturn } from "./index.hook";
import { ISessionWithUser } from "@/server/entities/session/DTO";

const AuthContext = createContext<UseAuthLogicReturn>({} as UseAuthLogicReturn);

type ChatProviderProps = {
  children: React.ReactNode;
};

const Authprovider = ({ children }: ChatProviderProps) => {
  const {
    session,
    isLoadingSession,
    setIsLoadingSession,
    setSession,
    updateAuthData,
    clearSession
  } = useAuthLogic();

  useEffect(() => {
    const [_, sessionCookie] = ["accessToken=", "session="].map(
      (key) =>
        document.cookie
          .split("; ")
          .find((row) => row.startsWith(key))
          ?.split("=")[1]
    );

    if (sessionCookie) {
      const session = JSON.parse(sessionCookie) as ISessionWithUser;

      setSession(session);
    }

    setIsLoadingSession(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoadingSession,
        setIsLoadingSession,
        setSession,
        updateAuthData,
        clearSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export { Authprovider, useAuth };
