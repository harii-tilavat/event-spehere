import { useState } from "react";
import { toast } from "sonner";
import type { UserDto, UserStatus } from "@eventsphere/shared";
import { useDeleteUser, useGetUsers, useSetUserStatus } from "@/api";
import { useDebounce } from "@/hooks/useDebounce";
import { ALL_FILTER } from "./const";

export function useUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState(ALL_FILTER);
  const [status, setStatus] = useState(ALL_FILTER);
  const debouncedSearch = useDebounce(search);
  const [deleting, setDeleting] = useState<UserDto | null>(null);

  const usersQuery = useGetUsers({
    page,
    search: debouncedSearch || undefined,
    role: role === ALL_FILTER ? undefined : role,
    status: status === ALL_FILTER ? undefined : status,
  });

  const setUserStatus = useSetUserStatus({
    onSuccess: (user) => toast.success(`${user.name} is now ${user.status}`),
  });
  const deleteUser = useDeleteUser({
    onSuccess: () => {
      toast.success("User deleted");
      setDeleting(null);
    },
  });

  const resetToFirstPage = () => setPage(1);

  return {
    users: usersQuery.data?.rows ?? [],
    meta: usersQuery.data?.meta,
    isLoading: usersQuery.isPending,
    isError: usersQuery.isError,
    error: usersQuery.error,
    refetch: usersQuery.refetch,
    search,
    role,
    status,
    deleting,
    setDeleting,
    setPage,
    isDeleting: deleteUser.isPending,
    handleSearchChange: (value: string) => {
      setSearch(value);
      resetToFirstPage();
    },
    handleRoleChange: (value: string) => {
      setRole(value);
      resetToFirstPage();
    },
    handleStatusChange: (value: string) => {
      setStatus(value);
      resetToFirstPage();
    },
    handleSetStatus: (id: number, nextStatus: UserStatus) => setUserStatus.mutate({ id, status: nextStatus }),
    handleDelete: () => deleting && deleteUser.mutate(deleting.id),
  };
}
