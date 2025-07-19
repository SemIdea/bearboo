"use client";

import Link from "next/link";
import { trpc } from "@/app/_trpc/client";
import { useAuth } from "@/context/auth";
import { IUserEntity } from "@/server/entities/user/DTO";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MDView } from "@/components/ui/mdview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistance } from "date-fns";

type Params = {
  id: string;
};

const User = ({ user }: { user: Omit<IUserEntity, "password"> }) => {
  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <h2 className="text-4xl font-bold">{user.name}'s Profile</h2>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <UserBio bio={user.bio || ""} />
          </TabsContent>
          <TabsContent value="posts">
            <UserPosts id={user.id} />
          </TabsContent>
          <TabsContent value="comments">
            <UserComments id={user.id} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const UserBio = ({ bio }: { bio: string }) => {
  return (
    <div className="space-y-1">
      <h2 className="font-semibold">Bio</h2>
      <Card>
        <CardHeader>
          <MDView source={bio || "No bio available"} />
        </CardHeader>
      </Card>
    </div>
  );
};

const UserPosts = ({ id }: { id: string }) => {
  const { data: posts, isLoading } = trpc.user.readPosts.useQuery({
    id
  });

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        {isLoading && <p>Loading posts...</p>}
        {!isLoading && !posts?.length && <p>No posts found.</p>}
        {posts?.length && (
          <ul>
            {posts.map((post, index) => (
              <li key={post.id} className="flex">
                <span className="mr-2">{index + 1}.</span>
                <div>
                  <Link href={`/post/${post.id}`} className="hover:underline">
                    <h2 className="font-semibold">{post.title}</h2>
                  </Link>
                  <p className="text-gray-600 text-sm">
                    {formatDistance(new Date(post.createdAt), new Date(), {
                      addSuffix: true
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardHeader>
    </Card>
  );
};

const UserComments = ({ id }: { id: string }) => {
  const { data: comments, isLoading } = trpc.user.readComments.useQuery({
    id
  });

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        {isLoading && <p>Loading comments...</p>}
        {!isLoading && !comments?.length && <p>No comments found.</p>}
        {comments?.length && (
          <ul>
            {comments.map((comment, index) => (
              <li key={comment.id} className="flex">
                <span className="mr-2">{index + 1}.</span>
                <div>
                  <Link
                    href={`/post/${comment.postId}`}
                    className="hover:underline"
                  >
                    <h2 className="italic">
                      "
                      {comment.content.length > 300
                        ? comment.content.slice(0, 300) + "..."
                        : comment.content}
                      "
                    </h2>
                  </Link>
                  <p className="text-gray-600 text-sm">
                    {formatDistance(new Date(comment.createdAt), new Date(), {
                      addSuffix: true
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardHeader>
    </Card>
  );
};

const UpdateUserSection = ({ id }: Params) => {
  const { session, isLoadingSession } = useAuth();

  if (isLoadingSession || !session || session.user.id !== id) {
    return null;
  }

  return (
    <div className="mt-6">
      <Link href={`/user/profile`} className="text-blue-500">
        Update Profile
      </Link>
    </div>
  );
};

export { User, UserPosts, UserComments, UpdateUserSection };
