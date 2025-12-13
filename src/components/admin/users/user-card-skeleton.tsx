import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function UserCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Avatar skeleton */}
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1 min-w-0">
              {/* Name skeleton */}
              <Skeleton className="h-5 w-3/4" />
              {/* Email skeleton */}
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
          {/* Badge skeleton */}
          <Skeleton className="h-5 w-16" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export function UsersGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons are static
        <UserCardSkeleton key={i} />
      ))}
    </div>
  );
}
