import { z } from "zod";
import { env } from "@/lib/env";

const ACCEPTED_MIME_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
];

const uploadMediaSchema = z.object({
	file: z
		.instanceof(File)
		.refine((file) => ACCEPTED_MIME_TYPES.includes(file.type), {
			error: "Unsupported image format.",
		})
		.refine((file) => file.size <= env.media.maxUploadSizeBytes, {
			error: "Image exceeds the maximum allowed size.",
		}),
	altText: z.string().max(300).optional(),
});

const mediaEntitySchema = z.object({
	id: z.string(),
	url: z.string(),
	filename: z.string(),
	mimeType: z.string(),
	size: z.number(),
	altText: z.string().nullable(),
	uploadedById: z.string(),
	createdAt: z.date(),
});

const uploadMediaOutputSchema = mediaEntitySchema;
const readOwnMediaOutputSchema = z.array(mediaEntitySchema);

const deleteMediaSchema = z.object({
	id: z.string(),
});

const deleteMediaOutputSchema = z.object({
	success: z.boolean(),
});

type UploadMediaInput = z.TypeOf<typeof uploadMediaSchema>;
type DeleteMediaInput = z.TypeOf<typeof deleteMediaSchema>;

export type { DeleteMediaInput, UploadMediaInput };
export {
	deleteMediaOutputSchema,
	deleteMediaSchema,
	mediaEntitySchema,
	readOwnMediaOutputSchema,
	uploadMediaOutputSchema,
	uploadMediaSchema,
};
