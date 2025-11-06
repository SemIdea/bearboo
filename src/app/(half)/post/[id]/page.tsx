import { createCaller } from "@/server/caller";
import { CardBase } from "@/components/cardBase";
import { MdView } from "@/components/ui/mdView";
import { formatDistance } from "date-fns";
import { CommentArea } from "./page.client";
import { By } from "@/components/ui/by";
import { Metadata } from "next";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const revalidate = 3600;
type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const caller = await createCaller();
    const post = await caller.post.read({ id: id });

    if (!post) {
      return {
        title: "Post Not Found"
      };
    }

    return {
      title: post.title,
      description: post.content.substring(0, 160),
      openGraph: {
        title: post.title,
        description: post.content.substring(0, 160),
        type: "article"
      }
    };
  } catch {
    return {
      title: "Error | Bearboo"
    };
  }
}

const Page = async (props: PageProps) => {
  const params = await props.params;
  const caller = await createCaller();

  const { id } = params;

  const post = await caller.post.read({ id: id });
  const user = await caller.user.read({ id: post.userId });

  const isUpdated =
    new Date(post.createdAt).getTime() !== new Date(post.updatedAt).getTime();

  const createdAt = formatDistance(new Date(post.createdAt), new Date(), {
    addSuffix: true
  });
  const updatedAt = formatDistance(new Date(post.updatedAt), new Date(), {
    addSuffix: true
  });

  return (
    <CardBase
      title="Post Details"
      description={
        <p>
          <By name={user.name} id={user.id} />
          {createdAt}
          {isUpdated ? ` (edited ${updatedAt})` : ""}
        </p>
      }
      content={
        <div className="flex flex-col gap-4">
          <h2 className="text-4xl font-bold">{post.title}</h2>
          <MdView source={post.content} />
          <CommentArea postId={post.id} />
        </div>
      }
    />
  );
};

export default Page;
