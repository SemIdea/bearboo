import { trpc } from "@/app/_trpc/client";

const usePostLogic = () => {
  const { mutate: createPost } = trpc.post.createPost.useMutation();

  const { useQuery: findPost } = trpc.post.findPost;
  const { useQuery: findAllPosts } = trpc.post.findAllPost;

  const { useMutation: updatePost } = trpc.post.updatePost;

  const { useMutation: deletePost } = trpc.post.deletePost;

  return {
    createPost,
    findPost,
    findAllPosts,
    updatePost,
    deletePost
  };
};

type UsePostLogicReturn = ReturnType<typeof usePostLogic>;

export { usePostLogic };

export type { UsePostLogicReturn };
