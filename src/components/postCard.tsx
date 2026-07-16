import { formatDistance } from "date-fns";
import Link from "next/link";
import { IPostEntityWithRelations } from "@/server/models/post";
import { By } from "./ui/by";
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card";

type PostCardProps = {
	post: IPostEntityWithRelations;
	index: number;
};

const PostCard = ({ post, index }: PostCardProps) => {
	const createdDistance = formatDistance(new Date(post.createdAt), new Date(), {
		addSuffix: true,
	});

	return (
		<Card className="border-0 shadow-none">
			<CardContent>
				{post.coverImageUrl && (
					<img
						src={post.coverImageUrl}
						alt={post.title}
						className="mb-2 h-40 w-full rounded object-cover"
					/>
				)}
				<CardTitle className="flex">
					<span className="mr-2">{index + 1}.</span>
					<Link href={`/post/${post.slug}`} className="hover:underline">
						<h2 className="font-semibold">{post.title}</h2>
					</Link>
				</CardTitle>
				<CardDescription className="ml-5">
					<By name={post.user.name} id={post.user.id} /> {createdDistance}
				</CardDescription>
			</CardContent>
		</Card>
	);
};

export { PostCard };
