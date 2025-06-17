"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useCreatePost } from "./page.client";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const Page = () => {
  const { createPost, isUploading, successMessage, errorMessage } =
    useCreatePost();

  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");

  const handleCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title || !content) {
      return alert("Title and content are required.");
    }

    createPost({
      title,
      content
    });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <h2>Create Post</h2>
      <form onSubmit={handleCreatePost}>
        <input
          required
          name="title"
          placeholder="Title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <br />
        <br />
        <MDEditor
          hideToolbar
          className="markdown w-[800px]"
          preview="live"
          value={content}
          onChange={(v) => {
            setContent(v || "");
          }}
        />
        <button type="submit">Create Post</button>
      </form>
      {isUploading && <p>Uploading...</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
};

export default Page;
