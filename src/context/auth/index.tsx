"use client";

import { createContext, useContext, useEffect } from "react";
import { ISessionWithUser } from "@/server/models/session";
import { UseAuthLogicReturn, useAuthLogic } from "./index.hook";

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
		clearSession,
	} = useAuthLogic();

	useEffect(() => {
		const sessionCookie = document.cookie
			.split("; ")
			.find((row) => row.startsWith("session="))
			?.split("=")[1];

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
				clearSession,
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
