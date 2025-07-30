"use client";

import { trpc } from "@/app/_trpc/client";
import { useAuth } from "@/context/auth";
import { formatDistance } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown";
import { BsThreeDots } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import { IPostEntity } from "@/server/entities/post/DTO";
import { ICommentEntity } from "@/server/entities/comment/DTO";
import Link from "next/link";

const Post = ({ post, index }: { post: IPostEntity; index: number }) => {
  return (
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
  );
};

const UserPosts = ({ id }: { id: string }) => {
  const { data: posts, isLoading } = trpc.user.readPosts.useQuery({
    id
  });

  return (
    <>
      {isLoading && <p>Loading posts...</p>}
      {!isLoading && !posts?.length && <p>No posts found.</p>}
      {posts?.length && (
        <ul className="space-y-2">
          {posts.map((post, index) => (
            <Post key={post.id} post={post} index={index} />
          ))}
        </ul>
      )}
    </>
  );
};

const Comment = ({
  comment,
  index
}: {
  comment: ICommentEntity;
  index: number;
}) => {
  return (
    <li key={comment.id} className="flex">
      <span className="mr-2">{index + 1}.</span>
      <div>
        <Link href={`/post/${comment.postId}`} className="hover:underline">
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
  );
};

const UserComments = ({ id }: { id: string }) => {
  const { data: comments, isLoading } = trpc.user.readComments.useQuery({
    id
  });

  return (
    <>
      {isLoading && <p>Loading comments...</p>}
      {!isLoading && !comments?.length && <p>No comments found.</p>}
      {comments?.length && (
        <ul>
          {comments.map((comment, index) => (
            <Comment key={comment.id} comment={comment} index={index} />
          ))}
        </ul>
      )}
    </>
  );
};

const UpdateUserSection = ({ id }: { id: string }) => {
  const { session, isLoadingSession } = useAuth();

  if (isLoadingSession || !session || session.user.id !== id) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="ml-auto">
          <BsThreeDots />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Link href={`/user/profile`} className="w-full">
            Update Profile
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { UpdateUserSection, UserPosts, UserComments };
