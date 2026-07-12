import { beforeEach, describe, expect, test } from "vitest";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { PostRouter } from "../../index";

describe("Create Post Controller Unitary Testing", () => {
	let ctx: IControllerContextDTO;

	beforeEach(async () => {
		ctx = await createAuthenticatedContext();
	});

	test("Should create a post successfully", async () => {
		const user = ctx.user;
		const input = {
			title: "Test Post",
			content: "This is a test post content.",
		};

		const result = await PostRouter.createCaller(ctx).create(input);

		expect(result).toBeDefined();
		expect(result.title).toEqual(input.title);
		expect(result.content).toEqual(input.content);
		expect(result.userId).toEqual(user.id);
	});

	test("Should generate a slug derived from the title", async () => {
		const result = await PostRouter.createCaller(ctx).create({
			title: "Como fiz X",
			content: "This is a test post content.",
		});

		expect(result.slug).toEqual("como-fiz-x");
	});

	test("Should append a numeric suffix when the slug already exists", async () => {
		const input = {
			title: "Duplicate Title",
			content: "This is a test post content.",
		};

		const first = await PostRouter.createCaller(ctx).create(input);
		const second = await PostRouter.createCaller(ctx).create(input);

		expect(first.slug).toEqual("duplicate-title");
		expect(second.slug).toEqual("duplicate-title-2");
	});
});
