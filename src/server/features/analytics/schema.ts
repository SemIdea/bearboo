import { z } from "zod";

const recordViewSchema = z.object({
	postId: z.string(),
});

const recordViewOutputSchema = z.object({
	counted: z.boolean(),
});

const readDashboardOutputSchema = z.object({
	totalViews: z.number(),
	posts: z.array(
		z.object({
			id: z.string(),
			title: z.string(),
			slug: z.string(),
			viewCount: z.number(),
		}),
	),
});

type RecordViewInput = z.infer<typeof recordViewSchema>;

export type { RecordViewInput };
export { readDashboardOutputSchema, recordViewOutputSchema, recordViewSchema };
