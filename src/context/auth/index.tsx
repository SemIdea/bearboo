"use client";

import { createContext, useContext, useEffect } from "react";
import { trpc } from "@/app/_trpc/client";
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

	const { data, isFetched } = trpc.auth.session.me.useQuery(undefined, {
		retry: false,
	});

	useEffect(() => {
		if (!isFetched) return;

		setSession(data ?? null);
		setIsLoadingSession(false);
	}, [data, isFetched]);

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
