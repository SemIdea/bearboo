import { z } from "zod";

const createPostSchema = z.object({
	title: z
		.string()
		.min(3, "Post title must be at least 3 characters long.")
		.max(100, "Post title must not exceed 100 characters."),
	content: z
		.string()
		.min(10, "Post content must be at least 10 characters long.")
		.max(5000, "Post content must not exceed 5000 characters."),
});

const readPostSchema = z.object({
	id: z.string(),
});

const updatePostSchema = z.object({
	id: z.string(),
	title: z
		.string()
		.min(3, "Post title must be at least 3 characters long.")
		.optional(),
	content: z
		.string()
		.min(10, "Post content must be at least 10 characters long.")
		.optional(),
});

const deletePostSchema = z.object({
	id: z.string(),
});

const revalidatePostSchema = z.object({
	id: z.string(),
});

const postEntitySchema = z.object({
	id: z.string(),
	userId: z.string(),
	title: z.string(),
	content: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

const postEntityWithRelationsSchema = postEntitySchema.extend({
	user: z.object({
		id: z.string(),
		name: z.string(),
	}),
	comments: z.array(
		z.object({
			id: z.string(),
		}),
	),
});

const createPostOutputSchema = postEntitySchema;
const readPostOutputSchema = postEntitySchema;
const updatePostOutputSchema = postEntitySchema;
const deletePostOutputSchema = z.boolean();
const revalidatePostOutputSchema = postEntitySchema;
const readRecentPostsOutputSchema = z.array(postEntityWithRelationsSchema);

type CreatePostInput = z.TypeOf<typeof createPostSchema>;
type ReadPostInput = z.TypeOf<typeof readPostSchema>;
type UpdatePostInput = z.TypeOf<typeof updatePostSchema>;
type DeletePostInput = z.TypeOf<typeof deletePostSchema>;
type RevalidatePostInput = z.TypeOf<typeof revalidatePostSchema>;

export type {
	CreatePostInput,
	DeletePostInput,
	ReadPostInput,
	RevalidatePostInput,
	UpdatePostInput,
};
export {
	createPostOutputSchema,
	createPostSchema,
	deletePostOutputSchema,
	deletePostSchema,
	postEntitySchema,
	postEntityWithRelationsSchema,
	readPostOutputSchema,
	readPostSchema,
	readRecentPostsOutputSchema,
	revalidatePostOutputSchema,
	revalidatePostSchema,
	updatePostOutputSchema,
	updatePostSchema,
};
