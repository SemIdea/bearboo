import { appRouter } from "./routers/app.routes";
import { createTRPCContext } from "./createContext";
import { cookies } from "next/headers";
import { TRPCError } from "@trpc/server";
import { AuthErrorCode } from "@/shared/error/auth";
import { redirect } from "next/navigation";

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
        if (error.message === AuthErrorCode.SESSION_EXPIRED) {
          redirect(`/auth/refresh?redirect=${pathName}`);
        }
      }
    }
  });

  return {
    caller,
    ctx: callerCtx
  };
};

export { createCaller, createDynamicCaller };
