"use client";

import Link from "next/link";
import { trpc } from "@/app/_trpc/client";
import { useAuth } from "@/context/auth";

type Params = {
  id: string;
};

const UserPosts = ({ id }: { id: string }) => {
  const { data: posts, isLoading: isPostsLoading } =
    trpc.user.readPosts.useQuery({
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

const UserComments = ({ id }: { id: string }) => {
  const { data: comments, isLoading: isCommentsLoading } =
    trpc.user.readComments.useQuery({
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

const UpdateUserSection = ({ id }: Params) => {
  const { session, isLoadingSession } = useAuth();

  if (isLoadingSession || !session || session.user.id !== id) {
    return null;
  }

  return (
    <div className="mt-6">
      <Link href={`/user/profile`} className="text-blue-500">
        Update Profile
      </Link>
    </div>
  );
};

export { UserPosts, UserComments, UpdateUserSection };
