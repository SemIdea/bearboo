import { Suspense } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchResults } from "./page.client";

const Page = () => {
	return (
		<Card className="border-0 shadow-none">
			<CardHeader>
				<CardTitle>Search</CardTitle>
			</CardHeader>
			<Suspense fallback={<p>Loading...</p>}>
				<SearchResults />
			</Suspense>
		</Card>
	);
};

export default Page;
