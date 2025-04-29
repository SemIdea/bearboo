"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import { usePost } from "@/context/post";

const Posts = ({ max }: { max: number }) => {
  const router = useRouter();
  const { findAllPosts } = usePost();

  const { session } = useAuth();
  const { data: posts, isLoading, error } = findAllPosts();

  return (
    <div>
      <p>
        {isLoading && <span>Loading...</span>}{" "}
        {error && <span>Error: {error.message}</span>}
        {!isLoading && !error && posts && posts.length === 0 && (
          <span>No posts available</span>
        )}
      </p>
      <div>
        {posts &&
          posts.length > 0 &&
          posts.slice(0, max).map((post) => (
            <div key={post.id}>
              {post.userId == session?.user.id && (
                <Link href={`/post/edit/${post.id}`}>
                  <h3>
                    <b>Edit</b>
                  </h3>
                </Link>
              )}
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              <p>{post.userId}</p>
              <p>{post.id}</p>
              <br />
            </div>
          ))}
      </div>
    </div>
  );
};

export { Posts };
