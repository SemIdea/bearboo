"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth";
import { trpc } from "@/app/_trpc/client";

const Posts = ({ max }: { max: number }) => {
  const { session } = useAuth();

  const {
    data: allPosts,
    isLoading: isAllPostsLoading,
    error: allPostsError
  } = trpc.post.readRecent.useQuery();

  return (
    <div>
      <p>
        {isAllPostsLoading && <span>Loading...</span>}{" "}
        {allPostsError && <span>Error: {allPostsError.message}</span>}
        {!isAllPostsLoading &&
          !allPostsError &&
          allPosts &&
          allPosts.length === 0 && <span>No posts available</span>}
      </p>
      <div>
        {allPosts &&
          allPosts.length > 0 &&
          allPosts.slice(0, max).map((post) => (
            <div key={post.id}>
              {post.userId == session?.user.id && (
                <Link href={`/post/edit/${post.id}`}>
                  <h3>
                    <b>Edit</b>
                  </h3>
                </Link>
              )}
              <Link href={`/post/${post.id}`}>
                <h3>{post.title}</h3>
                <p>{post.content}</p>
                <p>{post.userId}</p>
                <p>{post.id}</p>
                <br />
              </Link>
            </div>
          ))}
      </div>
    </div>
  );
};

export { Posts };
