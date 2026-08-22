import { beforeEach, describe, expect, test } from "vitest";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { CategoryRouter } from "../../index";

describe("Create Category Controller Unitary Testing", () => {
	let ctx: IControllerContextDTO;

	beforeEach(async () => {
		ctx = await createAuthenticatedContext({ role: "EDITOR" });
	});

	test("Should create a category with a new name", async () => {
		const result = await CategoryRouter.createCaller(ctx).create({
			name: "Backend",
		});

		expect(result).toBeDefined();
		expect(result.name).toEqual("Backend");
		expect(result.slug).toEqual("backend");
	});

	test("Should return the existing category when the name already exists", async () => {
		const first = await CategoryRouter.createCaller(ctx).create({
			name: "Backend",
		});
		const second = await CategoryRouter.createCaller(ctx).create({
			name: "Backend",
		});

		expect(second.id).toEqual(first.id);
	});

	test("Should allow an admin to create a category", async () => {
		const adminCtx = await createAuthenticatedContext({ role: "ADMIN" });

		const result = await CategoryRouter.createCaller(adminCtx).create({
			name: "Frontend",
		});

		expect(result.name).toEqual("Frontend");
	});

	test("Should reject an author trying to create a category", async () => {
		const authorCtx = await createAuthenticatedContext({ role: "AUTHOR" });

		await expect(
			CategoryRouter.createCaller(authorCtx).create({ name: "Frontend" }),
		).rejects.toMatchObject({
			code: "FORBIDDEN",
			message: "You do not have permission to perform this action.",
		});
	});
});
