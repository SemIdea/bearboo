"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./index";

const useRequireAuth = () => {
	const router = useRouter();
	const { session, isLoadingSession } = useAuth();

	useEffect(() => {
		if (!isLoadingSession && !session) {
			router.push("/auth/login");
		}
	}, [isLoadingSession, session, router]);

	return session;
};

export { useRequireAuth };
