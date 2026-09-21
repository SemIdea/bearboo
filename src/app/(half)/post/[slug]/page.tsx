import { formatDistance } from "date-fns";
import { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { ArticleSkeleton } from "@/components/skeletons";
import { By } from "@/components/ui/by";
import { CategoryChip } from "@/components/ui/categoryChip";
import { MdView } from "@/components/ui/mdView";
import { ViewTracker } from "@/components/viewTracker";
import { siteConfig } from "@/config/site";
import { env } from "@/lib/env";
import { buildArticleOpenGraph } from "@/lib/seo/metadata";
import { createCaller, createOptionalDynamicCaller } from "@/server/caller";
import { buildArticleJsonLd } from "@/server/http/buildArticleJsonLd";
import { AppError } from "@/shared/error/appError";
import { CommentArea, RelatedPosts } from "./page.client";

const isPostNotFound = (error: unknown): boolean =>
	error instanceof Error &&
	error.cause instanceof AppError &&
	error.cause.code === "post.not_found";

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

		const title = post.seoTitle ?? post.title;
		const description = post.seoDescription ?? post.content.substring(0, 160);
		const canonical = post.canonicalUrl ?? `/post/${slug}`;
		const images = post.coverImageUrl ? [post.coverImageUrl] : undefined;

		return {
			title,
			description,
			alternates: {
				canonical,
			},
			openGraph: buildArticleOpenGraph({
				title,
				description,
				url: canonical,
				images: images,
			}),
			twitter: {
				card: images ? "summary_large_image" : "summary",
				title,
				description,
				images,
			},
		};
	} catch (error) {
		if (isPostNotFound(error)) {
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
		<Suspense fallback={<ArticleSkeleton />}>
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
		if (isPostNotFound(error)) {
			const redirectTarget = await caller.post.readRedirectSlug({ slug });

			if (redirectTarget) {
				permanentRedirect(`/post/${redirectTarget.slug}`);
			}

			return (
				<Suspense fallback={<ArticleSkeleton />}>
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
		if (isPostNotFound(error)) {
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
		siteName: siteConfig.name,
		inLanguage: "en-US",
		slug: post.slug,
		title: post.title,
		description: post.content.substring(0, 160),
		imageUrl: post.coverImageUrl,
		authorName: user.name,
		createdAt: new Date(post.createdAt),
		updatedAt: new Date(post.updatedAt),
	});

	return (
		<article className="mx-auto w-full max-w-[700px] pb-24">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: articleJsonLd }}
			/>
			{post.status !== "PUBLISHED" && (
				<div className="mt-8 flex items-center gap-2.5 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm font-medium">
					<FaExclamationTriangle className="size-4 shrink-0 text-brand" />
					<span>
						{post.status === "DRAFT"
							? "Draft — only you can see this."
							: "Archived — only you can see this."}
					</span>
				</div>
			)}
			<header className="flex flex-col gap-4 pt-12">
				{post.category && <CategoryChip name={post.category.name} />}
				<h1 className="text-[42px] font-bold leading-[1.1] tracking-tight">
					{post.title}
				</h1>
				<p className="text-sm text-muted-foreground">
					<By name={user.name} id={user.id} />
					{createdAt}
					{isUpdated ? ` · edited ${updatedAt}` : ""}
				</p>
			</header>
			{post.coverImageUrl && (
				<img
					src={post.coverImageUrl}
					alt={post.title}
					className="mt-8 h-[360px] w-full rounded-xl bg-muted object-cover"
				/>
			)}
			<div className="mt-10">
				<MdView source={post.content} />
			</div>
			<ViewTracker postId={post.id} />
			<RelatedPosts
				postId={post.id}
				categoryId={post.category?.id ?? null}
				tagIds={post.tags.map((tag) => tag.id)}
			/>
			<div className="mt-14">
				<CommentArea postId={post.id} />
			</div>
		</article>
	);
};

export default Page;
