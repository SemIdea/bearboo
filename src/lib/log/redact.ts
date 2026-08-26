import type { LogFields } from "./types";

// Keys whose value is always a secret, whatever the caller intended. Matching the
// key drops the whole field — the name declares the value sensitive.
const SENSITIVE_KEY = /token|password|secret|authorization|cookie/i;

// Value shapes of known credentials (OpenAI/GitHub/Google/Slack/JWT) — the same
// set rule 13 checks for in `docs/sessions/`. This catches a secret logged under
// an innocent key (`ctx.log.add({ detail: "...ghp_xxx..." })`), which the key
// scrub alone would miss. Each prefix requires a run of following characters, so
// ordinary prose (e.g. "task-force") does not match. The match is masked in place,
// not dropped, so the rest of a legit string survives.
const SECRET_VALUE =
	/sk-[A-Za-z0-9]{16,}|ghp_[A-Za-z0-9]{16,}|AIza[A-Za-z0-9_-]{16,}|xox[baprs]-[A-Za-z0-9-]{10,}|eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+/g;

const isScalar = (value: unknown): value is string | number | boolean | null =>
	value === null ||
	typeof value === "string" ||
	typeof value === "number" ||
	typeof value === "boolean";

// Emit-time guard for rule 13, layered under the LogFields allowlist (ADR-0022 D4).
// Runs once, at emit: drops any field that names a secret, drops any non-scalar
// value cast past the type (no `input`/`ctx` dump), and masks a credential shape
// that slipped into a value under an innocent key.
const scrub = (fields: LogFields): LogFields => {
	const safe: LogFields = {};

	for (const [key, value] of Object.entries(fields)) {
		if (SENSITIVE_KEY.test(key)) continue;
		if (!isScalar(value)) continue;
		safe[key] =
			typeof value === "string"
				? value.replace(SECRET_VALUE, "[redacted]")
				: value;
	}

	return safe;
};

export { scrub };
