import { IAPIContextDTO } from "@/server/createContext";
import {
  ResetPasswordInput,
  SendResetPasswordEmailInput
} from "@/server/schema/resetPassword.schema";
import { ResetPasswordService, SendResetPasswordEmailService } from "./service";

const sendResetPasswordEmailController = ({
  input,
  ctx
}: {
  input: SendResetPasswordEmailInput;
  ctx: IAPIContextDTO;
}) => {
  const resetToken = SendResetPasswordEmailService({
    email: input.email,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.user
    },
    helpers: ctx.helpers,
    gateways: ctx.gateways
  });

  return resetToken;
};

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

export { sendResetPasswordEmailController, resetPasswordController };
