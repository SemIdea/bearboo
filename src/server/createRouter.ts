import { initTRPC } from "@trpc/server";

import { Context } from "./createContext";

export const t = initTRPC.context<Context>().create();
