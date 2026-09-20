import { NextRequest } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { PostModel } from "@/server/models/post";
import { proxy } from "../proxy";

vi.mock("@/server/models/post", () => ({
	PostModel: { existsBySlug: vi.fn() },
}));

const request = (path: string) =>
	new NextRequest(`https://bearboo.test${path}`);

describe("proxy Unitary Testing", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("lets an existing post through", async () => {
		vi.mocked(PostModel.existsBySlug).mockResolvedValue(true);

		const response = await proxy(request("/post/real-slug"));

		expect(response.headers.get("x-middleware-next")).toBe("1");
		expect(response.headers.get("x-middleware-request-x-url")).toBe(
			"https://bearboo.test/post/real-slug",
		);
	});

	test("rewrites a missing post to the 404 route with status 404", async () => {
		vi.mocked(PostModel.existsBySlug).mockResolvedValue(false);

		const response = await proxy(request("/post/missing-slug"));

		expect(response.status).toBe(404);
		expect(response.headers.get("x-middleware-rewrite")).toContain("/404");
	});

	test("never probes reserved slugs", async () => {
		const response = await proxy(request("/post/create"));

		expect(response.headers.get("x-middleware-next")).toBe("1");
		expect(PostModel.existsBySlug).not.toHaveBeenCalled();
	});

	test("fails open when the probe throws", async () => {
		vi.mocked(PostModel.existsBySlug).mockRejectedValue(new Error("db down"));

		const response = await proxy(request("/post/any-slug"));

		expect(response.headers.get("x-middleware-next")).toBe("1");
	});
});
