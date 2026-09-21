import { PostFeedSkeleton } from "@/components/skeletons";

const Loading = () => {
	return (
		<div className="mx-auto flex w-full max-w-[680px] flex-col gap-10 px-4 pt-16 pb-24">
			<div className="flex flex-col gap-2">
				<h1 className="text-[34px] font-bold leading-tight tracking-tight">
					Latest posts
				</h1>
				<p className="text-base text-muted-foreground">
					Short, dense essays on engineering, architecture, and the business of
					building software.
				</p>
			</div>
			<PostFeedSkeleton />
		</div>
	);
};

export default Loading;
