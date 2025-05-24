"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import { PostFeed } from "@/components/postFeed";

const Home = () => {
  const router = useRouter();
  const { session } = useAuth();

  // const { data: testQuery } = trpc.auth.test.useQuery();

  // useEffect(() => {
  //   console.log(testQuery);
  // }, [testQuery]);

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <p>
        {session ? (
          <span>
            You are logged in as <strong>{session.user.email}</strong>
          </span>
        ) : (
          <>
            <span>You are not logged in</span>
            <br />
            <Link href={"auth/login"}>
              <b>Log In</b>
            </Link>
            <br />
            <Link href={"auth/register"}>
              <b>Register</b>
            </Link>
          </>
        )}
      </p>

      <Link href={"post/create"}>
        <h2>Create post</h2>
      </Link>
      
      <PostFeed />
    </section>
  );
};

export default Home;
