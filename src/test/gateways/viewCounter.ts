import {
	IViewCounterGatewayAdapter,
	IViewEvent,
} from "@/server/integrations/gateway/viewCounter/adapter";

class FakeViewCounterGateway implements IViewCounterGatewayAdapter {
	private readonly seenVisitors = new Set<string>();
	private readonly pendingCounts = new Map<string, number>();
	private readonly pendingEvents = new Map<string, IViewEvent[]>();

	async recordView(postId: string, visitorId: string, event: IViewEvent) {
		const key = `${postId}:${visitorId}`;

		if (this.seenVisitors.has(key)) return { counted: false };

		this.seenVisitors.add(key);
		this.pendingCounts.set(postId, (this.pendingCounts.get(postId) ?? 0) + 1);
		this.pendingEvents.set(postId, [
			...(this.pendingEvents.get(postId) ?? []),
			event,
		]);

		return { counted: true };
	}

	async drainPendingCounts() {
		const deltas = Object.fromEntries(this.pendingCounts);
		this.pendingCounts.clear();

		return deltas;
	}

	async drainPendingEvents() {
		const events = Object.fromEntries(this.pendingEvents);
		this.pendingEvents.clear();

		return events;
	}
}

export { FakeViewCounterGateway };
