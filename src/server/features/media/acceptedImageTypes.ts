// No other imports on purpose — shared by schema.ts (server-side validation
// boundary) and the client upload form (the `accept` attribute, UX-only,
// not a security boundary). Importing schema.ts directly from the client
// would drag `@/lib/env` (dotenv/fs, Node-only) into the browser bundle.
const ACCEPTED_IMAGE_MIME_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
];

export { ACCEPTED_IMAGE_MIME_TYPES };
