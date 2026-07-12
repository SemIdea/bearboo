import { trpc } from "@/app/_trpc/client";

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;
export let trpcClientInstance: ReturnType<typeof trpc.createClient> | null =
	null;

const setTRPCClientInstance = (
	client: ReturnType<typeof trpc.createClient>,
) => {
	trpcClientInstance = client;
};

const refreshTokens = async (): Promise<void> => {
	if (typeof window === "undefined")
		throw new Error("Server-side can't refresh");
	if (!trpcClientInstance) throw new Error("No refresh setup");

	if (isRefreshing) return refreshPromise!;

	isRefreshing = true;
	refreshPromise = (async () => {
		try {
			await trpcClientInstance!.auth.refreshSession.mutate();
		} finally {
			isRefreshing = false;
			refreshPromise = null;
		}
	})();

	return refreshPromise;
};

export { refreshTokens, setTRPCClientInstance };
