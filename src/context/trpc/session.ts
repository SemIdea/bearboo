import { clearAuthData } from "@/utils/authStorage";
import { trpc } from "@/app/_trpc/client";

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;
export let trpcClientInstance: ReturnType<typeof trpc.createClient> | null =
  null;

const setTRPCClientInstance = (
  client: ReturnType<typeof trpc.createClient>
) => {
  trpcClientInstance = client;
};

const refreshTokens = async (): Promise<void> => {
  if (typeof window === "undefined")
    throw new Error("Server-side can't refresh");
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken || !trpcClientInstance) throw new Error("No refresh setup");

  if (isRefreshing) return refreshPromise!;

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const data = await trpcClientInstance!.auth.refreshSession.mutate({
        refreshToken
      });
      document.cookie = `accessToken=${data.accessToken}; path=/; secure; samesite=strict`;
      localStorage.setItem("refreshToken", data.refreshToken);
    } catch (error) {
      clearAuthData();
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export { setTRPCClientInstance, refreshTokens };
