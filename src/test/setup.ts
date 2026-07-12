import { beforeEach, vi } from "vitest";
import { InMemoryRateLimit } from "@/lib/rateLimit/implementations/inMemory";
import { helpers } from "@/server/infra/container/helpers";
import { resetPrismaMock } from "@/test/prisma";

vi.mock("@/server/infra/drivers/prisma", async () => {
	const { prismaMock } = await import("@/test/prisma");

	return { prisma: prismaMock };
});

beforeEach(() => {
	resetPrismaMock();
	(helpers.rateLimit as InMemoryRateLimit).reset();
});
