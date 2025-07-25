import { z } from "zod";
import { AuthErrorCode } from "@/shared/error/auth";

const verifyUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z.string().min(8)
});

const registerUserSchema = z.object({
  email: z
    .string({
      required_error: "Email is required"
    })
    .email("Invalid Email"),
  name: z
    .string({
      required_error: "Name is required"
    })
    .min(3, "Name must be at least 3 characters long"),
  password: z
    .string({
      required_error: "Password is required"
    })
    .min(8, "Password must be at least 8 characters long")
});

const loginUserSchema = z.object({
  email: z
    .string({
      required_error: "Email is required"
    })
    .email(AuthErrorCode.INVALID_CREDENTIALS),
  password: z
    .string({
      required_error: "Password is required"
    })
    .min(8, AuthErrorCode.INVALID_CREDENTIALS)
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
        required_error: "Name is required"
      })
      .min(3, "Name must be at least 3 characters long"),
    email: z
      .string({
        required_error: "Email is required"
      })
      .email("Invalid email format"),
    bio: z
      .string({
        required_error: "Bio is required",
        invalid_type_error: "Bio must be a string"
      })
      .max(500, "Bio must be at most 500 characters long")
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
