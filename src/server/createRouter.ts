import superjson from "superjson";
import { initTRPC, TRPCError } from "@trpc/server";
import { date, ZodError } from "zod";
import { parseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { Context } from "./createContext";
import { FindUserAndSessionByAccessTokenService } from "./features/auth/session/service";
import { GetTimestampFromID } from "./drivers/snowflake";
import { AuthErrorCode } from "@/shared/error/auth";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

const publicProcedure = t.procedure.use(async ({ ctx, next }) => {
  const cookies = ctx.headers.get("cookie");

  if (!cookies) return next();
  const cookieStore = parseCookie(cookies);
  const accessToken = cookieStore.get("accessToken") || null;

  if (!accessToken) return next();

  const user = await FindUserAndSessionByAccessTokenService({
    accessToken,
    repositories: {
      cache: ctx.repositories.cache,
      user: ctx.repositories.user,
      database: ctx.repositories.session,
    },
  });

  if (!user) return next();
  if (!user.session) return next();

  const sessionCreatedTimestamp = user.session.accessToken
    ? GetTimestampFromID(user.session.accessToken).timestamp
    : null;

  if (!sessionCreatedTimestamp) return next();

  const sessionCreatedDate = new Date(sessionCreatedTimestamp);
  const EXPIRES = 1000 * 20;

  console.log(Date.now() - sessionCreatedDate.getTime());

  if (Date.now() - sessionCreatedDate.getTime() > EXPIRES) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: AuthErrorCode.SESSION_EXPIRED,
    });
  }

  return next({
    ctx: {
      user: user,
    },
  });
});

const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    });
  }

  return next();
});

export { t, publicProcedure, protectedProcedure };
