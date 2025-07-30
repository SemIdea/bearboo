import { clearAuthData } from "@/utils/authStorage";
import { SessionErrorCode } from "@/shared/error/session";
import { AuthErrorCode } from "@/shared/error/auth";
import { refreshTokens } from "./session";

const customFetcher: typeof fetch = async (info, options) => {
  let hasRetried = false;
  let response = await fetch(info, options);

  if (response.status === 401 && !hasRetried) {
    hasRetried = true;

    const clone = response.clone();
    let errorCode: string | null = null;

    try {
      const body = (await clone.json()) as {
        error?: { code?: string };
        code?: string;
      };
      errorCode = body.error?.code || body.code || null;
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
      default:
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

export { customFetcher };
