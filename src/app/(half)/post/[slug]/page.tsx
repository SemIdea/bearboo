import { TRPCError } from "@trpc/server";
import { formatDistance } from "date-fns";
import { Metadata } from "next";
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CardBase } from "@/components/cardBase";
import { By } from "@/components/ui/by";
import { MdView } from "@/components/ui/mdView";
import { createCaller } from "@/server/caller";
import { PostErrorCode } from "@/shared/error/post";
import { CommentArea } from "./page.client";

type PageProps = {
	params: Promise<{
		slug: string;
	}>;
};

type Props = {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	"use cache";
	cacheLife("hours");

	const { slug } = await params;

	try {
		const caller = await createCaller();
		const post = await caller.post.readBySlug({ slug });

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
	} catch (error) {
		if (
			error instanceof TRPCError &&
			error.message === PostErrorCode.POST_NOT_FOUND
		) {
			return {
				title: "Post Not Found",
			};
		}

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

	const { slug } = params;

	let post: Awaited<ReturnType<typeof caller.post.readBySlug>>;

	try {
		post = await caller.post.readBySlug({ slug });
	} catch (error) {
		if (
			error instanceof TRPCError &&
			error.message === PostErrorCode.POST_NOT_FOUND
		) {
			notFound();
		}

		throw error;
	}

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
					{post.coverImageUrl && (
						<img
							src={post.coverImageUrl}
							alt={post.title}
							className="max-h-96 w-full rounded object-cover"
						/>
					)}
					<h2 className="text-4xl font-bold">{post.title}</h2>
					<MdView source={post.content} />
					<CommentArea postId={post.id} />
				</div>
			}
		/>
	);
};

export default Page;
