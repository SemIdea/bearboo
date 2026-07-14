import { MetadataRoute } from "next";
import { env } from "@/lib/env";

const robots = (): MetadataRoute.Robots => ({
	rules: {
		userAgent: "*",
		allow: "/",
		disallow: [
			"/post/create",
			"/post/edit/",
			"/post/mine",
			"/user/profile",
			"/auth/",
			"/api/",
		],
	},
	sitemap: `${env.siteUrl}/sitemap.xml`,
});

export default robots;
