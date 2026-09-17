import { describe, expect, it, vi } from "vitest";
import { prismaMock } from "@/test/prisma";
import packageJson from "../../../../../package.json";
import { GET } from "../route";

const queryRaw = vi.fn();

Object.assign(prismaMock, { $queryRaw: queryRaw });

describe("GET /api/health", () => {
	it("returns 200 with the connected payload when the probe resolves", async () => {
		queryRaw.mockResolvedValueOnce([{ "?column?": 1 }]);

		const response = await GET();

		expect(response.status).toBe(200);
		expect(response.headers.get("cache-control")).toBe("no-store");
		await expect(response.json()).resolves.toEqual({
			status: "ok",
			database: "connected",
			version: packageJson.version,
		});
	});

	it("returns 503 with the degraded payload when the probe throws", async () => {
		queryRaw.mockRejectedValueOnce(new Error("Connection refused"));

		const response = await GET();

		expect(response.status).toBe(503);
		expect(response.headers.get("cache-control")).toBe("no-store");

		const body = await response.json();

		expect(body).toEqual({
			status: "degraded",
			database: "disconnected",
			version: packageJson.version,
		});
		expect(JSON.stringify(body)).not.toContain("Connection refused");
	});
});
