import { createTRPCReact } from "@trpc/react-query";

import { AppRouter } from "@/server/routers/app.routes";

export const trpc = createTRPCReact<AppRouter>();
