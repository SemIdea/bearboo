import { DomainInput } from "@/server/createDomain";
import { IRole } from "@/server/models/user";
import { DomainError } from "@/shared/error/domainError";
import { MediaErrorCode } from "@/shared/error/media";

const domain_deleteMedia = async ({
	ctx,
	input,
}: DomainInput<{ id: string; userId: string; role: IRole }>) => {
	const media = await ctx.repositories.media.read(input.id);

	if (!media) {
		throw new DomainError(MediaErrorCode.MEDIA_NOT_FOUND);
	}

	const isOwner = media.uploadedById === input.userId;
	const canDeleteAny = ctx.helpers.permissions.can(
		input.role,
		"media:deleteAny",
	);

	if (!isOwner && !canDeleteAny) {
		throw new DomainError(MediaErrorCode.MEDIA_DELETE_FORBIDDEN);
	}

	await ctx.gateways.mediaStorage.delete(media.storageKey);

	return ctx.repositories.media.delete(media.id);
};

export { domain_deleteMedia };
