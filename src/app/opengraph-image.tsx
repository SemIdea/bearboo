import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

const size = { width: 1200, height: 630 };
const alt = `${siteConfig.name} - ${siteConfig.description}`;
const contentType = "image/png";

const Image = () =>
	new ImageResponse(
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				width: "100%",
				height: "100%",
				padding: 80,
				backgroundColor: "#0a0a0a",
				color: "#fafafa",
				fontFamily: "sans-serif",
			}}
		>
			<div style={{ fontSize: 72, fontWeight: 700 }}>{siteConfig.name}</div>
			<div style={{ fontSize: 32, marginTop: 24, color: "#a1a1aa" }}>
				{siteConfig.description}
			</div>
		</div>,
		size,
	);

export { alt, contentType, Image as default, size };
