import { t } from "../createRouter";
import testRouter from "./test.routes";

export const appRouter = t.mergeRouters(testRouter);

export type AppRouter = typeof appRouter;
