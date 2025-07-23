import { User } from "./page.client";
import { createCaller } from "@/server/caller";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const revalidate = 3600; // 1 hour

const Page = async (props: PageProps) => {
  const params = await props.params;
  const caller = await createCaller();

  const { id } = params;

  const user = await caller.user.read({ id });

  return (
    <div className="flex justify-center w-full">
      <div className="w-[55%]">
        <User user={user} />
      </div>
    </div>
  );
};

export default Page;
