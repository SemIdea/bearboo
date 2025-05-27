"use client";

import { useGetPost } from "./page.client";

const Page = () => {
  const { post, isPostLoading } = useGetPost();

  return (
    <div>
      <h2>Post Details</h2>
      {isPostLoading ? (
        <p>Loading...</p>
      ) : post ? (
        <div>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
        </div>
      ) : (
        <p>Post not found.</p>
      )}
    </div>
  );
};

export default Page;
