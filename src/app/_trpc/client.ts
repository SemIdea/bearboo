import { AppRouter } from "@/server/routers/app.routes";
import { createTRPCReact } from "@trpc/react-query";

const trpc = createTRPCReact<AppRouter>();

export { trpc };
