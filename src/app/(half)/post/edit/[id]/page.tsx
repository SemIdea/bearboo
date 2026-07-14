import { Suspense } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { createDynamicCaller } from "@/server/caller";
import {
	DeletePostButton,
	PostWorkflowActions,
	UpdatePostForm,
} from "./page.client";

type PageProps = {
	params: Promise<{
		id: string;
	}>;
};

const Page = (props: PageProps) => {
	return (
		<Suspense fallback={<p>Loading post...</p>}>
			<EditPostContent params={props.params} />
		</Suspense>
	);
};

const EditPostContent = async ({ params }: PageProps) => {
	const { id } = await params;

	const { caller } = await createDynamicCaller();

	const post = await caller.post.read({ id });

	return (
		<Card className="border-0 shadow-none">
			<CardHeader>
				<CardTitle>Edit Post</CardTitle>
				<CardDescription className="flex items-center justify-between">
					Update your post details below
					<div className="flex justify-end">
						<DeletePostButton post={post} />
					</div>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<UpdatePostForm post={post} />
				<PostWorkflowActions post={post} />
			</CardContent>
		</Card>
	);
};

export default Page;
