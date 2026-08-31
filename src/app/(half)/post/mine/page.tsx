import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MyPostsDescription, MyPostsPanel } from "./page.client";

const Page = () => {
	return (
		<Card className="border-0 shadow-none">
			<CardHeader>
				<CardTitle>My Posts</CardTitle>
				<MyPostsDescription />
			</CardHeader>
			<CardContent>
				<MyPostsPanel />
			</CardContent>
		</Card>
	);
};

export default Page;
