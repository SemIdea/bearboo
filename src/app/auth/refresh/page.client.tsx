"use client";

import { trpc } from "@/app/_trpc/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { clearAuthData } from "@/utils/authStorage";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

const SessionRefresher = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const { mutate: refreshSession } = trpc.auth.refreshSession.useMutation({
    onSuccess: (data) => {
      document.cookie = `accessToken=${data.accessToken}; path=/;`;
      localStorage.setItem("refreshToken", data.refreshToken);

      router.push(redirect);
    },
    onError: () => {
      clearAuthData();
      router.push("/auth/login");
    }
  });

  useEffect(() => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      clearAuthData();
      router.push("/auth/login");
      return;
    }

    refreshSession({ refreshToken });
  }, [redirect]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Session Refresh</CardTitle>
          <CardDescription>
            We are refreshing your session. Please wait...
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p>Refreshing your session...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionRefresher;
