import { TRPCClientError } from "@trpc/client";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("../session", () => ({
	refreshTokens: vi.fn(),
	setTRPCClientInstance: vi.fn(),
}));

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

const errorWith = (code: string, message: string, domainCode?: string) =>
	new TRPCClientError(message, {
		result: { error: { data: { code, domainCode }, message } },
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
		vi.stubGlobal("window", { location: { href: "", pathname: "" } });
		vi.mocked(refreshTokens).mockReset();
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
		expect(window.location.href).toBe("");
	});

	test("refreshes the session once and retries on SESSION_EXPIRED", async () => {
		const retriedValue = { result: { data: { json: { ok: true } } } };
		const expiredError = errorWith(
			"UNAUTHORIZED",
			"Your session has expired. Please log in again.",
			"session.session_expired",
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

	test("redirects to login when the refresh itself fails", async () => {
		const expiredError = errorWith(
			"UNAUTHORIZED",
			"Your session has expired. Please log in again.",
			"session.session_expired",
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

		expect(window.location.href).toBe("/auth/login");
		expect(errorSpy).toHaveBeenCalledWith(expiredError);
	});

	test("redirects to login on INVALID_TOKEN", () => {
		const invalidTokenError = errorWith(
			"UNAUTHORIZED",
			"Authentication token is invalid.",
			"session.access_token_invalid",
		);
		const next = vi
			.fn()
			.mockReturnValue(
				fakeObservable((observer) => observer.error(invalidTokenError)),
			);

		const errorSpy = vi.fn();
		const link = sessionRefreshLink({})({ op: fakeOp, next });
		link.subscribe({ next: vi.fn(), error: errorSpy, complete: vi.fn() });

		expect(window.location.href).toBe("/auth/login");
		expect(errorSpy).toHaveBeenCalledWith(invalidTokenError);
	});

	test("lets INVALID_CREDENTIALS pass through without side effects", () => {
		const invalidCredentialsError = errorWith(
			"UNAUTHORIZED",
			"Invalid email or password. Please try again.",
			"auth.invalid_credentials",
		);
		const next = vi
			.fn()
			.mockReturnValue(
				fakeObservable((observer) => observer.error(invalidCredentialsError)),
			);

		const errorSpy = vi.fn();
		const link = sessionRefreshLink({})({ op: fakeOp, next });
		link.subscribe({ next: vi.fn(), error: errorSpy, complete: vi.fn() });

		expect(window.location.href).toBe("");
		expect(errorSpy).toHaveBeenCalledWith(invalidCredentialsError);
	});

	test("does not reload the page when INVALID_TOKEN fires while already on /auth/login (avoids the infinite reload loop when a stale cookie keeps being resent)", () => {
		vi.stubGlobal("window", {
			location: { href: "", pathname: "/auth/login" },
		});
		const invalidTokenError = errorWith(
			"UNAUTHORIZED",
			"Authentication token is invalid.",
			"session.access_token_invalid",
		);
		const next = vi
			.fn()
			.mockReturnValue(
				fakeObservable((observer) => observer.error(invalidTokenError)),
			);

		const errorSpy = vi.fn();
		const link = sessionRefreshLink({})({ op: fakeOp, next });
		link.subscribe({ next: vi.fn(), error: errorSpy, complete: vi.fn() });

		expect(window.location.href).toBe("");
		expect(errorSpy).toHaveBeenCalledWith(invalidTokenError);
	});

	test("redirects to /auth/verify on USER_NOT_VERIFIED without swallowing the error", () => {
		const notVerifiedError = errorWith(
			"FORBIDDEN",
			"Your account is not verified. Please check your email.",
			"auth.user_not_verified",
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
