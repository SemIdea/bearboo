import type { EmitMeta, LogFields } from "./types";

type Renderer = (meta: EmitMeta, fields: LogFields) => string;

// Production: one JSON object per line — machine-parseable (12-Factor event
// stream). The base meta and the accumulated fields flatten into one record.
const renderJson: Renderer = (meta, fields) =>
	JSON.stringify({ ...meta, ...fields });

// Development: a compact human-readable line. The optional meta ids join the
// accumulated fields so they show up too. A multi-line stack is pulled out of the
// inline fields and printed below, so the line stays one line (JSON keeps the
// stack as a normal escaped field).
const renderPretty: Renderer = (meta, fields) => {
	const head = `[${meta.level}] ${meta.path} ${meta.durationMs}ms ok=${meta.ok}`;
	const rest: LogFields = { ...fields };

	if (meta.userId) rest.userId = meta.userId;
	if (meta.visitorId) rest.visitorId = meta.visitorId;

	const stack =
		typeof rest["error.stack"] === "string" ? rest["error.stack"] : null;
	delete rest["error.stack"];

	const extra = Object.entries(rest)
		.map(([key, value]) => `${key}=${value}`)
		.join(" ");

	const line = extra ? `${head} ${extra}` : head;

	return stack ? `${line}\n${stack}` : line;
};

// Renderer chosen by environment (ADR-0022 D2), the last step of the pipeline.
const pickRenderer = (nodeEnv: string): Renderer =>
	nodeEnv === "production" ? renderJson : renderPretty;

export { pickRenderer, renderJson, renderPretty };
