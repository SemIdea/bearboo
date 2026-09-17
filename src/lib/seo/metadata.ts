import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

const OG_LOCALE = "en_US";

const buildOpenGraph = (url: string): NonNullable<Metadata["openGraph"]> => ({
	type: "website",
	locale: OG_LOCALE,
	siteName: siteConfig.name,
	url,
	title: siteConfig.name,
	description: siteConfig.description,
});

const buildRootMetadata = (input: {
	siteUrl: string;
	googleVerification?: string;
}): Metadata => ({
	metadataBase: new URL(input.siteUrl),
	title: {
		default: siteConfig.name,
		template: `%s - ${siteConfig.name}`,
	},
	description: siteConfig.description,
	icons: {
		icon: "/favicon.ico",
	},
	openGraph: buildOpenGraph(input.siteUrl),
	verification: input.googleVerification
		? { google: input.googleVerification }
		: undefined,
});

const buildHomeMetadata = (): Metadata => ({
	alternates: { canonical: "/" },
});

export { buildHomeMetadata, buildOpenGraph, buildRootMetadata, OG_LOCALE };
