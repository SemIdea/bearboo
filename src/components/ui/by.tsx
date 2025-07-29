import Link from "next/link";

const By = ({ name, id }: { name: string; id: string }) => {
  return (
    <>
      By{" "}
      <Link href={`/user/${id}`} className="text-blue-600 hover:underline">
        {name}
      </Link>
      {" • "}
    </>
  );
};

export { By };
