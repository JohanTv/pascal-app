import { Suspense } from "react";
import { CreateUserDialog } from "@/components/admin/users/create-user-dialog";
import { UsersGridSkeleton } from "@/components/admin/users/user-card-skeleton";
import { UsersContent } from "@/components/admin/users/users-content";
import { UsersPageFilters } from "@/components/admin/users/users-page-filters";
import { Skeleton } from "@/components/ui/skeleton";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    q?: string;
  }>;
}

export default async function UsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 3; // Fixed per specs
  const status = (params.status as "active" | "banned") || "active";
  const search = params.q || "";

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Usuarios</h2>
            <p className="text-muted-foreground">
              Gestiona los usuarios del sistema
            </p>
          </div>
          <CreateUserDialog />
        </div>

        {/* Filters */}
        <Suspense fallback={<Skeleton className="h-10 w-full" />}>
          <UsersPageFilters />
        </Suspense>

        {/* Users Content - This will suspend while loading */}
        <Suspense
          key={`${page}-${status}-${search}`}
          fallback={
            <>
              <Skeleton className="h-5 w-40" />
              <UsersGridSkeleton count={pageSize} />
              <div className="flex justify-center items-center h-10 gap-1">
                <Skeleton className="w-20 h-10" />
                <Skeleton className="w-10 h-10" />
                <Skeleton className="w-10 h-10" />
                <Skeleton className="w-10 h-10" />
                <Skeleton className="w-20 h-10" />
              </div>
            </>
          }
        >
          <UsersContent
            page={page}
            pageSize={pageSize}
            status={status}
            search={search}
          />
        </Suspense>
      </div>
    </div>
  );
}
