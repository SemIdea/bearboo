import { DomainInput } from "@/server/createDomain";
import { IRole } from "@/server/models/user";
import { AppError } from "@/shared/error/appError";

const domain_deleteMedia = async ({
	ctx,
	input,
}: DomainInput<{ id: string; userId: string; role: IRole }>) => {
	const media = await ctx.repositories.media.read(input.id);

	if (!media) {
		throw new AppError("media.not_found");
	}

	const isOwner = media.uploadedById === input.userId;
	const canDeleteAny = ctx.helpers.permissions.can(
		input.role,
		"media:deleteAny",
	);

	if (!isOwner && !canDeleteAny) {
		throw new AppError("media.delete_forbidden");
	}

	await ctx.gateways.mediaStorage.delete(media.storageKey);

	return ctx.repositories.media.delete(media.id);
};

export { domain_deleteMedia };
