"use client";

import { useCreatePost } from "./page.client";

const Page = () => {
  const { handleCreatePost } = useCreatePost();
  return <h2>Create Post Form</h2>;
};

export default Page;
