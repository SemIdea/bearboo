"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/app/_trpc/client";

type Params = {
  id: string;
};

const useGetUserProfile = () => {
  const { id: userId } = useParams<Params>();

  const { data: user, isLoading: isUserLoading } = trpc.user.profile.useQuery(
    { userId: userId },
    {
      enabled: !!userId
    }
  );

  const { data: posts, isLoading: isPostsLoading } = trpc.user.posts.useQuery(
    { userId: userId },
    { enabled: !!userId }
  );

  return {
    user,
    posts,
    isPostsLoading,
    isUserLoading
  };
};

export { useGetUserProfile };
