import { CreatePostForm } from "./page.client";

const Page = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <h2>Create Post</h2>
      <CreatePostForm />
    </div>
  );
};

export default Page;
