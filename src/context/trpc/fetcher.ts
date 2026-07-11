import { AuthErrorCode } from "@/shared/error/auth";
import { SessionErrorCode } from "@/shared/error/session";
import { clearAuthData } from "@/utils/authStorage";
import { refreshTokens } from "./session";

type ITRPCBatchErrorBody = Array<{
	error?: { json?: { message?: string } };
}>;

// httpBatchLink sempre envolve a resposta num array (mesmo pra 1 chamada);
// o SessionErrorCode/AuthErrorCode vai em error.json.message (superjson), não em error.code.
const extractSessionErrorCode = (body: ITRPCBatchErrorBody): string | null =>
	body.find((entry) => entry.error)?.error?.json?.message ?? null;

const customFetcher: typeof fetch = async (info, options) => {
	let hasRetried = false;
	let response = await fetch(info, options);

	if (response.status === 401 && !hasRetried) {
		hasRetried = true;

		const clone = response.clone();
		let errorCode: string | null = null;

		try {
			const body = (await clone.json()) as ITRPCBatchErrorBody;
			errorCode = extractSessionErrorCode(body);
		} catch {
			errorCode = SessionErrorCode.INVALID_TOKEN;
		}

		switch (errorCode) {
			case SessionErrorCode.SESSION_EXPIRED:
				try {
					await refreshTokens();
					response = await fetch(info, options); // retry after refresh
				} catch {
					clearAuthData();
					window.location.href = "/auth/login";
					return response;
				}
				break;

			case SessionErrorCode.INVALID_TOKEN:
				clearAuthData();
				window.location.href = "/auth/login";
				return response;

			case AuthErrorCode.INVALID_CREDENTIALS:
				break; // do nothing, allow error
		}
	}

	if (response.status === 403) {
		window.location.href = "/auth/verify";
	}

	return response;
};

export { customFetcher, extractSessionErrorCode };
