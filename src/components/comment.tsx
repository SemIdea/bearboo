import { ICommentEntityWithUser } from "@/server/entities/comment/DTO";
import { CardComponent } from "./card";
import { formatDistance } from "date-fns";
import { By } from "./ui/by";
import { MdView } from "./ui/mdView";
import { MdEditor } from "./ui/mdEditor";
import { Button } from "./ui/button";
import { ErrorMessage } from "./ui/errorMessage";
import { useState } from "react";

const CommentDescription = ({
  comment,
  isOwner,
  isDeleting,
  isEditing,
  setCommentBeingEdited,
  handleDelete
}: {
  comment: ICommentEntityWithUser;
  isOwner: boolean;
  isDeleting: boolean;
  isEditing: boolean;
  setCommentBeingEdited: (id: string) => void;
  handleDelete: (id: string) => void;
}) => {
  const createdAt = formatDistance(new Date(comment.createdAt), new Date(), {
    addSuffix: true
  });

  const isUpdated =
    new Date(comment.createdAt).getTime() !==
    new Date(comment.updatedAt).getTime();

  const isOwnerSection = (
    <div className="flex gap-4">
      <Button variant="ghost" onClick={() => setCommentBeingEdited(comment.id)}>
        Edit
      </Button>
      <Button
        variant="destructive"
        onClick={() => handleDelete(comment.id)}
        disabled={isDeleting}
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </Button>
    </div>
  );

  return (
    <div className="flex items-center justify-between">
      <div>
        <By name={comment.user.name} id={comment.userId} />
        {createdAt}
        {isUpdated
          ? ` (edited ${formatDistance(new Date(comment.updatedAt), new Date(), { addSuffix: true })})`
          : ""}
      </div>
      {isOwner && !isEditing && isOwnerSection}
    </div>
  );
};

const CommentContent = ({ comment }: { comment: ICommentEntityWithUser }) => {
  return <MdView source={comment.content} />;
};

const CommentEditor = ({
  comment,
  isUpdating,
  errorMessage,
  handleUpdate,
  handleCancelUpdate
}: {
  comment: ICommentEntityWithUser;
  isUpdating: boolean;
  errorMessage: string | null;
  handleUpdate: (updateComment: ICommentEntityWithUser) => void;
  handleCancelUpdate: () => void;
}) => {
  const [editComment, setEditComment] = useState(comment.content || "");

  return (
    <div className="space-y-4">
      <MdEditor
        preview="live"
        value={editComment}
        onChange={(v) => setEditComment(v || "")}
      />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={handleCancelUpdate}>
          Cancel
        </Button>
        <Button
          disabled={isUpdating || !editComment.trim()}
          onClick={() =>
            handleUpdate({
              ...comment,
              content: editComment.trim()
            })
          }
        >
          {isUpdating ? "Saving..." : "Save"}
        </Button>
      </div>
      <ErrorMessage error={errorMessage} />
    </div>
  );
};

const Comment = ({
  comment,
  editing,
  isOwner,
  isUpdating,
  isDeleting,
  errorMessage,
  setCommentBeingEdited,
  handleUpdate,
  handleDelete
}: {
  comment: ICommentEntityWithUser;
  editing: boolean;
  isOwner: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  errorMessage: string | null;
  setCommentBeingEdited: (id: string) => void;
  handleUpdate: (updateComment: ICommentEntityWithUser) => void;
  handleDelete: (id: string) => void;
}) => {
  return (
    <CardComponent
      description={
        <CommentDescription
          comment={comment}
          isOwner={isOwner}
          isDeleting={isDeleting}
          isEditing={editing}
          setCommentBeingEdited={setCommentBeingEdited}
          handleDelete={handleDelete}
        />
      }
      content={
        <>
          {!editing && <CommentContent comment={comment} />}
          {editing && (
            <CommentEditor
              comment={comment}
              isUpdating={isUpdating}
              errorMessage={errorMessage}
              handleUpdate={handleUpdate}
              handleCancelUpdate={() => setCommentBeingEdited("")}
            />
          )}
        </>
      }
    />
  );
};

export { Comment };
