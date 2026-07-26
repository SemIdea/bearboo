import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaLibrary } from "./page.client";

const Page = () => {
	return (
		<Card className="border-0 shadow-none">
			<CardHeader>
				<CardTitle>Media</CardTitle>
			</CardHeader>
			<CardContent>
				<MediaLibrary />
			</CardContent>
		</Card>
	);
};

export default Page;
