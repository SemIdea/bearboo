"use client";

import { usePost } from "@/context/post";

const Posts = ({ max }: { max: number }) => {
  const { findAllPosts } = usePost();

  const { data: posts, isLoading, error } = findAllPosts();

  return (
    <div>
      <p>
        {isLoading ? (
          <span>Loading...</span>
        ) : error ? (
          <span>Error: {error.message}</span>
        ) : (
          <span>No posts available.</span>
        )}
      </p>
      <div>
        {posts &&
          posts.length > 0 &&
          posts.slice(0, max).map((post) => (
            <div key={post.id}>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export { Posts };
