import { Skeleton } from "./ui/skeleton";

const componentKeys = (count: number) =>
	Array.from({ length: count }, (_, index) => `skeleton-${index}`);

const PostCardSkeleton = () => (
	<div className="flex flex-col gap-4 border-b border-border py-7 last:border-0 sm:flex-row sm:gap-6">
		<Skeleton className="h-44 w-full shrink-0 rounded-lg sm:h-[120px] sm:w-[180px]" />
		<div className="flex min-w-0 flex-1 flex-col gap-2">
			<Skeleton className="h-[22px] w-24 rounded-full" />
			<Skeleton className="h-[22px] w-4/5" />
			<Skeleton className="h-5 w-40" />
		</div>
	</div>
);

const PostFeedSkeleton = ({ count = 4 }: { count?: number }) => (
	<div className="flex flex-col" aria-hidden="true">
		{componentKeys(count).map((key) => (
			<PostCardSkeleton key={key} />
		))}
	</div>
);

const ArticleSkeleton = () => (
	<article className="mx-auto w-full max-w-[700px] pb-24" aria-hidden="true">
		<header className="flex flex-col gap-4 pt-12">
			<Skeleton className="h-[22px] w-24 rounded-full" />
			<Skeleton className="h-11 w-full" />
			<Skeleton className="h-11 w-2/3" />
			<Skeleton className="h-5 w-56" />
		</header>
		<Skeleton className="mt-8 h-[360px] w-full rounded-xl" />
		<div className="mt-10 flex flex-col gap-[22px]">
			{componentKeys(7).map((key, index) => (
				<Skeleton
					key={key}
					className={index % 3 === 2 ? "h-[17px] w-2/3" : "h-[17px] w-full"}
				/>
			))}
		</div>
	</article>
);

const SearchResultsSkeleton = () => (
	<div className="flex flex-col gap-8" aria-hidden="true">
		<Skeleton className="h-13 w-full rounded-lg" />
		<div className="flex items-center justify-between">
			<Skeleton className="h-4 w-44" />
			<div className="flex items-center gap-2">
				<Skeleton className="h-4 w-8" />
				<Skeleton className="h-9 w-32 rounded-md" />
			</div>
		</div>
		<PostFeedSkeleton count={3} />
	</div>
);

const CommentSkeleton = () => (
	<div className="flex flex-col">
		<div className="flex items-center justify-between px-6">
			<Skeleton className="h-4 w-40" />
		</div>
		<div className="flex flex-col gap-2 px-6 pt-4">
			<Skeleton className="h-[17px] w-full" />
			<Skeleton className="h-[17px] w-3/4" />
		</div>
	</div>
);

const CommentsSkeleton = ({ count = 3 }: { count?: number }) => (
	<div className="flex flex-col" aria-hidden="true">
		{componentKeys(count).map((key, index) => (
			<div key={key}>
				<CommentSkeleton />
				{index < count - 1 && <div className="my-4 h-px w-full bg-border" />}
			</div>
		))}
	</div>
);

const MyPostsSkeleton = ({ count = 4 }: { count?: number }) => (
	<div className="flex flex-col gap-4" aria-hidden="true">
		{componentKeys(count).map((key) => (
			<div key={key} className="flex flex-col gap-3 px-6 pb-6 pt-2">
				<div className="flex items-center gap-2">
					<Skeleton className="h-5 w-2/3" />
					<Skeleton className="h-3 w-16" />
				</div>
				<Skeleton className="h-4 w-12" />
			</div>
		))}
	</div>
);

const UserPostsSkeleton = ({ count = 4 }: { count?: number }) => (
	<ul className="space-y-2" aria-hidden="true">
		{componentKeys(count).map((key) => (
			<li key={key} className="flex">
				<Skeleton className="mr-2 h-4 w-3" />
				<div className="flex flex-1 flex-col gap-2">
					<Skeleton className="h-5 w-2/3" />
					<Skeleton className="h-4 w-32" />
				</div>
			</li>
		))}
	</ul>
);

const UserCommentsSkeleton = ({ count = 4 }: { count?: number }) => (
	<ul className="space-y-2" aria-hidden="true">
		{componentKeys(count).map((key) => (
			<li key={key} className="flex">
				<Skeleton className="mr-2 h-4 w-3" />
				<div className="flex flex-1 flex-col gap-2">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-3/4" />
					<Skeleton className="h-4 w-32" />
				</div>
			</li>
		))}
	</ul>
);

const ProfileSkeleton = () => (
	<div className="flex flex-col gap-6" aria-hidden="true">
		<Skeleton className="h-10 w-64" />
		<Skeleton className="h-9 w-72 rounded-lg" />
		<div className="flex flex-col gap-3">
			<Skeleton className="h-5 w-12" />
			<Skeleton className="h-24 w-full rounded-lg" />
		</div>
	</div>
);

const FormSkeleton = ({ fields = 4 }: { fields?: number }) => (
	<div className="flex flex-col gap-6" aria-hidden="true">
		<Skeleton className="h-8 w-48" />
		<Skeleton className="h-4 w-72" />
		{componentKeys(fields).map((key) => (
			<div key={key} className="flex flex-col gap-2">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-9 w-full" />
			</div>
		))}
		<Skeleton className="h-9 w-32" />
	</div>
);

const MediaGridSkeleton = ({ count = 4 }: { count?: number }) => (
	<div className="flex flex-wrap gap-4" aria-hidden="true">
		{componentKeys(count).map((key) => (
			<div key={key} className="w-32 space-y-1">
				<Skeleton className="h-32 w-32 rounded-md" />
				<Skeleton className="h-3 w-20" />
				<Skeleton className="h-8 w-16 rounded-md" />
			</div>
		))}
	</div>
);

const MediaPickerSkeleton = ({ count = 4 }: { count?: number }) => (
	<div className="flex flex-wrap gap-2" aria-hidden="true">
		{componentKeys(count).map((key) => (
			<Skeleton key={key} className="size-16 rounded-md" />
		))}
	</div>
);

const AnalyticsSkeleton = () => (
	<div className="flex flex-col gap-6" aria-hidden="true">
		<div className="flex flex-wrap gap-4">
			{componentKeys(3).map((key) => (
				<div key={key} className="flex flex-col gap-2 rounded-lg border p-4">
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-7 w-12" />
				</div>
			))}
		</div>
		<Skeleton className="h-6 w-48" />
		<ul className="flex flex-col gap-2">
			{componentKeys(5).map((key) => (
				<li key={key} className="flex items-center justify-between gap-2">
					<Skeleton className="h-4 w-2/3" />
					<Skeleton className="h-4 w-16" />
				</li>
			))}
		</ul>
	</div>
);

export {
	AnalyticsSkeleton,
	ArticleSkeleton,
	CommentsSkeleton,
	FormSkeleton,
	MediaGridSkeleton,
	MediaPickerSkeleton,
	MyPostsSkeleton,
	PostCardSkeleton,
	PostFeedSkeleton,
	ProfileSkeleton,
	SearchResultsSkeleton,
	UserCommentsSkeleton,
	UserPostsSkeleton,
};
