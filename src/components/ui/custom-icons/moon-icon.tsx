import { cn } from "@/lib/utils";

export const MoonIconCustom = ({
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
      <title>Dark mode</title>
      <path d="M21.528 20c-6.084 0-11.015-4.925-11.015-11 0-3.658 1.796-6.89 4.547-8.89A12.09 12.09 0 0013.517 0C6.88 0 1.5 5.373 1.5 12s5.38 12 12.017 12c3.578 0 6.782-1.571 8.983-4.049-.321.028-.644.049-.972.049z" />
    </svg>
  );
};
