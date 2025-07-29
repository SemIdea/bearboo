import { formatDistance } from "date-fns";

const IsUpdatedSection = ({ updatedAt }: { updatedAt: Date }) => {
  const formattedUpdatedAt = formatDistance(new Date(updatedAt), new Date(), {
    addSuffix: true
  });

  return (
    <span className="font-normal text-muted-foreground text-sm">
      (edited {formattedUpdatedAt})
    </span>
  );
};

export { IsUpdatedSection };
