import Link from "next/link";
import { SearchBox } from "../searchBox";
import { ThemeSwitch } from "../theme-switch";
import { AuthSection } from "./index.client";

const Header = () => {
	return (
		<header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-18">
				<Link href="/" className="shrink-0">
					<span className="text-lg font-bold tracking-tight">BearBoo</span>
				</Link>
				<div className="flex items-center gap-2 sm:gap-3">
					<div className="hidden sm:block">
						<SearchBox />
					</div>
					<AuthSection />
					<ThemeSwitch />
				</div>
			</div>
		</header>
	);
};

export { Header };
