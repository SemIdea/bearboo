import { beforeEach, vi } from "vitest";
import { resetPrismaMock } from "@/test/prisma";

vi.mock("@/server/infra/drivers/prisma", async () => {
	const { prismaMock } = await import("@/test/prisma");

	return { prisma: prismaMock };
});

beforeEach(() => {
	resetPrismaMock();
});
