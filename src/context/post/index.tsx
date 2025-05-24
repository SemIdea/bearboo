"use client";

import { createContext, useContext } from "react";
import { usePostLogic, UsePostLogicReturn } from "./index.hook";

type PostProviderProps = {
  children: React.ReactNode;
};

const PostContext = createContext<UsePostLogicReturn>({} as UsePostLogicReturn);

const PostProvider = ({ children }: PostProviderProps) => {
  const { createPost, findPost, findAllPosts, updatePost, deletePost } =
    usePostLogic();

  return (
    <PostContext.Provider
      value={{
        createPost,
        findPost,
        findAllPosts,
        updatePost,
        deletePost,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

const usePost = () => {
  const context = useContext(PostContext);

  if (!context) {
    throw new Error("usePost must be used within an PostProvider");
  }

  return context;
};

export { PostProvider, usePost };
