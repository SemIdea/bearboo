import { z } from "zod";
import { AuthErrorCode } from "@/shared/error/auth";
import { UserErrorCode } from "@/shared/error/user";

const verifyUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z.string().min(8)
});

const registerUserSchema = z.object({
  email: z
    .string({
      required_error: AuthErrorCode.EMAIL_REQUIRED
    })
    .email(AuthErrorCode.INVALID_EMAIL),
  name: z
    .string({
      required_error: AuthErrorCode.NAME_REQUIRED
    })
    .min(3, AuthErrorCode.NAME_TOO_SHORT),
  password: z
    .string({
      required_error: AuthErrorCode.PASSWORD_REQUIRED
    })
    .min(8, AuthErrorCode.PASSWORD_TOO_SHORT)
});

const loginUserSchema = z.object({
  email: z
    .string({
      required_error: AuthErrorCode.EMAIL_REQUIRED
    })
    .email(AuthErrorCode.INVALID_EMAIL),
  password: z
    .string({
      required_error: AuthErrorCode.PASSWORD_REQUIRED
    })
    .min(8, AuthErrorCode.PASSWORD_TOO_SHORT)
});

const readUserProfileSchema = z.object({
  id: z.string()
});

const readUserPostsSchema = z.object({
  id: z.string()
});

const readUserCommentsSchema = z.object({
  id: z.string()
});

const updateUserProfileSchema = z
  .object({
    name: z
      .string({
        required_error: UserErrorCode.PROFILE_NAME_REQUIRED
      })
      .min(3, UserErrorCode.PROFILE_NAME_TOO_SHORT),
    email: z
      .string({
        required_error: UserErrorCode.PROFILE_EMAIL_REQUIRED
      })
      .email(UserErrorCode.PROFILE_INVALID_EMAIL),
    bio: z
      .string({
        required_error: UserErrorCode.BIO_REQUIRED,
        invalid_type_error: UserErrorCode.BIO_MUST_BE_STRING
      })
      .max(500, UserErrorCode.BIO_TOO_LONG)
  })
  .partial();

type CreateUserInput = z.TypeOf<typeof registerUserSchema>;
type LoginUserInput = z.TypeOf<typeof loginUserSchema>;
type ReadUserProfileInput = z.TypeOf<typeof readUserProfileSchema>;
type ReadUserPostsInput = z.TypeOf<typeof readUserPostsSchema>;
type ReadUserCommentsInput = z.TypeOf<typeof readUserCommentsSchema>;
type UpdateUserProfileInput = z.TypeOf<typeof updateUserProfileSchema>;

export {
  verifyUserSchema,
  registerUserSchema,
  loginUserSchema,
  readUserProfileSchema,
  readUserPostsSchema,
  readUserCommentsSchema,
  updateUserProfileSchema
};
export type {
  CreateUserInput,
  LoginUserInput,
  ReadUserProfileInput,
  ReadUserPostsInput,
  ReadUserCommentsInput,
  UpdateUserProfileInput
};
