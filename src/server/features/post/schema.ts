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

const readPostBySlugSchema = z.object({
	slug: z.string(),
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

const readRecentPostsSchema = z
	.object({
		cursor: z.string().optional(),
		limit: z.number().int().min(1).max(50).optional(),
	})
	.optional();

const postEntitySchema = z.object({
	id: z.string(),
	userId: z.string(),
	title: z.string(),
	content: z.string(),
	slug: z.string(),
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
const readPostBySlugOutputSchema = postEntitySchema;
const updatePostOutputSchema = postEntitySchema;
const deletePostOutputSchema = z.boolean();
const revalidatePostOutputSchema = postEntitySchema;
const readRecentPostsOutputSchema = z.object({
	posts: z.array(postEntityWithRelationsSchema),
	nextCursor: z.string().nullable(),
});

type CreatePostInput = z.TypeOf<typeof createPostSchema>;
type ReadPostInput = z.TypeOf<typeof readPostSchema>;
type ReadPostBySlugInput = z.TypeOf<typeof readPostBySlugSchema>;
type UpdatePostInput = z.TypeOf<typeof updatePostSchema>;
type DeletePostInput = z.TypeOf<typeof deletePostSchema>;
type RevalidatePostInput = z.TypeOf<typeof revalidatePostSchema>;
type ReadRecentPostsInput = NonNullable<z.TypeOf<typeof readRecentPostsSchema>>;

export type {
	CreatePostInput,
	DeletePostInput,
	ReadPostBySlugInput,
	ReadPostInput,
	ReadRecentPostsInput,
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
	readPostBySlugOutputSchema,
	readPostBySlugSchema,
	readPostOutputSchema,
	readPostSchema,
	readRecentPostsOutputSchema,
	readRecentPostsSchema,
	revalidatePostOutputSchema,
	revalidatePostSchema,
	updatePostOutputSchema,
	updatePostSchema,
};
