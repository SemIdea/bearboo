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
    .email("Invalid Email or password"),
  password: z
    .string({
      required_error: "Password is required"
    })
    .min(8, "Invalid Email or password")
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

type CreateUserInput = z.TypeOf<typeof registerUserSchema>;
type LoginUserInput = z.TypeOf<typeof loginUserSchema>;
type ReadUserProfileInput = z.TypeOf<typeof readUserProfileSchema>;
type ReadUserPostsInput = z.TypeOf<typeof readUserPostsSchema>;
type ReadUserCommentsInput = z.TypeOf<typeof readUserCommentsSchema>;

export {
  verifyUserSchema,
  registerUserSchema,
  loginUserSchema,
  readUserProfileSchema,
  readUserPostsSchema,
  readUserCommentsSchema
};
export type {
  CreateUserInput,
  LoginUserInput,
  ReadUserProfileInput,
  ReadUserPostsInput,
  ReadUserCommentsInput
};
