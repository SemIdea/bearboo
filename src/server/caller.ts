import { appRouter } from "./routers/app.routes";
import { createTRPCContext } from "./createContext";

const createCaller = () => {
  return appRouter.createCaller(createTRPCContext({}));
};

export { createCaller };
