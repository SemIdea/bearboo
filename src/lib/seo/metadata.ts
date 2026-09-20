import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

const OG_LOCALE = "en_US";

const OG_IMAGE = {
	url: "/opengraph-image",
	width: 1200,
	height: 630,
	alt: `${siteConfig.name} - ${siteConfig.description}`,
} as const;

const buildOpenGraph = (url: string): NonNullable<Metadata["openGraph"]> => ({
	type: "website",
	locale: OG_LOCALE,
	siteName: siteConfig.name,
	url,
	title: siteConfig.name,
	description: siteConfig.description,
});

const buildArticleOpenGraph = (input: {
	title: string;
	description: string;
	url: string;
	images?: string[];
}): NonNullable<Metadata["openGraph"]> => ({
	...buildOpenGraph(input.url),
	type: "article",
	title: input.title,
	description: input.description,
	images: input.images ?? [OG_IMAGE],
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

export {
	buildArticleOpenGraph,
	buildHomeMetadata,
	buildOpenGraph,
	buildRootMetadata,
	OG_IMAGE,
	OG_LOCALE,
};
