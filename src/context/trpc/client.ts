import { httpBatchLink, loggerLink } from "@trpc/react-query";
import superjson from "superjson";
import { trpc } from "@/app/_trpc/client";
import { sessionRefreshLink } from "./sessionRefreshLink";

export const createTRPCClient = () => {
	return trpc.createClient({
		links: [
			loggerLink({
				enabled: () => true,
			}),
			sessionRefreshLink,
			httpBatchLink({
				transformer: superjson,
				url: "/api/trpc",
			}),
		],
	});
};
