"use client";

import { useEffect } from "react";
import { trpc } from "./_trpc/client";
import { useAuth } from "@/context/auth";
import { usePost } from "@/context/post";

export default function Home() {
  const { session } = useAuth();
  const { findAllPosts } = usePost();

  const { data: testQuery } = trpc.auth.test.useQuery();
  const { data: posts, isLoading, error } = findAllPosts();

  useEffect(() => {
    console.log(testQuery);
    console.log(posts);
  }, [testQuery]);

  // useEffect(() => {
  //   const posts = findAllPosts();
  //   console.log(posts);
  // }, [findAllPosts]);

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <h2>Hello World!</h2>
      <p>Posts</p>
      <p>{JSON.stringify(posts)}</p>
      <p>{JSON.stringify(session)}</p>
      <p>
        {session ? (
          <span>
            You are logged in as <strong>{session.user.email}</strong>
          </span>
        ) : (
          <span>You are not logged in</span>
        )}
      </p>
    </section>
  );
}
