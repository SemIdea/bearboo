import { SearchResultsSkeleton } from "@/components/skeletons";

const Loading = () => {
	return (
		<div className="mx-auto flex w-full max-w-[680px] flex-col gap-8 pt-14 pb-24">
			<h1 className="text-3xl font-bold tracking-tight">Search</h1>
			<SearchResultsSkeleton />
		</div>
	);
};

export default Loading;
