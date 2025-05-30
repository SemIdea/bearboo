"use client";

import { useGetUserProfile } from "./page.client";

const Page = () => {
  const { user, posts, isPostsLoading, isUserLoading } = useGetUserProfile();

  // Todo, find a way implement profile with posts
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <h2 className="text-2xl font-semibold">User Profile</h2>

      {isUserLoading ? (
        <p>Loading user...</p>
      ) : user ? (
        <div className="text-center">
          <p>Email: {user.email}</p>
          <p>Id: {user.id}</p>
        </div>
      ) : (
        <p>User not found.</p>
      )}

      <h3 className="text-xl font-medium mt-6">Posts</h3>

      {isPostsLoading ? (
        <p>Loading posts...</p>
      ) : posts?.length ? (
        <ul className="w-full max-w-md space-y-4">
          {posts.map((post) => (
            <li key={post.id} className="border p-4 rounded-lg shadow">
              <h4 className="font-semibold text-lg">{post.title}</h4>
              <p className="text-gray-600">{post.content}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No posts found.</p>
      )}
    </div>
  );
};

export default Page;
