import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { AnalyticsDashboard } from "./page.client";

const Page = () => {
	return (
		<Card className="border-0 shadow-none">
			<CardHeader>
				<CardTitle>Analytics</CardTitle>
				<CardDescription>Total views and most accessed posts</CardDescription>
			</CardHeader>
			<CardContent>
				<AnalyticsDashboard />
			</CardContent>
		</Card>
	);
};

export default Page;
