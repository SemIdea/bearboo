import { useState } from "react";
import { IUserEntity } from "@/server/models/user";

type IClientSession = { user: Omit<IUserEntity, "password"> };

const useAuthLogic = () => {
	const [isLoadingSession, setIsLoadingSession] = useState(true);
	const [session, setSession] = useState<IClientSession | null>(null);

	const updateAuthData = (data?: IClientSession) => {
		setSession(data ?? null);
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
		clearSession,
	};
};

type UseAuthLogicReturn = ReturnType<typeof useAuthLogic>;

export type { IClientSession, UseAuthLogicReturn };
export { useAuthLogic };
