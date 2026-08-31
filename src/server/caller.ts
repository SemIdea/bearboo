import { cookies, headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { AppError } from "@/shared/error/appError";
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
			// Logging is owned by the canonical-line middleware (ADR-0022); this
			// hook stays only for the session redirect.
			if (error.cause instanceof AppError) {
				switch (error.cause.code) {
					case "auth.user_not_logged_in":
						redirect(`/auth/login?redirect=${pathName}`);
						break;
					case "session.session_expired":
						redirect(`/auth/refresh?redirect=${pathName}`);
						break;
					default:
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

const createOptionalDynamicCaller = async () => {
	const cookieHeader = (await cookies())
		.getAll()
		.map(({ name, value }) => `${name}=${value}`)
		.join(";");

	return appRouter.createCaller(
		await createTRPCContext({
			headers: new Headers({ cookie: cookieHeader }),
		}),
	);
};

export { createCaller, createDynamicCaller, createOptionalDynamicCaller };
