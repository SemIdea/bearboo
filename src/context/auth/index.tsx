"use client";

import { createContext, useContext, useEffect } from "react";
import { useAuthLogic, UseAuthLogicReturn } from "./index.hook";

const AuthContext = createContext<UseAuthLogicReturn>({} as UseAuthLogicReturn);

type ChatProviderProps = {
  children: React.ReactNode;
};

const Authprovider = ({ children }: ChatProviderProps) => {
  const { session, setSession, login, register, logout } = useAuthLogic();

  useEffect(() => {
    const sessionCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("session="));

    if (sessionCookie) {
      const session = JSON.parse(sessionCookie.split("=")[1]);
      setSession(session);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        setSession,
        login,
        register,
        logout,
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
