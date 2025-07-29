import { cn } from "@/lib/utils";

function ErrorMessage({
  className,
  error,
  ...props
}: {
  className?: string;
  error: string | null;
} & React.ComponentProps<"p">) {
  const body = error;

  if (!body) {
    return null;
  }

  return (
    <p
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {body}
    </p>
  );
}

export { ErrorMessage };