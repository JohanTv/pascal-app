import { UsersPageClient } from "@/components/admin/users/users-page-client";
import { PaginationWithLinks } from "@/components/ui/pagination-with-links";
import * as UserService from "@/services/user.service";

interface UsersContentProps {
  page: number;
  pageSize: number;
  status: "active" | "banned";
  search: string;
}

export async function UsersContent({
  page,
  pageSize,
  status,
  search,
}: UsersContentProps) {
  // Fetch users - this await will suspend
  const result = await UserService.getAll({
    page,
    pageSize,
    filter: status,
    search,
  });

  // Handle error
  if (!result.success) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-destructive">
        No se pudo cargar los usuarios del sistema.
      </div>
    );
  }

  const { users, total, totalPages } = result.value;

  return (
    <>
      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {total} {total === 1 ? "usuario encontrado" : "usuarios encontrados"}
      </div>

      {/* Users Grid */}
      {users.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            No se encontraron usuarios con los filtros seleccionados
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <UsersPageClient users={users} />
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <PaginationWithLinks
          page={page}
          pageSize={pageSize}
          totalCount={total}
        />
      )}
    </>
  );
}
