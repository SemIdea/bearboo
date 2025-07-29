import { createDynamicCaller } from "@/server/caller";
import { DeletePostButton, UpdatePostForm } from "./page.client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const Page = async (props: PageProps) => {
  const params = await props.params;
  const { id } = params;

  const { caller } = await createDynamicCaller();

  const post = await caller.post.read({ id });

  return (
      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>Edit Post</CardTitle>
          <CardDescription className="flex items-center justify-between">
            Update your post details below
            <div className="flex justify-end">
              <DeletePostButton post={post} />
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UpdatePostForm post={post} />
        </CardContent>
      </Card>
  );
};

export default Page;
