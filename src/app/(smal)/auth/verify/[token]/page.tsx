import { CardBase } from "@/components/cardBase";
import { createCaller } from "@/server/caller";
import { getErrorMessage } from "@/lib/error";
import { ErrorMessage } from "@/components/ui/errorMessage";

type Params = {
  params: Promise<{
    token: string;
  }>;
};

const Page = async ({ params }: Params) => {
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
