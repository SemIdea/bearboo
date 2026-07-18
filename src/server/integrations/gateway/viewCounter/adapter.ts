import { IReferrerBucket } from "@/lib/referrerClassifier/adapter";

type IViewEvent = {
	referrerBucket: IReferrerBucket;
	userAgent: string;
};

type IViewCounterGatewayAdapter = {
	recordView: (
		postId: string,
		visitorId: string,
		event: IViewEvent,
	) => Promise<{ counted: boolean }>;
	drainPendingCounts: () => Promise<Record<string, number>>;
	drainPendingEvents: () => Promise<Record<string, IViewEvent[]>>;
};

export type { IViewCounterGatewayAdapter, IViewEvent };
