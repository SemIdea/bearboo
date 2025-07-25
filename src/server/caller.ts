import { appRouter } from "./routers/app.routes";
import { createTRPCContext, IProtectedAPIContextDTO } from "./createContext";
import { cookies } from "next/headers";
import { TRPCError } from "@trpc/server";
import { AuthErrorCode } from "@/shared/error/auth";
import { redirect } from "next/navigation";
import { SessionErrorCode } from "@/shared/error/session";

type ICreateDynamicCallerDTO = {
  pathName: string;
};

const createCaller = async () => {
  return appRouter.createCaller(
    await createTRPCContext({
      headers: new Headers()
    })
  );
};

const createDynamicCaller = async ({ pathName }: ICreateDynamicCallerDTO) => {
  const cookieHeader = (await cookies())
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join(";");

  const callerCtx = await createTRPCContext({
    headers: new Headers({ cookie: cookieHeader })
  });

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
    }
  });

  if (!callerCtx.user) {
    redirect(`/auth/login?redirect=${pathName}`);
  }

  return {
    caller,
    ctx: callerCtx as IProtectedAPIContextDTO
  };
};

export { createCaller, createDynamicCaller };
