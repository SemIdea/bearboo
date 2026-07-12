import { z } from "zod";

const createTagSchema = z.object({
	name: z
		.string()
		.min(2, "Tag name must be at least 2 characters long.")
		.max(50, "Tag name must not exceed 50 characters."),
});

const tagEntitySchema = z.object({
	id: z.string(),
	name: z.string(),
	slug: z.string(),
});

const createTagOutputSchema = tagEntitySchema;
const readAllTagsOutputSchema = z.array(tagEntitySchema);

type CreateTagInput = z.TypeOf<typeof createTagSchema>;

export type { CreateTagInput };
export {
	createTagOutputSchema,
	createTagSchema,
	readAllTagsOutputSchema,
	tagEntitySchema,
};
