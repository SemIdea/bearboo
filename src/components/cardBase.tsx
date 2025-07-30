import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "./ui/card";

const CardBase = ({
  title,
  titleBold = true,
  description,
  content,
  border = false,
  className,
  ...props
}: {
  title?: React.ReactNode;
  titleBold?: boolean;
  description?: React.ReactNode;
  content?: React.ReactNode;
  border?: boolean;
  className?: string;
  props?: React.ComponentProps<"div">;
}) => {
  return (
    <Card
      className={cn(border ? "" : "border-0 shadow-none", className)}
      {...props}
    >
      {(title || description) && (
        <CardHeader>
          {title && (
            <CardTitle className={titleBold ? undefined : "font-normal"}>
              {title}
            </CardTitle>
          )}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}

      {content && <CardContent>{content}</CardContent>}
    </Card>
  );
};

export { CardBase };
