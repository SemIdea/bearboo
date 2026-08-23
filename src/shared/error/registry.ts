type ErrorLevel = "fatal" | "error" | "warn" | "info";

// What a domain declares about its own failure. Deliberately says nothing
// about transport: how this becomes an HTTP or tRPC code is one consumer's
// opinion and lives with that consumer (`src/server/http/appErrorTransport.ts`),
// which is why nothing under `src/shared/` imports from `@trpc/*`.
type ErrorEntry = {
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
