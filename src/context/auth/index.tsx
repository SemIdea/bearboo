"use client";

import { createContext, useContext } from "react";
import { useAuthLogic, UseAuthLogicReturn } from "./index.hook";

const AuthContext = createContext<UseAuthLogicReturn>({} as UseAuthLogicReturn);

interface ChatProviderProps {
  children: React.ReactNode;
}

const Authprovider = ({ children }: ChatProviderProps) => {
  const { session, login, register, logout } = useAuthLogic();

  return (
    <AuthContext.Provider
      value={{
        session,
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
