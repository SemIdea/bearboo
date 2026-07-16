type IViewCounterGatewayAdapter = {
	recordView: (
		postId: string,
		visitorId: string,
	) => Promise<{ counted: boolean }>;
	drainPendingCounts: () => Promise<Record<string, number>>;
};

export type { IViewCounterGatewayAdapter };
