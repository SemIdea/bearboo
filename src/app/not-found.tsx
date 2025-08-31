"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h1 className="text-9xl text-blue-500">404</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <Link href="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
