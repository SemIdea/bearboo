import { beforeEach, describe, expect, test } from "vitest";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { TagRouter } from "../../index";

describe("Create Tag Controller Unitary Testing", () => {
	let ctx: IControllerContextDTO;

	beforeEach(async () => {
		ctx = await createAuthenticatedContext();
	});

	test("Should create a tag with a new name", async () => {
		const result = await TagRouter.createCaller(ctx).create({
			name: "prisma",
		});

		expect(result).toBeDefined();
		expect(result.name).toEqual("prisma");
		expect(result.slug).toEqual("prisma");
	});

	test("Should return the existing tag when the name already exists", async () => {
		const first = await TagRouter.createCaller(ctx).create({
			name: "prisma",
		});
		const second = await TagRouter.createCaller(ctx).create({
			name: "prisma",
		});

		expect(second.id).toEqual(first.id);
	});
});
