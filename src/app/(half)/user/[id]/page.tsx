import { UpdateUserSection, UserComments, UserPosts } from "./page.client";
import { CardComponent } from "@/components/card";
import { createCaller } from "@/server/caller";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MdView } from "@/components/ui/mdView";

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
    <CardComponent
      title={
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-bold">{user.name}'s Profile</h2>
          <UpdateUserSection id={user.id} />
        </div>
      }
      content={
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <div className="space-y-1 font-normal">
              <h2 className="font-semibold">Bio</h2>
              <CardComponent
                title={<MdView source={user.bio || "No bio available"} />}
                titleBold={false}
                border
              />
            </div>
          </TabsContent>
          <TabsContent value="posts">
            <CardComponent content={<UserPosts id={user.id} />} />
          </TabsContent>
          <TabsContent value="comments">
            <CardComponent content={<UserComments id={user.id} />} />
          </TabsContent>
        </Tabs>
      }
    />
  );
};

export default Page;
