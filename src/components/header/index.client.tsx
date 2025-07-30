"use client";

import { FaPlus } from "react-icons/fa";
import { Button } from "../ui/button";
import { useAuth } from "@/context/auth";
import { trpc } from "@/app/_trpc/client";
import Link from "next/link";

const AuthenticatedHeader = () => {
  const { session, clearSession } = useAuth();

  const { mutate: logout } = trpc.auth.session.logout.useMutation({
    onSuccess: () => {
      clearSession();
    },
    onError: (error) => {
      console.error("Logout error:", error);
    }
  });

  if (!session) {
    return null;
  }

  return (
    <>
      <Link href="/post/create" className="hover:underline">
        <FaPlus className="size-4" />
      </Link>
      <h2>
        <Link className="hover:underline" href={`/user/${session.user.id}`}>
          {session.user.name}
        </Link>
      </h2>
      <Button variant="destructive" size="sm" onClick={() => logout()}>
        Logout
      </Button>
    </>
  );
};

const UnauthenticatedHeader = () => {
  const { session } = useAuth();

  if (session) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <Link href="/auth/login" className="hover:underline">
        Login
      </Link>
      <Link href="/auth/register" className="hover:underline">
        Register
      </Link>
    </div>
  );
};

const AuthSection = () => {
  const { session } = useAuth();

  if (session) {
    return <AuthenticatedHeader />;
  }

  return <UnauthenticatedHeader />;
};

export { AuthSection };
