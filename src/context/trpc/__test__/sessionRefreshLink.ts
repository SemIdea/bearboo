import { TRPCClientError } from "@trpc/client";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AuthErrorCode } from "@/shared/error/auth";
import { SessionErrorCode } from "@/shared/error/session";

vi.mock("@/utils/authStorage", () => ({
	clearAuthData: vi.fn(),
}));

vi.mock("../session", () => ({
	refreshTokens: vi.fn(),
	setTRPCClientInstance: vi.fn(),
}));

const { clearAuthData } = await import("@/utils/authStorage");
const { refreshTokens } = await import("../session");
const { sessionRefreshLink } = await import("../sessionRefreshLink");

type IFakeObserver = {
	next: (value: unknown) => void;
	error: (err: unknown) => void;
	complete: () => void;
};

const fakeObservable = (emit: (observer: IFakeObserver) => void) => ({
	subscribe: (observer: IFakeObserver) => {
		emit(observer);
		return { unsubscribe: vi.fn() };
	},
});

const errorWith = (code: string, message: string) =>
	new TRPCClientError(message, {
		result: { error: { data: { code }, message } },
	});

const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

const fakeOp = {
	id: 1,
	type: "query",
	input: undefined,
	path: "post.readRecent",
	context: {},
	signal: null,
} as never;

describe("sessionRefreshLink", () => {
	beforeEach(() => {
		vi.stubGlobal("window", { location: { href: "" } });
		vi.mocked(refreshTokens).mockReset();
		vi.mocked(clearAuthData).mockReset();
	});

	test("passes a successful value through untouched", () => {
		const value = { result: { data: { json: { ok: true } } } };
		const next = vi.fn().mockReturnValue(
			fakeObservable((observer) => {
				observer.next(value);
				observer.complete();
			}),
		);

		const nextSpy = vi.fn();
		const link = sessionRefreshLink({})({ op: fakeOp, next });
		link.subscribe({ next: nextSpy, error: vi.fn(), complete: vi.fn() });

		expect(nextSpy).toHaveBeenCalledWith(value);
		expect(clearAuthData).not.toHaveBeenCalled();
	});

	test("refreshes the session once and retries on SESSION_EXPIRED", async () => {
		const retriedValue = { result: { data: { json: { ok: true } } } };
		const expiredError = errorWith(
			"UNAUTHORIZED",
			SessionErrorCode.SESSION_EXPIRED,
		);

		const next = vi
			.fn()
			.mockReturnValueOnce(
				fakeObservable((observer) => observer.error(expiredError)),
			)
			.mockReturnValueOnce(
				fakeObservable((observer) => {
					observer.next(retriedValue);
					observer.complete();
				}),
			);
		vi.mocked(refreshTokens).mockResolvedValue(undefined);

		const nextSpy = vi.fn();
		const errorSpy = vi.fn();
		const link = sessionRefreshLink({})({ op: fakeOp, next });
		link.subscribe({ next: nextSpy, error: errorSpy, complete: vi.fn() });

		await flushMicrotasks();

		expect(refreshTokens).toHaveBeenCalledTimes(1);
		expect(next).toHaveBeenCalledTimes(2);
		expect(nextSpy).toHaveBeenCalledWith(retriedValue);
		expect(errorSpy).not.toHaveBeenCalled();
	});

	test("clears auth and redirects to login when the refresh itself fails", async () => {
		const expiredError = errorWith(
			"UNAUTHORIZED",
			SessionErrorCode.SESSION_EXPIRED,
		);
		const next = vi
			.fn()
			.mockReturnValue(
				fakeObservable((observer) => observer.error(expiredError)),
			);
		vi.mocked(refreshTokens).mockRejectedValue(new Error("no refresh token"));

		const errorSpy = vi.fn();
		const link = sessionRefreshLink({})({ op: fakeOp, next });
		link.subscribe({ next: vi.fn(), error: errorSpy, complete: vi.fn() });

		await flushMicrotasks();

		expect(clearAuthData).toHaveBeenCalledTimes(1);
		expect(window.location.href).toBe("/auth/login");
		expect(errorSpy).toHaveBeenCalledWith(expiredError);
	});

	test("clears auth and redirects to login on INVALID_TOKEN", () => {
		const invalidTokenError = errorWith(
			"UNAUTHORIZED",
			SessionErrorCode.INVALID_TOKEN,
		);
		const next = vi
			.fn()
			.mockReturnValue(
				fakeObservable((observer) => observer.error(invalidTokenError)),
			);

		const errorSpy = vi.fn();
		const link = sessionRefreshLink({})({ op: fakeOp, next });
		link.subscribe({ next: vi.fn(), error: errorSpy, complete: vi.fn() });

		expect(clearAuthData).toHaveBeenCalledTimes(1);
		expect(window.location.href).toBe("/auth/login");
		expect(errorSpy).toHaveBeenCalledWith(invalidTokenError);
	});

	test("lets INVALID_CREDENTIALS pass through without side effects", () => {
		const invalidCredentialsError = errorWith(
			"UNAUTHORIZED",
			AuthErrorCode.INVALID_CREDENTIALS,
		);
		const next = vi
			.fn()
			.mockReturnValue(
				fakeObservable((observer) => observer.error(invalidCredentialsError)),
			);

		const errorSpy = vi.fn();
		const link = sessionRefreshLink({})({ op: fakeOp, next });
		link.subscribe({ next: vi.fn(), error: errorSpy, complete: vi.fn() });

		expect(clearAuthData).not.toHaveBeenCalled();
		expect(window.location.href).toBe("");
		expect(errorSpy).toHaveBeenCalledWith(invalidCredentialsError);
	});

	test("redirects to /auth/verify on USER_NOT_VERIFIED without swallowing the error", () => {
		const notVerifiedError = errorWith(
			"FORBIDDEN",
			AuthErrorCode.USER_NOT_VERIFIED,
		);
		const next = vi
			.fn()
			.mockReturnValue(
				fakeObservable((observer) => observer.error(notVerifiedError)),
			);

		const errorSpy = vi.fn();
		const link = sessionRefreshLink({})({ op: fakeOp, next });
		link.subscribe({ next: vi.fn(), error: errorSpy, complete: vi.fn() });

		expect(window.location.href).toBe("/auth/verify");
		expect(errorSpy).toHaveBeenCalledWith(notVerifiedError);
	});
});
