import { MediaGridSkeleton } from "@/components/skeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
	return (
		<Card className="border-0 shadow-none">
			<CardHeader>
				<CardTitle>Media</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-6">
					<div className="flex flex-col gap-2">
						<Skeleton className="h-9 w-full" />
						<Skeleton className="h-9 w-full" />
						<Skeleton className="h-9 w-24" />
					</div>
					<MediaGridSkeleton />
				</div>
			</CardContent>
		</Card>
	);
};

export default Loading;
