import { z } from "zod";
import { env } from "@/lib/env";

const ACCEPTED_MIME_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
];

// tRPC's multipart/form-data content-type handler hands the raw `FormData`
// itself as input (not a parsed `{ file, altText }` object) — the transform
// below is what turns it into the shape the domain layer actually consumes.
const uploadMediaSchema = z
	.instanceof(FormData)
	.transform((formData, ctx) => {
		const file = formData.get("file");
		const altTextRaw = formData.get("altText");

		if (!(file instanceof File)) {
			ctx.addIssue({ code: "custom", message: "A file is required." });
			return z.NEVER;
		}

		if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
			ctx.addIssue({ code: "custom", message: "Unsupported image format." });
			return z.NEVER;
		}

		if (file.size > env.media.maxUploadSizeBytes) {
			ctx.addIssue({
				code: "custom",
				message: "Image exceeds the maximum allowed size.",
			});
			return z.NEVER;
		}

		return {
			file,
			altText:
				typeof altTextRaw === "string" && altTextRaw.length > 0
					? altTextRaw
					: undefined,
		};
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
