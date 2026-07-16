import { IViewCounterGatewayAdapter } from "@/server/integrations/gateway/viewCounter/adapter";

class FakeViewCounterGateway implements IViewCounterGatewayAdapter {
	private readonly seenVisitors = new Set<string>();
	private readonly pendingCounts = new Map<string, number>();

	async recordView(postId: string, visitorId: string) {
		const key = `${postId}:${visitorId}`;

		if (this.seenVisitors.has(key)) return { counted: false };

		this.seenVisitors.add(key);
		this.pendingCounts.set(postId, (this.pendingCounts.get(postId) ?? 0) + 1);

		return { counted: true };
	}

	async drainPendingCounts() {
		const deltas = Object.fromEntries(this.pendingCounts);
		this.pendingCounts.clear();

		return deltas;
	}
}

export { FakeViewCounterGateway };
