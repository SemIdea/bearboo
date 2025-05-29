"use client";

import { useEffect, useState } from "react";
import { useUpdatePost } from "./page.client";

const Page = () => {
  const {
    handleUpdatePost,
    handleDeletePost,
    isUploading,
    successMessage,
    errorMessage,
    post,
  } = useUpdatePost();

  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
    }
  }, [post]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <h2>Edit Post</h2>
      <form onSubmit={(e) => handleUpdatePost(e)}>
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
        <textarea
          required
          name="content"
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button type="submit">Edit Post</button>
      </form>
      <button onClick={handleDeletePost}>Delete Post</button>
      {isUploading && <p>Uploading...</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
};

export default Page;
