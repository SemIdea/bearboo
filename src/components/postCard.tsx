import { formatDistance } from "date-fns";
import Link from "next/link";
import { IPostEntityWithRelations } from "@/server/models/post";
import { CategoryChip } from "./ui/categoryChip";

type PostCardProps = {
	post: IPostEntityWithRelations;
};

const PostCard = ({ post }: PostCardProps) => {
	const createdDistance = formatDistance(new Date(post.createdAt), new Date(), {
		addSuffix: true,
	});

	return (
		<Link
			href={`/post/${post.slug}`}
			className="group flex flex-col gap-4 border-b border-border py-7 last:border-0 sm:flex-row sm:gap-6"
		>
			{post.coverImageUrl && (
				<img
					src={post.coverImageUrl}
					alt=""
					className="h-44 w-full shrink-0 rounded-lg bg-muted object-cover sm:h-[120px] sm:w-[180px]"
				/>
			)}
			<div className="flex min-w-0 flex-col gap-2">
				{post.category && <CategoryChip name={post.category.name} />}
				<span className="text-[22px] font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-brand">
					{post.title}
				</span>
				<span className="text-sm font-medium text-muted-foreground">
					By {post.user.name} · {createdDistance}
				</span>
			</div>
		</Link>
	);
};

export { PostCard };
