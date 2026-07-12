import { z } from "zod";
import { commentEntityWithPostSchema } from "../comment/schema";
import { postEntitySchema } from "../post/schema";

const registerUserSchema = z.object({
	email: z.email("Invalid email address."),
	name: z.string().min(3, "Name must be at least 3 characters long."),
	password: z.string().min(8, "Password must be at least 8 characters long."),
});

const loginUserSchema = z.object({
	email: z.email("Invalid email address."),
	password: z.string().min(8, "Password must be at least 8 characters long."),
});

const readUserProfileSchema = z.object({
	id: z.string(),
});

const readUserPostsSchema = z.object({
	id: z.string(),
});

const readUserCommentsSchema = z.object({
	id: z.string(),
});

const updateUserProfileSchema = z
	.object({
		name: z.string().min(3, "Name must be at least 3 characters long."),
		email: z.email("Invalid email address."),
		bio: z.string().max(500, "Bio must not exceed 500 characters."),
	})
	.partial();

const userWithoutPasswordSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.email(),
	verified: z.boolean(),
	createdAt: z.date(),
	updatedAt: z.date(),
	bio: z.string().nullish(),
});

const loginUserOutputSchema = z.object({
	user: userWithoutPasswordSchema,
});

const registerUserOutputSchema = z.object({
	user: userWithoutPasswordSchema,
});

const readUserProfileOutputSchema = userWithoutPasswordSchema;
const readUserPostsOutputSchema = z.array(postEntitySchema);
const readUserCommentsOutputSchema = z.array(commentEntityWithPostSchema);
const updateUserProfileOutputSchema = userWithoutPasswordSchema;

type CreateUserInput = z.TypeOf<typeof registerUserSchema>;
type LoginUserInput = z.TypeOf<typeof loginUserSchema>;
type ReadUserProfileInput = z.TypeOf<typeof readUserProfileSchema>;
type ReadUserPostsInput = z.TypeOf<typeof readUserPostsSchema>;
type ReadUserCommentsInput = z.TypeOf<typeof readUserCommentsSchema>;
type UpdateUserProfileInput = z.TypeOf<typeof updateUserProfileSchema>;

export type {
	CreateUserInput,
	LoginUserInput,
	ReadUserCommentsInput,
	ReadUserPostsInput,
	ReadUserProfileInput,
	UpdateUserProfileInput,
};
export {
	loginUserOutputSchema,
	loginUserSchema,
	readUserCommentsOutputSchema,
	readUserCommentsSchema,
	readUserPostsOutputSchema,
	readUserPostsSchema,
	readUserProfileOutputSchema,
	readUserProfileSchema,
	registerUserOutputSchema,
	registerUserSchema,
	updateUserProfileOutputSchema,
	updateUserProfileSchema,
	userWithoutPasswordSchema,
};
