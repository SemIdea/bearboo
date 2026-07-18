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
	viewsLast7Days: z.number(),
	viewsLast30Days: z.number(),
	trafficOrigin: z.array(
		z.object({
			bucket: z.enum(["DIRECT", "SEARCH", "SOCIAL", "OTHER"]),
			count: z.number(),
		}),
	),
	browsers: z.array(
		z.object({
			name: z.string(),
			count: z.number(),
		}),
	),
});

type RecordViewInput = z.infer<typeof recordViewSchema>;

export type { RecordViewInput };
export { readDashboardOutputSchema, recordViewOutputSchema, recordViewSchema };
