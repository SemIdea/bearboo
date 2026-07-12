"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { trpc } from "@/app/_trpc/client";

const SessionRefresher = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const redirect = searchParams.get("redirect") || "/";

	const { mutate: refreshSession } = trpc.auth.refreshSession.useMutation({
		onSuccess: () => {
			router.push(redirect);
		},
		onError: () => {
			router.push("/auth/login");
		},
	});

	useEffect(() => {
		refreshSession();
	}, [redirect]);

	return null;
};

export default SessionRefresher;
