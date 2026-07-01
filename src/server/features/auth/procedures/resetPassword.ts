import { IAPIContextDTO } from "@/server/createContext";
import { ResetPasswordInput } from "../schema";
import { ResetPasswordService } from "../domain/resetPassword";

const resetPasswordController = async ({
  input,
  ctx
}: {
  input: ResetPasswordInput;
  ctx: IAPIContextDTO;
}) => {
  const user = await ResetPasswordService({
    token: input.token,
    newPassword: input.password,
    confirmNewPassword: input.confirmPassword,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.user
    },
    helpers: ctx.helpers
  });

  return user;
};

export { resetPasswordController };
