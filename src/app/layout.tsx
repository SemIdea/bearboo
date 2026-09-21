import "@/styles/globals.css";
import clsx from "clsx";
import { Metadata, Viewport } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { fontMono, fontSans } from "@/config/fonts";
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
					"flex min-h-screen flex-col bg-background font-sans antialiased",
					fontSans.variable,
					fontMono.variable,
				)}
			>
				<Providers>
					<Header />
					<main className="flex-1">{children}</main>
					<Footer />
				</Providers>
			</body>
		</html>
	);
};

export default RootLayout;
