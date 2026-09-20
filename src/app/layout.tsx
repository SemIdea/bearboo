import "@/styles/globals.css";
import clsx from "clsx";
import { Metadata, Viewport } from "next";
import { Header } from "@/components/header";
import { fontSans } from "@/config/fonts";
import { env } from "@/lib/env";
import { buildRootMetadata } from "@/lib/seo/metadata";
import { Providers } from "./providers";

export const metadata: Metadata = buildRootMetadata({
	siteUrl: env.siteUrl,
	googleVerification: env.googleSiteVerification,
});

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "white" },
		{ media: "(prefers-color-scheme: dark)", color: "black" },
	],
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<html suppressHydrationWarning lang="en">
			<head />
			<body
				className={clsx(
					"min-h-screen bg-background font-sans antialiased",
					fontSans.variable,
				)}
			>
				<Providers>
					<Header />
					<div className="relative flex flex-col">
						<div className="flex justify-center w-full">{children}</div>
					</div>
				</Providers>
			</body>
		</html>
	);
};

export default RootLayout;
