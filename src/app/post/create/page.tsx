import { CreatePostForm } from "./page.client";

const Page = () => {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-[55%]">
        <CreatePostForm />
      </div>
    </div>
  );
};

export default Page;
