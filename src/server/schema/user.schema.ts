import { z } from "zod";

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
    .email("Invalid Email or password"),
  password: z
    .string({
      required_error: "Password is required"
    })
    .min(8, "Invalid Email or password")
});

const getUserProfileSchema = z.object({
  userId: z.string()
});

const getUserPostsSchema = z.object({
  userId: z.string()
});

type CreateUserInput = z.TypeOf<typeof registerUserSchema>;
type LoginUserInput = z.TypeOf<typeof loginUserSchema>;
type GetUserProfileInput = z.TypeOf<typeof getUserProfileSchema>;
type GetUserPostsInput = z.TypeOf<typeof getUserPostsSchema>;

export {
  verifyUserSchema,
  registerUserSchema,
  loginUserSchema,
  getUserProfileSchema,
  getUserPostsSchema
};
export type {
  CreateUserInput,
  LoginUserInput,
  GetUserProfileInput,
  GetUserPostsInput
};
