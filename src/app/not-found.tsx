import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
	return (
		<div className="mx-auto flex min-h-[60vh] max-w-[440px] flex-col items-center justify-center gap-6 px-4 py-24 text-center">
			<div className="flex flex-col gap-2.5">
				<span className="text-[15px] font-semibold tracking-wide text-brand">
					404
				</span>
				<h1 className="text-3xl font-bold tracking-tight">
					This post wandered off
				</h1>
				<p className="text-base leading-relaxed text-muted-foreground">
					The page you&apos;re looking for doesn&apos;t exist, moved, or the
					bear buried it somewhere. Let&apos;s get you back on the trail.
				</p>
			</div>
			<Button asChild size="lg">
				<Link href="/">Back to the blog</Link>
			</Button>
		</div>
	);
}
