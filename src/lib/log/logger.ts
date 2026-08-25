import { scrub } from "./redact";
import { pickRenderer } from "./render";
import type { EmitMeta, LogFields, Logger } from "./types";

// A per-call accumulator (ADR-0022 D3). `base` seeds request-scoped fields; `add`
// merges more as the call runs. The `fields` getter exposes the accumulator
// read-only.
const createLogger = (base: LogFields = {}): Logger => {
	const fields: LogFields = { ...base };

	return {
		get fields() {
			return fields;
		},
		add(more: LogFields) {
			Object.assign(fields, more);
		},
	};
};

// Renders the canonical line once and writes it to stdout as one event
// (12-Factor). Scrubs before rendering, so a sensitive key never reaches the sink.
const emit = (logger: Logger, meta: EmitMeta, nodeEnv: string): void => {
	const render = pickRenderer(nodeEnv);
	const line = render(meta, scrub(logger.fields));

	console.log(line);
};

export { createLogger, emit };
