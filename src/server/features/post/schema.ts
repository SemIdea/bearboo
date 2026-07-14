import { z } from "zod";

const postStatusSchema = z.enum([
	"DRAFT",
	"IN_REVIEW",
	"SCHEDULED",
	"PUBLISHED",
	"ARCHIVED",
]);

const createPostSchema = z.object({
	title: z
		.string()
		.min(3, "Post title must be at least 3 characters long.")
		.max(100, "Post title must not exceed 100 characters."),
	content: z
		.string()
		.min(10, "Post content must be at least 10 characters long.")
		.max(5000, "Post content must not exceed 5000 characters."),
	status: postStatusSchema.optional(),
	categoryId: z.string().optional(),
	tagIds: z.array(z.string()).optional(),
	coverImageUrl: z.string().url().optional(),
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
	categoryId: z.string().optional(),
	tagIds: z.array(z.string()).optional(),
	coverImageUrl: z.string().url().optional(),
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
		categoryId: z.string().optional(),
		tagId: z.string().optional(),
	})
	.optional();

const searchPostsSchema = z.object({
	query: z.string().min(2, "Search query must be at least 2 characters long."),
	cursor: z.string().optional(),
	limit: z.number().int().min(1).max(50).optional(),
	categoryId: z.string().optional(),
	tagId: z.string().optional(),
});

const readOwnPostsSchema = z.object({
	status: postStatusSchema.optional(),
	categoryId: z.string().optional(),
	tagId: z.string().optional(),
});

const readRelatedPostsSchema = z.object({
	postId: z.string(),
	categoryId: z.string().nullable().optional(),
	tagIds: z.array(z.string()).optional(),
	limit: z.number().int().min(1).max(20).optional(),
});

const submitForReviewPostSchema = z.object({
	id: z.string(),
});

const publishPostSchema = z.object({
	id: z.string(),
	scheduledAt: z.coerce.date().optional(),
	comment: z.string().optional(),
});

const rejectPostSchema = z.object({
	id: z.string(),
	comment: z.string().min(1, "A reason is required to reject a post."),
});

const archivePostSchema = z.object({
	id: z.string(),
});

const readReviewCommentsSchema = z.object({
	postId: z.string(),
});

const sitemapEntrySchema = z.object({
	slug: z.string(),
	updatedAt: z.date(),
});

const READING_WORDS_PER_MINUTE = 200;

const calculateReadingTimeMinutes = (content: string): number => {
	const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

	return Math.max(1, Math.ceil(wordCount / READING_WORDS_PER_MINUTE));
};

const withReadingTime = <T extends { content: string }>(schema: z.ZodType<T>) =>
	schema.transform((post) => ({
		...post,
		readingTimeMinutes: calculateReadingTimeMinutes(post.content),
	}));

