import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { AuthErrorCode } from "@/shared/error/auth";
import { SessionErrorCode } from "@/shared/error/session";
import { Context } from "./createContext";
import {
	SESSION_IDLE_TIMEOUT_MS,
	SESSION_MAX_LIFETIME_MS,
} from "./features/auth/constants";

const t = initTRPC.context<Context>().create({
	transformer: superjson,
	errorFormatter(opts) {
		const { shape, error } = opts;
		return {
			...shape,
			data: {
				...shape.data,
				zodError:
					error.code === "BAD_REQUEST" && error.cause instanceof ZodError
						? error.cause.flatten()
						: null,
			},
		};
	},
});

const publicProcedure = t.procedure.use(async ({ ctx, next }) => {
	const user = ctx.user;

	if (!user) return next();
	if (!user.session) return next();

	const sessionUpdatedDate = new Date(user.session.updatedAt);
	const sessionCreatedDate = new Date(user.session.createdAt);
	const now = Date.now();

	const isIdle = now - sessionUpdatedDate.getTime() > SESSION_IDLE_TIMEOUT_MS;
	const isPastMaxLifetime =
		now - sessionCreatedDate.getTime() > SESSION_MAX_LIFETIME_MS;

	if (isIdle || isPastMaxLifetime) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: SessionErrorCode.SESSION_EXPIRED,
		});
	}

	return next({
		ctx: {
			user: user,
		},
	});
});

const assertRateLimit = async (
	ctx: Context,
	key: string,
	limit: { max: number; windowMs: number },
) => {
	const { allowed } = await ctx.helpers.rateLimit.consume(key, limit);

	if (!allowed) {
		throw new TRPCError({
			code: "TOO_MANY_REQUESTS",
			message: AuthErrorCode.TOO_MANY_ATTEMPTS,
		});
	}
};

const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
	if (!ctx.user) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: AuthErrorCode.USER_NOT_LOGGED_IN,
		});
	}

	return next({
		ctx: {
			user: ctx.user,
		},
	});
});

const verifiedProcedure = protectedProcedure.use(async ({ ctx, next }) => {
	if (!ctx.user.verified) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: AuthErrorCode.USER_NOT_VERIFIED,
		});
	}

	return next({
		ctx: {
			user: ctx.user,
		},
	});
});

export {
	assertRateLimit,
	protectedProcedure,
	publicProcedure,
	t,
	verifiedProcedure,
};
