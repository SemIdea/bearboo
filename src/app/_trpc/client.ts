import { createTRPCReact } from "@trpc/react-query";
import { AppRouter } from "@/server/routers/app.routes";

const trpc = createTRPCReact<AppRouter>();

export { trpc };
