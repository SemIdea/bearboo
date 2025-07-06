import { LoginForm } from "./page.client";

const Page = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <h1>Login</h1>

      <LoginForm />
    </div>
  );
};

export default Page;
