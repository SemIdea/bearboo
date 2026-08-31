import { DomainInput } from "@/server/createDomain";
import { UploadMediaInput } from "../schema";

const domain_uploadMedia = async ({
	ctx,
	input,
}: DomainInput<UploadMediaInput & { userId: string }>) => {
	const buffer = Buffer.from(await input.file.arrayBuffer());

	const saved = await ctx.gateways.mediaStorage.save({
		buffer,
		filename: input.file.name,
		mimeType: input.file.type,
	});

	const mediaId = ctx.helpers.uid.generate();

	return ctx.repositories.media.create(mediaId, {
		url: saved.url,
		storageKey: saved.storageKey,
		filename: input.file.name,
		mimeType: input.file.type,
		size: input.file.size,
		altText: input.altText ?? null,
		uploadedById: input.userId,
	});
};

export { domain_uploadMedia };
