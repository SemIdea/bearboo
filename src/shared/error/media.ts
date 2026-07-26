enum MediaErrorCode {
	MEDIA_NOT_FOUND = "MEDIA_NOT_FOUND",
	MEDIA_DELETE_FORBIDDEN = "MEDIA_DELETE_FORBIDDEN",
}

const MediaErrorMessages = {
	[MediaErrorCode.MEDIA_NOT_FOUND]: "Media not found.",
	[MediaErrorCode.MEDIA_DELETE_FORBIDDEN]:
		"You are not allowed to delete this media.",
} as const;

export { MediaErrorCode, MediaErrorMessages };
