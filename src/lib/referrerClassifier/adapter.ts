type IReferrerBucket = "DIRECT" | "SEARCH" | "SOCIAL" | "OTHER";

type IReferrerClassifierHelperAdapter = {
	classify: (referrer: string | null | undefined) => IReferrerBucket;
};

export type { IReferrerBucket, IReferrerClassifierHelperAdapter };
