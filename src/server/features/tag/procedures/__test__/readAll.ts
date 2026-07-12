import { beforeEach, describe, expect, test } from "vitest";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { TagRouter } from "../../index";

describe("Read All Tags Controller Unitary Testing", () => {
	let ctx: IControllerContextDTO;

	beforeEach(async () => {
		ctx = await createAuthenticatedContext();
	});

	test("Should list all created tags", async () => {
		await TagRouter.createCaller(ctx).create({ name: "prisma" });
		await TagRouter.createCaller(ctx).create({ name: "trpc" });

		const result = await TagRouter.createCaller(ctx).readAll();

		expect(result).toHaveLength(2);
		expect(result.map((tag) => tag.name).sort()).toEqual(["prisma", "trpc"]);
	});
});
