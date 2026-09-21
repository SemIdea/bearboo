import { FaSpinner } from "react-icons/fa";
import { cn } from "@/lib/utils";

const Spinner = ({ className }: { className?: string }) => {
	return (
		<FaSpinner
			className={cn("size-4 shrink-0 animate-spin", className)}
			aria-hidden
		/>
	);
};

export { Spinner };
