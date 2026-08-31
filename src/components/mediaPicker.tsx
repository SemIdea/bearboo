"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { trpc } from "@/app/_trpc/client";
import { Button } from "@/components/ui/button";

const CoverImageMediaPicker = () => {
	const { setValue } = useFormContext();
	const [isOpen, setIsOpen] = useState(false);
	const { data: media, isLoading } = trpc.media.readOwn.useQuery(undefined, {
		enabled: isOpen,
	});

	return (
		<div className="space-y-2">
			<Button
				type="button"
				variant="outline"
				size="sm"
				onClick={() => setIsOpen((open) => !open)}
			>
				{isOpen ? "Hide uploaded media" : "Use uploaded media"}
			</Button>
			{isOpen && (
				<div className="flex flex-wrap gap-2 rounded-md border border-input p-2">
					{isLoading && (
						<p className="text-muted-foreground text-sm">Loading media...</p>
					)}
					{!isLoading && media?.length === 0 && (
						<p className="text-muted-foreground text-sm">
							No media uploaded yet.{" "}
							<a href="/media" className="underline">
								Upload one
							</a>
							.
						</p>
					)}
					{media?.map((item) => (
						<button
							key={item.id}
							type="button"
							className="h-16 w-16 overflow-hidden rounded-md border border-input"
							onClick={() => {
								setValue("coverImageUrl", item.url, { shouldValidate: true });
								setIsOpen(false);
							}}
							title={item.altText ?? item.filename}
						>
							<img
								src={item.url}
								alt={item.altText ?? item.filename}
								className="h-full w-full object-cover"
							/>
						</button>
					))}
				</div>
			)}
		</div>
	);
};

export { CoverImageMediaPicker };
