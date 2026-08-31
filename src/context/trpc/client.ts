import {
	httpBatchLink,
	httpLink,
	isNonJsonSerializable,
	splitLink,
} from "@trpc/client";
import { loggerLink } from "@trpc/react-query";
import superjson from "superjson";
import { trpc } from "@/app/_trpc/client";
import { sessionRefreshLink } from "./sessionRefreshLink";

export const createTRPCClient = () => {
	return trpc.createClient({
		links: [
			loggerLink({
				enabled: (opts) => {
					// `path` is spread into `opts` at runtime for the "down" direction too
					// (see @trpc/client's loggerLink), but its public type omits it there.
					const path = (opts as { path?: string }).path;
					const isExpectedAnonymousSessionCheck =
						opts.direction === "down" &&
						path === "auth.session.me" &&
						"data" in opts.result &&
						opts.result.data?.code === "UNAUTHORIZED";

					return !isExpectedAnonymousSessionCheck;
				},
			}),
			sessionRefreshLink,
			// httpBatchLink can't carry FormData/File input (media.upload) — it JSON-encodes
			// every op in the batch. splitLink routes non-JSON-serializable input to the
			// unbatched httpLink instead, which streams it as multipart/form-data.
			splitLink({
				condition: (op) => isNonJsonSerializable(op.input),
				true: httpLink({
					transformer: superjson,
					url: "/api/trpc",
				}),
				false: httpBatchLink({
					transformer: superjson,
					url: "/api/trpc",
				}),
			}),
		],
	});
};
