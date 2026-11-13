import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/** The user's Google profile photo, or their initials if there isn't one. */
export function UserAvatar({
  name,
  image,
  className,
}: {
  name: string;
  image: string | null | undefined;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <Avatar className={cn("size-7", className)}>
      {image ? (
        <AvatarImage src={image} alt="" referrerPolicy="no-referrer" />
      ) : null}
      <AvatarFallback className="text-xs font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
