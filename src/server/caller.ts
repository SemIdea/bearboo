import { TRPCError } from "@trpc/server";
import { cookies, headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { AuthErrorCode } from "@/shared/error/auth";
import { SessionErrorCode } from "@/shared/error/session";
import { createTRPCContext, IProtectedAPIContextDTO } from "./createContext";
import { appRouter } from "./routers/app.routes";

const createCaller = async () => {
	return appRouter.createCaller(
		await createTRPCContext({
			headers: new Headers(),
		}),
	);
};

const createDynamicCaller = async () => {
	const headers = await nextHeaders();
	const cookieHeader = (await cookies())
		.getAll()
		.map(({ name, value }) => `${name}=${value}`)
		.join(";");

	const callerCtx = await createTRPCContext({
		headers: new Headers({ cookie: cookieHeader }),
	});

	const url = new URL(headers.get("x-url")!);
	const pathName = url.pathname;

	const caller = appRouter.createCaller(callerCtx, {
		onError: ({ error }) => {
			if (error instanceof TRPCError) {
				switch (error.message) {
					case AuthErrorCode.USER_NOT_LOGGED_IN:
						redirect(`/auth/login?redirect=${pathName}`);
						break;
					case SessionErrorCode.SESSION_EXPIRED:
						redirect(`/auth/refresh?redirect=${pathName}`);
						break;
					default:
						console.error("Unexpected error:", error);
						throw error;
				}
			}
		},
	});

	if (!callerCtx.user) {
		redirect(`/auth/login?redirect=${pathName}`);
	}

	return {
		caller,
		ctx: callerCtx as IProtectedAPIContextDTO,
	};
};

export { createCaller, createDynamicCaller };