const postFieldsSchema = z.object({
	id: z.string(),
	userId: z.string(),
	title: z.string(),
	content: z.string(),
	slug: z.string(),
	status: postStatusSchema,
	scheduledAt: z.date().nullable(),
	categoryId: z.string().nullable(),
	coverImageUrl: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

const postEntitySchema = withReadingTime(postFieldsSchema);

const postCategorySummarySchema = z
	.object({
		id: z.string(),
		name: z.string(),
		slug: z.string(),
	})
	.nullable();

const postTagSummarySchema = z.array(
	z.object({
		id: z.string(),
		name: z.string(),
		slug: z.string(),
	}),
);

const postEntityWithRelationsSchema = withReadingTime(
	postFieldsSchema.extend({
		user: z.object({
			id: z.string(),
			name: z.string(),
		}),
		comments: z.array(
			z.object({
				id: z.string(),
			}),
		),
		category: postCategorySummarySchema,
		tags: postTagSummarySchema,
	}),
);

const postEntityWithTaxonomySchema = withReadingTime(
	postFieldsSchema.extend({
		category: postCategorySummarySchema,
		tags: postTagSummarySchema,
	}),
);

const createPostOutputSchema = postEntitySchema;
const readPostOutputSchema = postEntitySchema;
const readPostBySlugOutputSchema = postEntityWithTaxonomySchema;
const updatePostOutputSchema = postEntitySchema;
const deletePostOutputSchema = z.boolean();
const revalidatePostOutputSchema = postEntitySchema;
const readRecentPostsOutputSchema = z.object({
	posts: z.array(postEntityWithRelationsSchema),
	nextCursor: z.string().nullable(),
});
const searchPostsOutputSchema = z.object({
	posts: z.array(postEntityWithRelationsSchema),
	nextCursor: z.string().nullable(),
});
const readRelatedPostsOutputSchema = z.array(postEntityWithRelationsSchema);
const readOwnPostsOutputSchema = z.array(postEntityWithRelationsSchema);
const submitForReviewPostOutputSchema = postEntitySchema;
const publishPostOutputSchema = postEntitySchema;
const rejectPostOutputSchema = postEntitySchema;
const archivePostOutputSchema = postEntitySchema;
const readSitemapEntriesOutputSchema = z.array(sitemapEntrySchema);

const reviewCommentsOutputSchema = z.array(
	z.object({
		id: z.string(),
		postId: z.string(),
		reviewerId: z.string(),
		reviewer: z.object({
			id: z.string(),
			name: z.string(),
		}),
		type: z.enum(["APPROVAL", "REJECTION"]),
		content: z.string().nullable(),
		createdAt: z.date(),
	}),
);

type CreatePostInput = z.TypeOf<typeof createPostSchema>;
type ReadPostInput = z.TypeOf<typeof readPostSchema>;
type ReadPostBySlugInput = z.TypeOf<typeof readPostBySlugSchema>;
type UpdatePostInput = z.TypeOf<typeof updatePostSchema>;
type DeletePostInput = z.TypeOf<typeof deletePostSchema>;
type RevalidatePostInput = z.TypeOf<typeof revalidatePostSchema>;
type ReadRecentPostsInput = NonNullable<z.TypeOf<typeof readRecentPostsSchema>>;
type SearchPostsInput = z.TypeOf<typeof searchPostsSchema>;
type ReadRelatedPostsInput = z.TypeOf<typeof readRelatedPostsSchema>;
type ReadOwnPostsInput = z.TypeOf<typeof readOwnPostsSchema>;
type SubmitForReviewPostInput = z.TypeOf<typeof submitForReviewPostSchema>;
type PublishPostInput = z.TypeOf<typeof publishPostSchema>;
type RejectPostInput = z.TypeOf<typeof rejectPostSchema>;
type ArchivePostInput = z.TypeOf<typeof archivePostSchema>;
type ReadReviewCommentsInput = z.TypeOf<typeof readReviewCommentsSchema>;

export type {
	ArchivePostInput,
	CreatePostInput,
	DeletePostInput,
	PublishPostInput,
	ReadOwnPostsInput,
	ReadPostBySlugInput,
	ReadPostInput,
	ReadRecentPostsInput,
	ReadRelatedPostsInput,
	ReadReviewCommentsInput,
	RejectPostInput,
	RevalidatePostInput,
	SearchPostsInput,
	SubmitForReviewPostInput,
	UpdatePostInput,
};
export {
	archivePostOutputSchema,
	archivePostSchema,
	createPostOutputSchema,
	createPostSchema,
	deletePostOutputSchema,
	deletePostSchema,
	postEntitySchema,
	postEntityWithRelationsSchema,
	postEntityWithTaxonomySchema,
	postStatusSchema,
	publishPostOutputSchema,
	publishPostSchema,
	readOwnPostsOutputSchema,
	readOwnPostsSchema,
	readPostBySlugOutputSchema,
	readPostBySlugSchema,
	readPostOutputSchema,
	readPostSchema,
	readRecentPostsOutputSchema,
	readRecentPostsSchema,
	readRelatedPostsOutputSchema,
	readRelatedPostsSchema,
	readReviewCommentsSchema,
	readSitemapEntriesOutputSchema,
	rejectPostOutputSchema,
	rejectPostSchema,
	revalidatePostOutputSchema,
	revalidatePostSchema,
	reviewCommentsOutputSchema,
	searchPostsOutputSchema,
	searchPostsSchema,
	submitForReviewPostOutputSchema,
	submitForReviewPostSchema,
	updatePostOutputSchema,
	updatePostSchema,
};
