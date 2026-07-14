import { TRPCError } from "@trpc/server";
import { formatDistance } from "date-fns";
import { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CardBase } from "@/components/cardBase";
import { By } from "@/components/ui/by";
import { MdView } from "@/components/ui/mdView";
import { env } from "@/lib/env";
import { createCaller, createOptionalDynamicCaller } from "@/server/caller";
import { buildArticleJsonLd } from "@/server/http/buildArticleJsonLd";
import { PostErrorCode } from "@/shared/error/post";
import { CommentArea, RelatedPosts } from "./page.client";

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
	cacheTag("posts");

	const { slug } = await params;

	try {
		const caller = await createCaller();
		const post = await caller.post.readBySlug({ slug });

		if (!post) {
			return {
				title: "Post Not Found",
			};
		}

		const description = post.content.substring(0, 160);
		const images = post.coverImageUrl ? [post.coverImageUrl] : undefined;

		return {
			title: post.title,
			description,
			alternates: {
				canonical: `/post/${slug}`,
			},
			openGraph: {
				title: post.title,
				description,
				type: "article",
				url: `/post/${slug}`,
				images,
			},
			twitter: {
				card: images ? "summary_large_image" : "summary",
				title: post.title,
				description,
				images,
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

type Post = Awaited<
	ReturnType<Awaited<ReturnType<typeof createCaller>>["post"]["readBySlug"]>
>;
type User = Awaited<
	ReturnType<Awaited<ReturnType<typeof createCaller>>["user"]["read"]>
>;

const PostContent = async ({ params: paramsPromise }: PageProps) => {
	"use cache";
	cacheLife("hours");
	cacheTag("posts");

	const { slug } = await paramsPromise;
	const caller = await createCaller();

	let post: Post;

	try {
		post = await caller.post.readBySlug({ slug });
	} catch (error) {
		if (
			error instanceof TRPCError &&
			error.message === PostErrorCode.POST_NOT_FOUND
		) {
			return (
				<Suspense fallback={<p>Loading post...</p>}>
					<OwnerPreview slug={slug} />
				</Suspense>
			);
		}

		throw error;
	}

	const user = await caller.user.read({ id: post.userId });

	return <PostView post={post} user={user} />;
};

const OwnerPreview = async ({ slug }: { slug: string }) => {
	const caller = await createOptionalDynamicCaller();

	let post: Post;

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

	return <PostView post={post} user={user} />;
};

const PostView = ({ post, user }: { post: Post; user: User }) => {
	const isUpdated =
		new Date(post.createdAt).getTime() !== new Date(post.updatedAt).getTime();

	const createdAt = formatDistance(new Date(post.createdAt), new Date(), {
		addSuffix: true,
	});
	const updatedAt = formatDistance(new Date(post.updatedAt), new Date(), {
		addSuffix: true,
	});

	const articleJsonLd = buildArticleJsonLd({
		siteUrl: env.siteUrl,
		slug: post.slug,
		title: post.title,
		description: post.content.substring(0, 160),
		imageUrl: post.coverImageUrl,
		authorName: user.name,
		createdAt: new Date(post.createdAt),
		updatedAt: new Date(post.updatedAt),
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
					<script
						type="application/ld+json"
						dangerouslySetInnerHTML={{ __html: articleJsonLd }}
					/>
					{post.status !== "PUBLISHED" && (
						<p className="rounded bg-yellow-100 px-3 py-2 text-sm text-yellow-900">
							{post.status === "DRAFT"
								? "Draft — only you can see this."
								: "Archived — only you can see this."}
						</p>
					)}
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
					<RelatedPosts
						postId={post.id}
						categoryId={post.category?.id ?? null}
						tagIds={post.tags.map((tag) => tag.id)}
					/>
				</div>
			}
		/>
	);
};

export default Page;
