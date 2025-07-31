import { CardBase } from "../cardBase";
import { AuthSection } from "./index.client";
import Link from "next/link";

const Header = () => {
  return (
    <CardBase
      title={
        <div className="flex items-center justify-between">
          <Link href="/">
            <h2 className="text-2xl font-bold hover:underline">BearBoo</h2>
          </Link>
          <div className="flex items-center gap-4">
            <AuthSection />
          </div>
        </div>
      }
    />
  );
};

export { Header };
