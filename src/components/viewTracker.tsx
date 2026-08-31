"use client";

import { useEffect } from "react";
import { trpc } from "@/app/_trpc/client";

const ViewTracker = ({ postId }: { postId: string }) => {
	const { mutate: recordView } = trpc.analytics.recordView.useMutation();

	useEffect(() => {
		recordView({ postId });
	}, [postId, recordView]);

	return null;
};

export { ViewTracker };
