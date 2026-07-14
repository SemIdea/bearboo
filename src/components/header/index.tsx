import Link from "next/link";
import { CardBase } from "../cardBase";
import { SearchBox } from "../searchBox";
import { AuthSection } from "./index.client";

const Header = () => {
	return (
		<CardBase
			title={
				<div className="flex items-center justify-between">
					<Link href="/">
						<h2 className="text-2xl font-bold hover:underline">BearBoo</h2>
					</Link>
					<div className="flex items-center gap-4">
						<SearchBox />
						<AuthSection />
					</div>
				</div>
			}
		/>
	);
};

export { Header };
