import { z } from "zod";

const createCategorySchema = z.object({
	name: z
		.string()
		.min(2, "Category name must be at least 2 characters long.")
		.max(50, "Category name must not exceed 50 characters."),
});

const categoryEntitySchema = z.object({
	id: z.string(),
	name: z.string(),
	slug: z.string(),
});

const createCategoryOutputSchema = categoryEntitySchema;
const readAllCategoriesOutputSchema = z.array(categoryEntitySchema);

type CreateCategoryInput = z.TypeOf<typeof createCategorySchema>;

export type { CreateCategoryInput };
export {
	categoryEntitySchema,
	createCategoryOutputSchema,
	createCategorySchema,
	readAllCategoriesOutputSchema,
};
