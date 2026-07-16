import { IViewCounterGatewayAdapter } from "../adapter";

class InMemoryViewCounterGateway implements IViewCounterGatewayAdapter {
	private readonly visitorsByPostAndDate = new Map<string, Set<string>>();
	private readonly pendingCounts = new Map<string, number>();

	async recordView(postId: string, visitorId: string) {
		const dateKey = new Date().toISOString().slice(0, 10);
		const visitorsKey = `${postId}:${dateKey}`;

		const visitors = this.visitorsByPostAndDate.get(visitorsKey) ?? new Set();

		if (visitors.has(visitorId)) return { counted: false };

		visitors.add(visitorId);
		this.visitorsByPostAndDate.set(visitorsKey, visitors);
		this.pendingCounts.set(postId, (this.pendingCounts.get(postId) ?? 0) + 1);

		return { counted: true };
	}

	async drainPendingCounts() {
		const deltas = Object.fromEntries(this.pendingCounts);
		this.pendingCounts.clear();

		return deltas;
	}
}

export { InMemoryViewCounterGateway };
