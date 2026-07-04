import { z } from "zod";

const createCommentschema = z.object({
	postId: z.string(),
	content: z
		.string()
		.min(10, "Comment must be at least 10 characters long.")
		.max(500, "Comment must not exceed 500 characters."),
});

const readAllCommentsByPostSchema = z.object({
	postId: z.string(),
});

const updateCommentSchema = z.object({
	id: z.string(),
	content: z
		.string()
		.min(10, "Comment must be at least 10 characters long.")
		.max(500, "Comment must not exceed 500 characters."),
});

const deleteCommentSchema = z.object({
	id: z.string(),
});

const commentEntitySchema = z.object({
	id: z.string(),
	postId: z.string(),
	userId: z.string(),
	content: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

const commentEntityWithUserSchema = commentEntitySchema.extend({
	user: z.object({
		name: z.string(),
	}),
});

const createCommentOutputSchema = commentEntitySchema;
const readAllCommentsByPostOutputSchema = z.array(commentEntityWithUserSchema);
const updateCommentOutputSchema = commentEntitySchema;
const deleteCommentOutputSchema = z.boolean();

type CreateCommentInput = z.TypeOf<typeof createCommentschema>;
type ReadAllCommentsByPostInput = z.TypeOf<typeof readAllCommentsByPostSchema>;
type UpdateCommentInput = z.TypeOf<typeof updateCommentSchema>;
type DeleteCommentInput = z.TypeOf<typeof deleteCommentSchema>;

export type {
	CreateCommentInput,
	DeleteCommentInput,
	ReadAllCommentsByPostInput,
	UpdateCommentInput,
};
export {
	commentEntitySchema,
	commentEntityWithUserSchema,
	createCommentOutputSchema,
	createCommentschema,
	deleteCommentOutputSchema,
	deleteCommentSchema,
	readAllCommentsByPostOutputSchema,
	readAllCommentsByPostSchema,
	updateCommentOutputSchema,
	updateCommentSchema,
};
