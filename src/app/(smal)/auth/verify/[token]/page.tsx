import { Suspense } from "react";
import { CardBase } from "@/components/cardBase";
import { ErrorMessage } from "@/components/ui/errorMessage";
import { getErrorMessage } from "@/lib/error";
import { createCaller } from "@/server/caller";

type Params = {
	params: Promise<{
		token: string;
	}>;
};

const Page = (props: Params) => {
	return (
		<Suspense fallback={<p>Verifying your email...</p>}>
			<VerifyContent params={props.params} />
		</Suspense>
	);
};

const VerifyContent = async ({ params }: Params) => {
	const { token } = await params;
	const caller = await createCaller();

	let errorMessage: string | undefined;
	let success = false;

	try {
		await caller.auth.verify({ token });
		success = true;
	} catch (error) {
		if (error instanceof Error) {
			errorMessage = getErrorMessage(error.message);
		}
	}

	return (
		<CardBase
			title="Verifying your email"
			description="Please wait while we verify your email."
			content={
				<>
					{errorMessage && <ErrorMessage error={errorMessage} />}
					{success && (
						<p className="mt-4 text-green-600">
							Verification successful! You can now log in.
						</p>
					)}
				</>
			}
		/>
	);
};

export default Page;
