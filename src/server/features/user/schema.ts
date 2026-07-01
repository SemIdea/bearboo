import { z } from "zod";

const registerUserSchema = z.object({
  email: z.email("Invalid email address."),
  name: z.string().min(3, "Name must be at least 3 characters long."),
  password: z.string().min(8, "Password must be at least 8 characters long.")
});

const loginUserSchema = z.object({
  email: z.email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters long.")
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
    name: z.string().min(3, "Name must be at least 3 characters long."),
    email: z.email("Invalid email address."),
    bio: z.string().max(500, "Bio must not exceed 500 characters.")
  })
  .partial();

type CreateUserInput = z.TypeOf<typeof registerUserSchema>;
type LoginUserInput = z.TypeOf<typeof loginUserSchema>;
type ReadUserProfileInput = z.TypeOf<typeof readUserProfileSchema>;
type ReadUserPostsInput = z.TypeOf<typeof readUserPostsSchema>;
type ReadUserCommentsInput = z.TypeOf<typeof readUserCommentsSchema>;
type UpdateUserProfileInput = z.TypeOf<typeof updateUserProfileSchema>;

export {
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
