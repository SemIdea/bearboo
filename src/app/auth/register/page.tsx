import { RegisterForm } from "./page.client";

const Page = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <h1>Create Account</h1>

      <RegisterForm />
    </div>
  );
};

export default Page;
