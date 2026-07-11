import { cacheLife } from "next/cache";
import { Suspense } from "react";
import { CardBase } from "@/components/cardBase";
import { MdView } from "@/components/ui/mdView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createCaller } from "@/server/caller";
import { UpdateUserSection, UserComments, UserPosts } from "./page.client";

type PageProps = {
	params: Promise<{
		id: string;
	}>;
};

const Page = (props: PageProps) => {
	return (
		<Suspense fallback={<p>Loading profile...</p>}>
			<UserContent params={props.params} />
		</Suspense>
	);
};

const UserContent = async ({ params: paramsPromise }: PageProps) => {
	"use cache";
	cacheLife("hours"); // 1 hour

	const params = await paramsPromise;
	const caller = await createCaller();

	const { id } = params;

	const user = await caller.user.read({ id });

	return (
		<CardBase
			title={
				<div className="flex items-center justify-between">
					<h2 className="text-4xl font-bold">{user.name}'s Profile</h2>
					<UpdateUserSection id={user.id} />
				</div>
			}
			content={
				<Tabs defaultValue="profile">
					<TabsList>
						<TabsTrigger value="profile">Profile</TabsTrigger>
						<TabsTrigger value="posts">Posts</TabsTrigger>
						<TabsTrigger value="comments">Comments</TabsTrigger>
					</TabsList>
					<TabsContent value="profile">
						<div className="space-y-1 font-normal">
							<h2 className="font-semibold">Bio</h2>
							<CardBase
								title={<MdView source={user.bio || "No bio available"} />}
								titleBold={false}
								border
							/>
						</div>
					</TabsContent>
					<TabsContent value="posts">
						<CardBase content={<UserPosts id={user.id} />} />
					</TabsContent>
					<TabsContent value="comments">
						<CardBase content={<UserComments id={user.id} />} />
					</TabsContent>
				</Tabs>
			}
		/>
	);
};

export default Page;
