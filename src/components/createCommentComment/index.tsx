"use client";

import { useState } from "react";
import { useCreateComment } from "./index.client";

const CreateCommentSection = () => {
  const { createComment, postId, isUploading, errorMessage, successMessage } =
    useCreateComment();

  const [comment, setComment] = useState("");

  const handleCreateComment = () => {
    if (!comment) {
      return alert("Comment cannot be empty.");
    }

    createComment({
      postId,
      content: comment
    });

    setComment("");
  };

  return (
    <div>
      <h2>Create Comment</h2>
      <input
        placeholder="Your comment"
        type="text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button
        disabled={isUploading || !comment}
        type="submit"
        onClick={handleCreateComment}
      >
        Comment
      </button>
      {isUploading && <p>Uploading...</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
};

export { CreateCommentSection };
