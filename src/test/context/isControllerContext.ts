import { ITestContextDTO, IControllerContextDTO } from "./types";

function isControllerContext(
  ctx: ITestContextDTO
): ctx is IControllerContextDTO {
  return ctx.user !== undefined;
}

export { isControllerContext };
