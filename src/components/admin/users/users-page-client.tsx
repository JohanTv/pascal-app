"use client";

import { useState } from "react";
import type { User } from "@/generated/prisma/client";
import { UserCard } from "./user-card";
import { UserDetailDrawer } from "./user-detail-drawer";

interface UsersPageClientProps {
  users: User[];
}

export function UsersPageClient({ users }: UsersPageClientProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    // Wait for animation to finish before clearing user
    setTimeout(() => setSelectedUser(null), 300);
  };

  return (
    <>
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          onClick={() => handleUserClick(user)}
        />
      ))}

      <UserDetailDrawer
        user={selectedUser}
        open={drawerOpen}
        onOpenChange={handleDrawerClose}
      />
    </>
  );
}
