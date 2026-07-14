type IArticleJsonLdInput = {
	siteUrl: string;
	slug: string;
	title: string;
	description: string;
	imageUrl: string | null;
	authorName: string;
	createdAt: Date;
	updatedAt: Date;
};

const buildArticleJsonLd = (input: IArticleJsonLdInput): string => {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: input.title,
		description: input.description,
		image: input.imageUrl ? [input.imageUrl] : undefined,
		datePublished: input.createdAt.toISOString(),
		dateModified: input.updatedAt.toISOString(),
		author: {
			"@type": "Person",
			name: input.authorName,
		},
		mainEntityOfPage: `${input.siteUrl}/post/${input.slug}`,
	};

	return JSON.stringify(jsonLd).replace(/</g, "\\u003c");
};

export type { IArticleJsonLdInput };
export { buildArticleJsonLd };
