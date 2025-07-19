import { User } from "./page.client";
import { createCaller } from "@/server/caller";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const Page = async (props: PageProps) => {
  const params = await props.params;
  const caller = await createCaller();

  const { id } = params;

  const user = await caller.user.read({ id });

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="w-[55%]">
        <User user={user} />
      </div>
    </div>
  );
};

export default Page;
