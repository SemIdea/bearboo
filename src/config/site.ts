export type SiteConfig = typeof siteConfig;

const siteConfig = {
  // Basic SEO
  title: {
    default: "Bearboo",
    template: "%s | Bearboo" // This allows child pages to have "Post Title | Bearboo"
  },
  description:
    "Bearboo is the portfolio and creative playground of Bruno, featuring thoughts on software development, technology, and design.",
  // Technical details
  metadataBase: new URL("https://bearboo-eight.vercel.app/"), // Replace with your actual domain
  alternates: {
    canonical: "/"
  },

  // Open Graph (Facebook, LinkedIn, Discord, etc.)
  openGraph: {
    title: "Bearboo | Creative Developer Portfolio",
    description:
      "Exploring ideas in tech and design. View my latest projects and articles.",
    url: "https://bearboo-eight.vercel.app/",
    siteName: "Bearboo",
    // images: [
    //   {
    //     url: "/images/og-image-main.png", // Must be an absolute URL or use metadataBase
    //     width: 1200,
    //     height: 630,
    //     alt: "Bearboo Portfolio Homepage"
    //   }
    // ],
    locale: "en_US",
    type: "website"
  },

  // Twitter Card (X)
  twitter: {
    card: "summary_large_image",
    title: "Bearboo | Creative Developer Portfolio",
    description:
      "Exploring ideas in tech and design. View my latest projects and articles.",
    creator: "@yourtwitterhandle", // Optional
    // images: ["/images/og-image-main.png"] // Re-use the OG image usually
  },

  // Icons/Favicons
  // icons: {
  //   icon: "/favicon.ico",
  //   shortcut: "/favicon-16x16.png",
  //   apple: "/apple-touch-icon.png"
  // }
};

export { siteConfig };
