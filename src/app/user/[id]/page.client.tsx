"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/app/_trpc/client";

type Params = {
  id: string;
};

const UserPosts = () => {
  const { id } = useParams<Params>();

  const { data: posts, isLoading: isPostsLoading } = trpc.user.posts.useQuery({
    id
  });

  return (
    <div>
      <h3 className="text-xl font-medium mt-6">Posts</h3>
      {isPostsLoading ? (
        <p>Loading posts...</p>
      ) : posts?.length ? (
        <ul className="w-full max-w-md space-y-4">
          {posts.map((post) => (
            <li key={post.id} className="border p-4 rounded-lg shadow">
              <Link href={`/post/${post.id}`}>
                <h4 className="font-semibold text-lg">{post.title}</h4>
                <p className="text-gray-600">{post.content}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No posts found.</p>
      )}
    </div>
  );
};

const UserComments = () => {
  const { id } = useParams<Params>();

  const { data: comments, isLoading: isCommentsLoading } =
    trpc.user.comments.useQuery({
      id
    });

  return (
    <div>
      <h3 className="text-xl font-medium mt-6">Comments</h3>
      {isCommentsLoading ? (
        <p>Loading comments...</p>
      ) : comments?.length ? (
        <ul className="w-full max-w-md space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="border p-4 rounded-lg shadow">
              <Link href={`/post/${comment.postId}`}>
                <p>Post Id: {comment.postId}</p>
                <p className="text-gray-600">{comment.content}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No comments found.</p>
      )}
    </div>
  );
};

export { UserPosts, UserComments };
