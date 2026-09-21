import { MyPostsSkeleton } from "@/components/skeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
	return (
		<Card className="border-0 shadow-none">
			<CardHeader>
				<CardTitle>My Posts</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-4">
					<div className="flex flex-wrap gap-2">
						<Skeleton className="h-9 w-40" />
						<Skeleton className="h-9 w-40" />
						<Skeleton className="h-9 w-40" />
					</div>
					<MyPostsSkeleton />
				</div>
			</CardContent>
		</Card>
	);
};

export default Loading;
