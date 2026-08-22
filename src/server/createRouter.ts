import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { IRole } from "@/server/models/user";
import { DomainError } from "@/shared/error/domainError";
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
				domainCode:
					error.cause instanceof DomainError ? error.cause.code : null,
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
		const error = new DomainError("session.session_expired");
		throw new TRPCError({
			code: error.httpCode,
			message: error.message,
			cause: error,
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
		const error = new DomainError("auth.too_many_attempts");
		throw new TRPCError({
			code: error.httpCode,
			message: error.message,
			cause: error,
		});
	}
};

const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
	if (!ctx.user) {
		const error = new DomainError("auth.user_not_logged_in");
		throw new TRPCError({
			code: error.httpCode,
			message: error.message,
			cause: error,
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
		const error = new DomainError("auth.user_not_verified");
		throw new TRPCError({
			code: error.httpCode,
			message: error.message,
			cause: error,
		});
	}

	return next({
		ctx: {
			user: ctx.user,
		},
	});
});

const roleProcedure = (allowed: IRole[]) =>
	verifiedProcedure.use(async ({ ctx, next }) => {
		if (!allowed.includes(ctx.user.role)) {
			const error = new DomainError("auth.insufficient_role");
			throw new TRPCError({
				code: error.httpCode,
				message: error.message,
				cause: error,
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
	roleProcedure,
	t,
	verifiedProcedure,
};
