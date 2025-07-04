"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth";
import { PostFeed } from "@/components/postFeed";
import { SearchPost } from "@/components/ui/searchPost";

const Home = () => {
  const { session, logout } = useAuth();

  // const { data: testQuery } = trpc.auth.test.useQuery();

  // useEffect(() => {
  //   console.log(testQuery);
  // }, [testQuery]);

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <p>
        {session ? (
          <>
            <Link href={`/user/${session.user.id}`}>
              You are logged in as <strong>{session.user.email}</strong>
            </Link>
            <span
              className="ml-2 text-blue-500 cursor-pointer hover:underline"
              role="button"
              onClick={() => logout()}
            >
              <b>Log Out</b>
            </span>
          </>
        ) : (
          <>
            <span>You are not logged in</span>
            <br />
            <Link href={"/auth/login"}>
              <b>Log In</b>
            </Link>
            <br />
            <Link href={"/auth/register"}>
              <b>Register</b>
            </Link>
          </>
        )}
      </p>

      <SearchPost />

      <Link href={"/post/create"}>
        <h2>Create post</h2>
      </Link>

      <PostFeed />
    </section>
  );
};

export default Home;
