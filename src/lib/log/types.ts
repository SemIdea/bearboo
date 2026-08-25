// The level of a canonical log line. `info` on success; on failure it is the
// error's ErrorLevel (ADR-0017/0018). Kept structurally identical to ErrorLevel
// so a failing line can carry the resolved level without a second vocabulary.
type LogLevel = "fatal" | "error" | "warn" | "info" | "debug";

// Fields accepted on a log line. Scalars only — this is the allowlist by type
// (ADR-0022 D4): code cannot add a raw `input`/`ctx` object, so it cannot dump a
// nested payload of secrets. A sensitive-key scrub is the backstop (redact.ts).
type LogFields = Record<string, string | number | boolean | null>;

// A per-call accumulator. Code enriches the line during the call via `add`; the
// boundary middleware emits `fields` once (ADR-0022 D1/D3).
type Logger = {
	readonly fields: LogFields;
	add(fields: LogFields): void;
};

// The fixed base set the boundary knows about every call, independent of what the
// domain adds. `ok` and `durationMs` are computed by the middleware; the rest come
// from the request context.
type EmitMeta = {
	level: LogLevel;
	ok: boolean;
	path: string;
	durationMs: number;
	userId?: string;
	visitorId?: string;
};

export type { EmitMeta, Logger, LogFields, LogLevel };
