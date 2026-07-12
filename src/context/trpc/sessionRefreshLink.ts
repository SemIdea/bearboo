import { TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import { AppRouter } from "@/server/routers/app.routes";
import { AuthErrorCode } from "@/shared/error/auth";
import { SessionErrorCode } from "@/shared/error/session";
import { refreshTokens } from "./session";

const redirectTo = (path: string): void => {
	window.location.href = path;
};

// httpBatchLink já entrega TRPCClientError tipado aqui (err.data.code / err.message,
// lidos por @trpc/client de cause.error.data / cause.error.message) — não é mais
// preciso reimplementar o parsing do envelope JSON cru como o antigo customFetcher fazia.
const sessionRefreshLink: TRPCLink<AppRouter> = () => {
	return ({ op, next }) => {
		return observable((observer) => {
			let hasRetried = false;

			const subscribe = () =>
				next(op).subscribe({
					next: (value) => observer.next(value),
					complete: () => observer.complete(),
					error: (err) => {
						const code = err.data?.code;
						const message = err.message;

						if (
							code === "UNAUTHORIZED" &&
							message === SessionErrorCode.SESSION_EXPIRED &&
							!hasRetried
						) {
							hasRetried = true;
							refreshTokens()
								.then(() => {
									unsubscribe = subscribe();
								})
								.catch(() => {
									redirectTo("/auth/login");
									observer.error(err);
								});
							return;
						}

						if (
							code === "UNAUTHORIZED" &&
							message === SessionErrorCode.INVALID_TOKEN
						) {
							redirectTo("/auth/login");
						}

						if (
							code === "FORBIDDEN" &&
							message === AuthErrorCode.USER_NOT_VERIFIED
						) {
							redirectTo("/auth/verify");
						}

						observer.error(err);
					},
				});

			let unsubscribe = subscribe();

			return () => unsubscribe.unsubscribe();
		});
	};
};

export { sessionRefreshLink };
