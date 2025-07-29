import { IPostEntityWithRelations } from "@/server/entities/post/DTO";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "./ui/card";
import { formatDistance } from "date-fns";
import { createCaller } from "@/server/caller";
import { By } from "./ui/by";
import Link from "next/link";


const PostFeed = async () => {
  const caller = await createCaller();

  const posts = await caller.post.readRecent();
  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        {posts.length == 0 && <p>No posts found.</p>}
        {posts.length > 0 &&
          posts.map((post, index) => (
            <Post key={post.id} post={post} index={index} />
          ))}
      </CardHeader>
    </Card>
  );
};

const Post = ({
  post,
  index
}: {
  post: IPostEntityWithRelations;
  index: number;
}) => {
  const createdDistance = formatDistance(new Date(post.createdAt), new Date(), {
    addSuffix: true
  });

  return (
    <Card className="border-0 shadow-none">
      <CardContent>
        <CardTitle className="flex">
          <span className="mr-2">{index + 1}.</span>
          <Link href={`/post/${post.id}`} className="hover:underline">
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

export { PostFeed };
