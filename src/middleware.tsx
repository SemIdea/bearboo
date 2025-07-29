import { NextRequest, NextResponse } from "next/server";

function middleware(request: NextRequest) {
  request.headers.set("x-url", request.url);

  return NextResponse.next({
    request: {
      headers: request.headers
    }
  });
}

export default middleware;
