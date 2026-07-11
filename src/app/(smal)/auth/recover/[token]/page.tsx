import { Suspense } from "react";
import { CardBase } from "@/components/cardBase";
import { ResetPasswordForm } from "./page.client";

type Params = {
	params: Promise<{
		token: string;
	}>;
};

const Page = (props: Params) => {
	return (
		<Suspense fallback={<p>Loading...</p>}>
			<RecoverContent params={props.params} />
		</Suspense>
	);
};

const RecoverContent = async ({ params }: Params) => {
	const { token } = await params;

	return (
		<CardBase
			title="Reset Password"
			description="Please enter your new password below."
			content={<ResetPasswordForm token={token} />}
		/>
	);
};

export default Page;
