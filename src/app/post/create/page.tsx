"use client";

import dynamic from "next/dynamic";
import { useCreatePost } from "./page.client";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const Page = () => {
  const {
    title,
    setTitle,
    content,
    setContent,
    handleCreatePost,
    isUploading,
    successMessage,
    errorMessage
  } = useCreatePost();

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
