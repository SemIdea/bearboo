import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "@/server/createRouter";
import { DomainError } from "@/shared/error/domainError";
import { MediaErrorCode, MediaErrorMessages } from "@/shared/error/media";
import { domain_deleteMedia } from "../domain/delete";
import { deleteMediaOutputSchema, deleteMediaSchema } from "../schema";

const procedure_deleteMedia = protectedProcedure
	.input(deleteMediaSchema)
	.output(deleteMediaOutputSchema)
	.mutation(async ({ input, ctx }) => {
		try {
			const success = await domain_deleteMedia({
				ctx,
				input: { ...input, userId: ctx.user.id, role: ctx.user.role },
			});

			return { success };
		} catch (error) {
			if (error instanceof DomainError) {
				if (error.code === MediaErrorCode.MEDIA_NOT_FOUND) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: MediaErrorMessages[MediaErrorCode.MEDIA_NOT_FOUND],
					});
				}

				if (error.code === MediaErrorCode.MEDIA_DELETE_FORBIDDEN) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: MediaErrorMessages[MediaErrorCode.MEDIA_DELETE_FORBIDDEN],
					});
				}
			}

			throw error;
		}
	});

export { procedure_deleteMedia };
