"use client";

import { useEffect } from "react";
import { trpc } from "./_trpc/client";

export default function Home() {
  // const { data: configQuery } = trpc.config.get.useQuery();

  const { data: testQuery } = trpc.auth.test.useQuery();

  useEffect(() => {
    console.log(testQuery);
  }, [testQuery]);

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <h2>Hello World!</h2>
    </section>
  );
}
