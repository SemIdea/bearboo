"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/errorMessage";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth";
import { getErrorMessage } from "@/lib/error";
import { ACCEPTED_IMAGE_MIME_TYPES } from "@/server/features/media/acceptedImageTypes";

const UploadMediaForm = () => {
	const utils = trpc.useUtils();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [altText, setAltText] = useState("");
	const [errorMessage, setErrorMessage] = useState<null | string>(null);

	const { mutate: upload, isPending } = trpc.media.upload.useMutation({
		onSuccess: () => {
			setErrorMessage(null);
			setAltText("");
			if (fileInputRef.current) fileInputRef.current.value = "";
			utils.media.readOwn.invalidate();
		},
		onError: (error) => {
			setErrorMessage(getErrorMessage(error.message));
		},
	});

	const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const file = fileInputRef.current?.files?.[0];

		if (!file) {
			setErrorMessage("Please choose a file to upload.");
			return;
		}

		const formData = new FormData();
		formData.set("file", file);
		if (altText) formData.set("altText", altText);

		upload(formData);
	};

	return (
		<form onSubmit={onSubmit} className="flex flex-col gap-2">
			<Input
				ref={fileInputRef}
				type="file"
				accept={ACCEPTED_IMAGE_MIME_TYPES.join(",")}
			/>
			<Input
				type="text"
				placeholder="Alt text (optional)"
				value={altText}
				onChange={(event) => setAltText(event.target.value)}
			/>
			<Button type="submit" disabled={isPending} className="w-fit">
				{isPending ? "Uploading..." : "Upload"}
			</Button>
			<ErrorMessage error={errorMessage} />
		</form>
	);
};

const MediaGrid = () => {
	const utils = trpc.useUtils();
	const { data: media, isLoading } = trpc.media.readOwn.useQuery();

	const { mutate: deleteMedia } = trpc.media.delete.useMutation({
		onSuccess: () => {
			utils.media.readOwn.invalidate();
		},
	});

	if (isLoading) {
		return <p>Loading media...</p>;
	}

	if (!media || media.length === 0) {
		return <p>No media uploaded yet.</p>;
	}

	return (
		<div className="flex flex-wrap gap-4">
			{media.map((item) => (
				<div key={item.id} className="w-32 space-y-1">
					<img
						src={item.url}
						alt={item.altText ?? item.filename}
						className="h-32 w-32 rounded-md border border-input object-cover"
					/>
					<p className="truncate text-muted-foreground text-xs">
						{item.filename}
					</p>
					<Button
						variant="destructive"
						size="sm"
						onClick={() => deleteMedia({ id: item.id })}
					>
						Delete
					</Button>
				</div>
			))}
		</div>
	);
};

const MediaLibrary = () => {
	const router = useRouter();
	const { session, isLoadingSession } = useAuth();

	useEffect(() => {
		if (!isLoadingSession && !session) {
			router.push("/auth/login");
		}
	}, [isLoadingSession, session, router]);

	if (!session) {
		return null;
	}

	return (
		<div className="flex flex-col gap-6">
			<UploadMediaForm />
			<MediaGrid />
		</div>
	);
};

export { MediaLibrary };
