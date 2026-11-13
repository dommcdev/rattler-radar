import Image from "next/image";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface EventFlyerProps {
  src: string;
  /** Tells the browser how wide the flyer renders, so it can pick a size. */
  sizes: string;
  loading?: ComponentProps<typeof Image>["loading"];
  /** Size and shape of the frame, e.g. an aspect ratio. */
  className?: string;
}

/**
 * An event flyer, shown whole (never cropped) inside a fixed frame. Flyers
 * come in every shape, so the empty space is filled with a blurred, dimmed
 * copy of the same image. Both layers use the same `sizes`, so the browser
 * downloads the image once.
 */
export function EventFlyer({
  src,
  sizes,
  loading,
  className,
}: EventFlyerProps) {
  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      <Image
        src={src}
        alt=""
        aria-hidden
        fill
        sizes={sizes}
        loading={loading}
        className="scale-125 object-cover opacity-40 blur-2xl"
      />
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        loading={loading}
        className="object-contain"
      />
    </div>
  );
}

/** Stands in for a flyer when an event doesn't have one. */
export function FlyerPlaceholder({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end bg-muted p-4", className)}>
      <span className="text-lg leading-tight font-semibold tracking-tight text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
