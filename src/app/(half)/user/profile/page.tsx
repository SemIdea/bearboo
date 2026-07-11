import { Suspense } from "react";
import { CardBase } from "@/components/cardBase";
import { createDynamicCaller } from "@/server/caller";
import { UpdateUserForm } from "./page.client";

const Page = () => {
	return (
		<Suspense fallback={<p>Loading profile...</p>}>
			<ProfileContent />
		</Suspense>
	);
};

const ProfileContent = async () => {
	const { ctx } = await createDynamicCaller();

	const { user } = ctx;

	return (
		<CardBase
			title={"Update Profile"}
			content={<UpdateUserForm user={user} />}
		/>
	);
};

export default Page;
