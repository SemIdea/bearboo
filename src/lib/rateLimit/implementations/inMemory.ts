import { IRateLimitHelperAdapter } from "../adapter";

type IWindowState = {
	count: number;
	windowStart: number;
};

class InMemoryRateLimit implements IRateLimitHelperAdapter {
	private readonly windows = new Map<string, IWindowState>();

	async consume(key: string, opts: { max: number; windowMs: number }) {
		const now = Date.now();
		const current = this.windows.get(key);

		if (!current || now - current.windowStart > opts.windowMs) {
			this.windows.set(key, { count: 1, windowStart: now });
			return { allowed: true };
		}

		if (current.count >= opts.max) {
			return { allowed: false };
		}

		current.count += 1;
		return { allowed: true };
	}

	reset() {
		this.windows.clear();
	}
}

export { InMemoryRateLimit };
