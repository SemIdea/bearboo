"use client";

import { useCreatePost } from "./page.client";

const Page = () => {
  const { handleCreatePost, isUploading, successMessage, errorMessage } =
    useCreatePost();
  return (
    <div>
      <h2>Create Post</h2>
      <form onSubmit={handleCreatePost}>
        <input type="text" name="title" placeholder="Title" required />
        <textarea name="content" placeholder="Content" required></textarea>
        <button type="submit">Create Post</button>
      </form>
      {isUploading && <p>Uploading...</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
};

export default Page;
