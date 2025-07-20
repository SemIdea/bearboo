"use client";

import { trpc } from "@/app/_trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { IUserWithSession } from "@/server/entities/user/DTO";
import { useState } from "react";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false
});

const useUpdateUser = (user: IUserWithSession) => {
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
      setErrorMessage(getErrorMessage(error.message));
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
  } = useUpdateUser(user);

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>Update Profile</CardHeader>
      <CardContent>
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <div className="grid gap-3">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              // disabled={isLoading}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              // disabled={isLoading}
              required
            />
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <MDEditor
              className="markdown markdown-editor"
              preview="live"
              value={bio}
              onChange={(v) => {
                setBio(v || "");
              }}
            />
          </div>
          <div className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isUploading}>
              {isUploading ? "Updating..." : "Update Profile"}
            </Button>
            {errorMessage && (
              <p className="text-red-600 text-sm text-center">{errorMessage}</p>
            )}
            {successMessage && (
              <p className="text-green-600 text-sm text-center">
                {successMessage}
              </p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export { UpdateUserForm };
