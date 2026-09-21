import Link from "next/link";

const currentYear = new Date().getFullYear();

const Footer = () => {
	return (
		<footer className="border-t border-border">
			<div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-10 sm:flex-row sm:items-center md:px-18">
				<div className="flex items-center gap-2.5">
					<span className="text-sm font-semibold">BearBoo</span>
					<span className="text-[13px] text-muted-foreground">
						— notes on building software, slowly and on purpose.
					</span>
				</div>
				<div className="flex items-center gap-6">
					<Link
						href="/"
						className="text-sm font-medium text-muted-foreground hover:text-foreground"
					>
						Home
					</Link>
					<span className="text-[13px] text-muted-foreground">
						© {currentYear} BearBoo
					</span>
				</div>
			</div>
		</footer>
	);
};

export { Footer };
