import { beforeEach, describe, expect, test } from "vitest";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { CategoryRouter } from "../../index";

describe("Read All Categories Controller Unitary Testing", () => {
	let ctx: IControllerContextDTO;

	beforeEach(async () => {
		ctx = await createAuthenticatedContext({ role: "EDITOR" });
	});

	test("Should list all created categories", async () => {
		await CategoryRouter.createCaller(ctx).create({ name: "Backend" });
		await CategoryRouter.createCaller(ctx).create({ name: "Frontend" });

		const result = await CategoryRouter.createCaller(ctx).readAll();

		expect(result).toHaveLength(2);
		expect(result.map((category) => category.name).sort()).toEqual([
			"Backend",
			"Frontend",
		]);
	});
});
