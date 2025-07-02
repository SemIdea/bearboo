"use client";

import { trpc } from "@/app/_trpc/client";
import { IUserWithSession } from "@/server/entities/user/DTO";
import { useState } from "react";

const UseUpdateUser = (user: IUserWithSession) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [bio, setBio] = useState(user.bio || "");

  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<null | string>(null);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  const { mutate: updateUser } = trpc.user.update.useMutation({
    onSuccess: () => {
      setSuccessMessage("User updated successfully!");
      setErrorMessage(null);
      setIsUploading(false);
    },
    onError: (error) => {
      setErrorMessage(error.message);
      setSuccessMessage(null);
      setIsUploading(false);
    }
  });

  const handleUpdateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    updateUser({
      name,
      email,
      bio
    });
  };

  return {
    name,
    setName,
    email,
    setEmail,
    bio,
    setBio,
    handleUpdateUser,
    isUploading,
    successMessage,
    errorMessage
  };
};

const UpdateUserForm = ({ user }: { user: IUserWithSession }) => {
  const {
    name,
    setName,
    email,
    setEmail,
    bio,
    setBio,
    handleUpdateUser,
    isUploading,
    successMessage,
    errorMessage
  } = UseUpdateUser(user);

  return (
    <form onSubmit={handleUpdateUser}>
      <div>
        <label>Name</label>
        <br />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label>Email</label>
        <br />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label>Bio</label>
        <br />
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>
      <button type="submit" disabled={isUploading}>
        {isUploading ? "Updating..." : "Update User"}
      </button>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      {successMessage && <p className="text-green-500">{successMessage}</p>}
    </form>
  );
};

export { UpdateUserForm };
