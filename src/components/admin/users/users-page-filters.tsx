"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function UsersPageFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentStatus = searchParams?.get("status") || "active";
  const currentSearch = searchParams?.get("q") || "";

  const [searchValue, setSearchValue] = useState(currentSearch);

  const updateURL = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams?.toString() || "");

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      // Reset to page 1 when filters change
      if (key !== "page") {
        params.delete("page");
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router],
  );

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== currentSearch) {
        updateURL("q", searchValue);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue, currentSearch, updateURL]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleStatusChange = (status: string) => {
    updateURL("status", status);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      {/* Search Input */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por nombre o email..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Status Tabs */}
      <Tabs value={currentStatus} onValueChange={handleStatusChange}>
        <TabsList>
          <TabsTrigger value="active">Activos</TabsTrigger>
          <TabsTrigger value="banned">Baneados</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
