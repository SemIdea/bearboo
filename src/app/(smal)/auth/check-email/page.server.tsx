import { headers as nextHeaders } from "next/headers";

const EmailParam = async () => {
  const headers = await nextHeaders();
  const url = new URL(headers.get("x-url")!);
  const searchParams = url.searchParams;
  const email = searchParams.get("email");

  return email ?? null;
};

export { EmailParam };
