"use client";

import { trpc } from "@/app/_trpc/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { clearAuthData } from "@/utils/authStorage";

const SessionRefresher = () => {
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
    <div className="flex flex-col items-center justify-center py-10">
      <h2>Refreshing session…</h2>
      <p>Hold on while we refresh your session.</p>
    </div>
  );
};

export default SessionRefresher;
