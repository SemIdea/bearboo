import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PostModel } from "@/server/models/post";

const NOT_FOUND_PATH = "/404";
const RESERVED_SLUGS = new Set(["create", "mine"]);

const proxy = async (request: NextRequest) => {
	request.headers.set("x-url", request.url);

	const passThrough = () =>
		NextResponse.next({ request: { headers: request.headers } });

	if (request.method !== "GET" && request.method !== "HEAD") {
		return passThrough();
	}

	const segments = request.nextUrl.pathname.split("/").filter(Boolean);

	if (segments.length !== 2 || segments[0] !== "post") {
		return passThrough();
	}

	const slug = decodeURIComponent(segments[1] ?? "");

	if (!slug || RESERVED_SLUGS.has(slug)) {
		return passThrough();
	}

	try {
		const exists = await PostModel.existsBySlug(slug);

		if (exists) {
			return passThrough();
		}
	} catch {
		return passThrough();
	}

	const url = request.nextUrl.clone();

	url.pathname = NOT_FOUND_PATH;
	url.search = "";

	return NextResponse.rewrite(url, { status: 404 });
};

export { proxy };

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
