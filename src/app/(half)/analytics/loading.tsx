import { AnalyticsSkeleton } from "@/components/skeletons";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const Loading = () => {
	return (
		<Card className="border-0 shadow-none">
			<CardHeader>
				<CardTitle>Analytics</CardTitle>
				<CardDescription>Total views and most accessed posts</CardDescription>
			</CardHeader>
			<CardContent>
				<AnalyticsSkeleton />
			</CardContent>
		</Card>
	);
};

export default Loading;
