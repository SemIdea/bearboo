import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { createLogger, emit } from "@/lib/log";
import { IRole } from "@/server/models/user";
import { AppError } from "@/shared/error/appError";
import {
	classifyBoundaryError,
	depositBoundaryError,
} from "@/shared/error/boundaryLog";
import { Context } from "./createContext";
import {
	SESSION_IDLE_TIMEOUT_MS,
	SESSION_MAX_LIFETIME_MS,
} from "./features/auth/constants";
import { appErrorToTRPCError } from "./http/appErrorToTRPCError";

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
				domainCode: error.cause instanceof AppError ? error.cause.code : null,
			},
		};
	},
});

// Translates app errors into transport errors for every procedure at once.
//
// Note this inspects the result instead of wrapping `next()` in a try/catch:
// tRPC catches whatever the resolver throws and hands it back as
// `{ ok: false, error }`, already wrapped as an INTERNAL_SERVER_ERROR with the
// original throw as `cause`. So there is nothing to catch here — there is a
// result to re-map.
//
// Mounted first so it wraps everything downstream, guards included.
const withAppErrors = t.middleware(async ({ next }) => {
	const result = await next();

	if (result.ok) return result;

	const translated = appErrorToTRPCError(result.error);

	if (translated) throw translated;

	return result;
});

// Emits one canonical log line per procedure call (ADR-0022). It binds a fresh
// per-call logger (so batched calls do not share fields), times the call, and on
// failure deposits the boundary classification. Mounted outermost, so it sees the
// final transport error and the whole chain's duration.
const withCanonicalLog = t.middleware(async ({ ctx, next, path }) => {
	const log = createLogger();
	const start = Date.now();

	const result = await next({ ctx: { log } });

	const durationMs = Date.now() - start;
	const base = {
		ok: result.ok,
		path,
		durationMs,
		userId: ctx.user?.id,
		visitorId: ctx.visitorId,
	};

	if (result.ok) {
		emit(log, { level: "info", ...base }, ctx.env.nodeEnv);
	} else {
		depositBoundaryError(log, result.error);
		const { level } = classifyBoundaryError(result.error);
		emit(log, { level, ...base }, ctx.env.nodeEnv);
	}

	return result;
});

// The root every procedure derives from. `publicProcedure` adds the session
// check on top; procedures that must run without it (refreshSession) build
// straight from here and still get the error translation.
const baseProcedure = t.procedure.use(withCanonicalLog).use(withAppErrors);

const publicProcedure = baseProcedure.use(async ({ ctx, next }) => {
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
		throw new AppError("session.session_expired");
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
		throw new AppError("auth.too_many_attempts");
	}
};

const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
	if (!ctx.user) {
		throw new AppError("auth.user_not_logged_in");
	}

	return next({
		ctx: {
			user: ctx.user,
		},
	});
});

const verifiedProcedure = protectedProcedure.use(async ({ ctx, next }) => {
	if (!ctx.user.verified) {
		throw new AppError("auth.user_not_verified");
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
			throw new AppError("auth.insufficient_role");
		}

		return next({
			ctx: {
				user: ctx.user,
			},
		});
	});

export {
	assertRateLimit,
	baseProcedure,
	protectedProcedure,
	publicProcedure,
	roleProcedure,
	t,
	verifiedProcedure,
};
