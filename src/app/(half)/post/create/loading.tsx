import { FormSkeleton } from "@/components/skeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Loading = () => {
	return (
		<Card className="border-0 shadow-none">
			<CardHeader>
				<CardTitle>Create Post</CardTitle>
			</CardHeader>
			<CardContent>
				<FormSkeleton />
			</CardContent>
		</Card>
	);
};

export default Loading;
