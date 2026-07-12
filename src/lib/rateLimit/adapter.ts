type IRateLimitHelperAdapter = {
	consume: (
		key: string,
		opts: { max: number; windowMs: number },
	) => Promise<{ allowed: boolean }>;
};

export type { IRateLimitHelperAdapter };
