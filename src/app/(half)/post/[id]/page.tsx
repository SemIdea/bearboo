import { formatDistance } from "date-fns";
import { Metadata } from "next";
import { cacheLife } from "next/cache";
import { Suspense } from "react";
import { CardBase } from "@/components/cardBase";
import { By } from "@/components/ui/by";
import { MdView } from "@/components/ui/mdView";
import { createCaller } from "@/server/caller";
import { CommentArea } from "./page.client";

type PageProps = {
	params: Promise<{
		id: string;
	}>;
};

type Props = {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	"use cache";
	cacheLife("hours");

	const { id } = await params;

	try {
		const caller = await createCaller();
		const post = await caller.post.read({ id: id });

		if (!post) {
			return {
				title: "Post Not Found",
			};
		}

		return {
			title: post.title,
			description: post.content.substring(0, 160),
			openGraph: {
				title: post.title,
				description: post.content.substring(0, 160),
				type: "article",
			},
		};
	} catch {
		return {
			title: "Error | Bearboo",
		};
	}
}

const Page = (props: PageProps) => {
	return (
		<Suspense fallback={<p>Loading post...</p>}>
			<PostContent params={props.params} />
		</Suspense>
	);
};

const PostContent = async ({ params: paramsPromise }: PageProps) => {
	"use cache";
	cacheLife("hours");

	const params = await paramsPromise;
	const caller = await createCaller();

	const { id } = params;

	const post = await caller.post.read({ id: id });
	const user = await caller.user.read({ id: post.userId });

	const isUpdated =
		new Date(post.createdAt).getTime() !== new Date(post.updatedAt).getTime();

	const createdAt = formatDistance(new Date(post.createdAt), new Date(), {
		addSuffix: true,
	});
	const updatedAt = formatDistance(new Date(post.updatedAt), new Date(), {
		addSuffix: true,
	});

	return (
		<CardBase
			title="Post Details"
			description={
				<p>
					<By name={user.name} id={user.id} />
					{createdAt}
					{isUpdated ? ` (edited ${updatedAt})` : ""}
				</p>
			}
			content={
				<div className="flex flex-col gap-4">
					<h2 className="text-4xl font-bold">{post.title}</h2>
					<MdView source={post.content} />
					<CommentArea postId={post.id} />
				</div>
			}
		/>
	);
};

export default Page;
