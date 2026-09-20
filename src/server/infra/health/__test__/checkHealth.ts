import { describe, expect, it, vi } from "vitest";
import { prismaMock } from "@/test/prisma";
import { checkHealth } from "../checkHealth";

const queryRaw = vi.fn();

Object.assign(prismaMock, { $queryRaw: queryRaw });

describe("checkHealth", () => {
	it("reports connected when the probe resolves", async () => {
		queryRaw.mockResolvedValueOnce([{ "?column?": 1 }]);

		await expect(checkHealth()).resolves.toEqual({ database: "connected" });
		expect(queryRaw).toHaveBeenCalledTimes(1);
	});

	it("reports disconnected when the probe throws", async () => {
		queryRaw.mockRejectedValueOnce(new Error("Connection refused"));

		await expect(checkHealth()).resolves.toEqual({ database: "disconnected" });
	});
});
