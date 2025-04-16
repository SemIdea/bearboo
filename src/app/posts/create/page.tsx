"use client";

import { useCreatePost } from "./page.client";

const Page = () => {
  const { handleCreatePost, isUploading, successMessage, errorMessage } =
    useCreatePost();

  return (
    <div>
      <h2>Create Post</h2>
      <form onSubmit={handleCreatePost}>
        <input required name="title" placeholder="Title" type="text" />
        <textarea required name="content" placeholder="Content" />
        <button type="submit">Create Post</button>
      </form>
      {isUploading && <p>Uploading...</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
};

export default Page;
