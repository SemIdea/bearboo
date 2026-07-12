import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { MyPostsPanel } from "./page.client";

const Page = () => {
	return (
		<Card className="border-0 shadow-none">
			<CardHeader>
				<CardTitle>My Posts</CardTitle>
				<CardDescription>
					All your posts, including drafts and archived ones
				</CardDescription>
			</CardHeader>
			<CardContent>
				<MyPostsPanel />
			</CardContent>
		</Card>
	);
};

export default Page;
