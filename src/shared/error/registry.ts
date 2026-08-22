import type { TRPC_ERROR_CODE_KEY } from "@trpc/server";

type ErrorLevel = "fatal" | "error" | "warn" | "info";

type ErrorEntry = {
	httpCode: TRPC_ERROR_CODE_KEY;
	message: string;
	retryable?: boolean;
	level?: ErrorLevel;
};

// Metadata as every consumer needs it: optional fields already collapsed onto
// their defaults. Resolving here is what keeps `?? false` / `?? "warn"` from
// reappearing at each call site.
type ResolvedErrorEntry = {
	message: string;
	retryable: boolean;
	level: ErrorLevel;
};

const registeredDomains = new Set<string>();

function defineDomainErrors<
	D extends string,
	E extends Record<string, ErrorEntry>,
>(domain: D, errors: E) {
	if (registeredDomains.has(domain)) {
		throw new Error(`ErrorRegistry: domain "${domain}" already registered.`);
	}
	registeredDomains.add(domain);

	return Object.fromEntries(
		Object.entries(errors).map(([code, entry]) => [`${domain}.${code}`, entry]),
	) as {
		[K in keyof E as `${D}.${string & K}`]: E[K] &
			Partial<Pick<ErrorEntry, "retryable" | "level">>;
	};
}

export {
	defineDomainErrors,
	type ErrorEntry,
	type ErrorLevel,
	type ResolvedErrorEntry,
};
