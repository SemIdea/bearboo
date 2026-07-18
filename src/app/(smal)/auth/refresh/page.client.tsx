"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { refreshTokens } from "@/context/trpc/session";

const SessionRefresher = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const redirect = searchParams.get("redirect") || "/";

	useEffect(() => {
		refreshTokens()
			.then(() => router.push(redirect))
			.catch(() => router.push("/auth/login"));
	}, [redirect]);

	return null;
};

export default SessionRefresher;
