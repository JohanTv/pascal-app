import { cn } from "@/lib/utils";

export const SunIconCustom = ({
  className,
  ...props
}: React.ComponentProps<"svg">) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      role="img"
      className={cn("fill-current transition-colors duration-300", className)}
      {...props}
    >
      <title>Light mode</title>
      <path d="M24 7.029L19 5l-2-5-5 2-5-2-2 5-5 2.029L2 12l-2 4.971L5 19l2 5 5-2 5 2 2-5 5-2.029L22 12zM12 18a6 6 0 110-12 6 6 0 010 12z" />
    </svg>
  );
};
