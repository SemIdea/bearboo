import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { NextRequest } from "next/server";
import { Context, createTRPCContext } from "@/server/createContext";
import { serializeCookie } from "@/server/http/serializeCookie";
import { appRouter } from "@/server/routers/app.routes";
import { logBoundaryError } from "@/shared/error/boundaryLog";

const createContext = async (req: NextRequest) => {
	return createTRPCContext({
		headers: req.headers,
	});
};

const handler = (req: NextRequest) => {
	let capturedCtx: Context | undefined;

	return fetchRequestHandler({
		endpoint: "/api/trpc",
		req,
		router: appRouter,
		createContext: async () => {
			const ctx = await createContext(req);
			capturedCtx = ctx;
			return ctx;
		},
		responseMeta: () => {
			if (!capturedCtx?.resCookies.pending.length) return {};

			const headers = new Headers();
			const secure = process.env.NODE_ENV === "production";

			for (const cookie of capturedCtx.resCookies.pending) {
				headers.append("set-cookie", serializeCookie(cookie, { secure }));
			}

			return { headers };
		},
		onError: ({ error, path }) => {
			// Single choke point for the bug-vs-recoverable convention:
			// recoverable AppErrors log at their own level; unexpected
			// throws (bugs) log at error with the full stack.
			logBoundaryError(error, { path });
		},
	});
};

export { handler as GET, handler as POST };
