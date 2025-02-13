import { t } from "../createRouter";

const testRouter = t.router({
  get: t.procedure.query(() => {
    return "Hello World!";
  }),
});

export default testRouter;
