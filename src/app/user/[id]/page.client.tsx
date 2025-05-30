"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/app/_trpc/client";

type Params = {
  id: string;
};

const useGetUserProfile = () => {
  const { id: userId } = useParams<Params>();

  const { data: user, isLoading: isUserLoading } = trpc.user.profile.useQuery(
    { id: userId },
    {
      enabled: !!userId,
    },
  );

  return {
    user,
    isUserLoading,
  };
};

export { useGetUserProfile };
