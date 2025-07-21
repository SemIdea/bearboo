"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle } from "./ui/card";
import { useAuth } from "@/context/auth";
import { FaPlus } from "react-icons/fa";
import { Button } from "./ui/button";
import { trpc } from "@/app/_trpc/client";

const Header = () => {
  const { session, clearSession } = useAuth();

  const { mutate: logout } = trpc.auth.session.logout.useMutation({
    onSuccess: () => {
      clearSession();
    },
    onError: (error) => {
      console.error("Logout error:", error);
    }
  });

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <Link href="/">
            <h2 className="text-2xl font-bold hover:underline">BearBoo</h2>
          </Link>
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link href="/post/create" className="hover:underline">
                  <FaPlus className="size-4" />
                </Link>
                <h2>
                  <Link
                    className="hover:underline"
                    href={`/user/${session.user.id}`}
                  >
                    {session.user.name}
                  </Link>
                </h2>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => logout()}
                >
                  Logout
                </Button>
              </>
            ) : (
              <span className="text-gray-500">You are not logged in</span>
            )}
          </div>
        </CardTitle>
      </CardHeader>
    </Card>
  );
};

export { Header };
