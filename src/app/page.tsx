"use client";

import { useAuth } from "@/context/auth";
import { PostFeed } from "@/components/postFeed";

const Home = () => {
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
          <span>You are not logged in</span>
        )}
      </p>

      <PostFeed />
    </section>
  );
};

export default Home;
