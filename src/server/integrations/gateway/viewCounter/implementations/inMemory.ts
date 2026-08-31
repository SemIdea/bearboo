import { IViewCounterGatewayAdapter, IViewEvent } from "../adapter";

class InMemoryViewCounterGateway implements IViewCounterGatewayAdapter {
	private readonly visitorsByPostAndDate = new Map<string, Set<string>>();
	private readonly pendingCounts = new Map<string, number>();
	private readonly pendingEvents = new Map<string, IViewEvent[]>();

	async recordView(postId: string, visitorId: string, event: IViewEvent) {
		const dateKey = new Date().toISOString().slice(0, 10);
		const visitorsKey = `${postId}:${dateKey}`;

		const visitors = this.visitorsByPostAndDate.get(visitorsKey) ?? new Set();

		if (visitors.has(visitorId)) return { counted: false };

		visitors.add(visitorId);
		this.visitorsByPostAndDate.set(visitorsKey, visitors);
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

export { InMemoryViewCounterGateway };
