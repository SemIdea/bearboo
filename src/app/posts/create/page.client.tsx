"use client";

import { useAuth } from "@/context/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const useCreatePost = () => {
  const router = useRouter();
  const { session } = useAuth();

  useEffect(() => {
    if (!session) {
      router.push("/auth/login");
    }
  }, [session]);

  const handleCreatePost = async (postData: any) => {
    // Logic to handle post creation
    console.log("Post data:", postData);
    // Redirect or update state as needed
  };

  return {
    handleCreatePost,
  };
};

export { useCreatePost };
