import type { LogFields } from "./types";

// Keys whose value is always a secret, whatever the caller intended. The scrub is
// the backstop under the LogFields allowlist (ADR-0022 D4) — the primary defense
// is that LogFields accepts scalars only, so an object cannot be dumped.
const SENSITIVE_KEY = /token|password|secret|authorization|cookie/i;

const isScalar = (
	value: unknown,
): value is string | number | boolean | null =>
	value === null ||
	typeof value === "string" ||
	typeof value === "number" ||
	typeof value === "boolean";

// Emit-time guard for rule 13. Drops any field that names a secret, and any
// non-scalar value that was cast past the type. Runs once, at emit.
const scrub = (fields: LogFields): LogFields => {
	const safe: LogFields = {};

	for (const [key, value] of Object.entries(fields)) {
		if (SENSITIVE_KEY.test(key)) continue;
		if (!isScalar(value)) continue;
		safe[key] = value;
	}

	return safe;
};

export { scrub };
