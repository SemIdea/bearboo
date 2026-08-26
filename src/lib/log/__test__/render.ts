import { describe, expect, test } from "vitest";
import { pickRenderer, renderJson, renderPretty } from "../render";
import type { EmitMeta } from "../types";

const meta: EmitMeta = {
	level: "info",
	ok: true,
	path: "user.login",
	durationMs: 5,
};

describe("renderJson", () => {
	test("emits a single JSON object with meta and fields flattened", () => {
		const line = renderJson(meta, { userId: "u1" });

		expect(JSON.parse(line)).toEqual({
			level: "info",
			ok: true,
			path: "user.login",
			durationMs: 5,
			userId: "u1",
		});
	});
});

describe("renderPretty", () => {
	test("emits a human-readable line", () => {
		const line = renderPretty(meta, { step: "one" });

		expect(line).toBe("[info] user.login 5ms ok=true step=one");
	});

	test("keeps the head on one line and prints a stack below it", () => {
		const line = renderPretty(meta, {
			"error.code": "boom",
			"error.stack": "Error: boom\n    at a\n    at b",
		});
		const [head, ...stackLines] = line.split("\n");

		expect(head).toBe("[info] user.login 5ms ok=true error.code=boom");
		expect(stackLines.join("\n")).toBe("Error: boom\n    at a\n    at b");
	});
});

describe("pickRenderer", () => {
	test("JSON in production, pretty otherwise", () => {
		expect(pickRenderer("production")).toBe(renderJson);
		expect(pickRenderer("development")).toBe(renderPretty);
	});
});
