import { Skeleton } from "@/components/ui/skeleton";

export function PaginationSkeleton() {
  return (
    <div className="flex justify-center items-center h-10 gap-1 max-sm:gap-0">
      <Skeleton key={"prev"} className="w-20 h-10" />
      <Skeleton key="page-1" className="w-10 h-10" />
      <Skeleton key="page-2" className="w-10 h-10" />
      <Skeleton key="page-3" className="w-10 h-10" />
      <Skeleton key={"next"} className="w-20 h-10" />
    </div>
  );
}
