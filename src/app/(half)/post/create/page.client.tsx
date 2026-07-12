"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { FormBase, InputField } from "@/components/formBase";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/errorMessage";
import { MdEditor } from "@/components/ui/mdEditor";
import { useAuth } from "@/context/auth";
import { getErrorMessage } from "@/lib/error";
import {
	CreatePostInput,
	createPostSchema,
} from "@/server/features/post/schema";

const useCreatePost = () => {
	const router = useRouter();
	const { session, isLoadingSession } = useAuth();

	const [errorMessage, setErrorMessage] = useState<null | string>(null);

	const { mutate: createPost, isPending: isSubmitting } =
		trpc.post.create.useMutation({
			onSuccess: (data) => {
				setErrorMessage(null);
				router.push(`/post/${data.slug}`);
			},
			onError: (error) => {
				const errorMessage = getErrorMessage(error.message);
				setErrorMessage(errorMessage);
			},
		});

	useEffect(() => {
		if (!isLoadingSession && !session) {
			router.push("/auth/login");
		}
	}, [isLoadingSession, session, router]);

	const onSubmit = async (data: CreatePostInput) => {
		setErrorMessage(null);

		createPost(data);
	};

	return {
		onSubmit,
		errorMessage,
		isSubmitting,
	};
};

const CreatePostForm = () => {
	const { onSubmit, isSubmitting, errorMessage } = useCreatePost();

	return (
		<FormBase
			schema={createPostSchema}
			onSubmit={onSubmit}
			defaultValues={{ status: "PUBLISHED" }}
		>
			<InputField name="title" label="Title" placeholder="Enter post title" />
			<InputField name="content" label="Content">
				<MdEditor preview="live" />
			</InputField>
			<InputField
				name="coverImageUrl"
				label="Cover image URL"
				placeholder="https://..."
			/>
			<InputField name="status" label="Status">
				<select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring md:text-sm">
					<option value="DRAFT">Draft</option>
					<option value="PUBLISHED">Published</option>
					<option value="ARCHIVED">Archived</option>
				</select>
			</InputField>
			<Button type="submit" disabled={isSubmitting}>
				{isSubmitting ? "Creating Post..." : "Create Post"}
			</Button>
			<ErrorMessage error={errorMessage} />
		</FormBase>
	);
};

export { CreatePostForm };
