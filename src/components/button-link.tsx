import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: React.ComponentProps<typeof Link> & Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link {...props} />
    </Button>
  );
}
