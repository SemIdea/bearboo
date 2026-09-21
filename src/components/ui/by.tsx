import Link from "next/link";

const By = ({ name, id }: { name: string; id: string }) => {
	return (
		<>
			By{" "}
			<Link
				href={`/user/${id}`}
				className="font-medium text-brand hover:underline"
			>
				{name}
			</Link>
			{" · "}
		</>
	);
};

export { By };
