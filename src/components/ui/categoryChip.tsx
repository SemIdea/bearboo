import { cn } from "@/lib/utils";

const CategoryChip = ({
	name,
	className,
}: {
	name: string;
	className?: string;
}) => {
	return (
		<span
			className={cn(
				"inline-flex h-[22px] items-center self-start rounded-full bg-primary/10 px-2.5 text-xs font-semibold text-brand dark:bg-primary/15",
				className,
			)}
		>
			{name}
		</span>
	);
};

export { CategoryChip };
