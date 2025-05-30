"use client";

import { useGetUserProfile } from "./page.client";

const Page = () => {
  const { user, isUserLoading } = useGetUserProfile();

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <h2>User Profile</h2>
      {isUserLoading ? (
        <p>Loading...</p>
      ) : user ? (
        <div>
          <p>Email: {user.email}</p>
          <p>Id: {user.id}</p>
        </div>
      ) : (
        <p>User not found.</p>
      )}
    </div>
  );
};

export default Page;
