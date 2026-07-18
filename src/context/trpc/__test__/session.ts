import { beforeEach, describe, expect, test, vi } from "vitest";
import { refreshTokens, setTRPCClientInstance } from "../session";

describe("refreshTokens", () => {
	beforeEach(() => {
		vi.stubGlobal("window", {});
		setTRPCClientInstance(null as never);
	});

	test("throws when no client instance was set up yet", async () => {
		await expect(refreshTokens()).rejects.toThrowError("No refresh setup");
	});

	test("dedupes concurrent calls into a single network request (guards against React Strict Mode double-invoking the refresh effect, which used to make the second call look like refresh-token reuse and revoke the session)", async () => {
		let resolveMutate: () => void;
		const mutate = vi.fn(
			() =>
				new Promise<void>((resolve) => {
					resolveMutate = resolve;
				}),
		);
		setTRPCClientInstance({
			auth: { refreshSession: { mutate } },
		} as never);

		const first = refreshTokens();
		const second = refreshTokens();

		resolveMutate!();
		await Promise.all([first, second]);

		expect(mutate).toHaveBeenCalledTimes(1);
	});

	test("allows a new refresh after the previous one has settled", async () => {
		const mutate = vi.fn().mockResolvedValue(undefined);
		setTRPCClientInstance({
			auth: { refreshSession: { mutate } },
		} as never);

		await refreshTokens();
		await refreshTokens();

		expect(mutate).toHaveBeenCalledTimes(2);
	});
});
