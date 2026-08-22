import type { TRPC_ERROR_CODE_KEY } from "@trpc/server";

type ErrorEntry = { httpCode: TRPC_ERROR_CODE_KEY; message: string };

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
	) as { [K in keyof E as `${D}.${string & K}`]: E[K] };
}

export { defineDomainErrors, type ErrorEntry };
