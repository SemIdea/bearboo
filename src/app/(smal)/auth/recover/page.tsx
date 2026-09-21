import { Suspense } from "react";
import { CardBase } from "@/components/cardBase";
import { FormSkeleton } from "@/components/skeletons";
import { SendResetPasswordEmailForm } from "./page.client";

const Page = () => {
	return (
		<CardBase
			title="Recover Password"
			description="Enter your email below to recover your password."
			content={
				<Suspense fallback={<FormSkeleton fields={1} />}>
					<SendResetPasswordEmailForm />
				</Suspense>
			}
		/>
	);
};

export default Page;
