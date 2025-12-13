import { UsersGridSkeleton } from "@/components/admin/users/user-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-72" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>

        {/* Filters */}
        <Skeleton className="h-10 w-full" />

        {/* Results Count */}
        <Skeleton className="h-5 w-40" />

        {/* Users Grid - 3 cards as per pageSize */}
        <UsersGridSkeleton count={3} />

        {/* Pagination */}
        <div className="flex justify-center items-center h-10 gap-1">
          <Skeleton className="w-20 h-10" />
          <Skeleton className="w-10 h-10" />
          <Skeleton className="w-10 h-10" />
          <Skeleton className="w-10 h-10" />
          <Skeleton className="w-20 h-10" />
        </div>
      </div>
    </div>
  );
}
