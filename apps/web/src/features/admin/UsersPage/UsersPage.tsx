import { ShieldBan, ShieldCheck, Trash2 } from "lucide-react";
import type { UserDto } from "@eventsphere/shared";
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  Input,
  PageHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type Column,
} from "@eventsphere/ui";
import { QueryError } from "@/components";
import { formatDate } from "@/lib/format";
import { ALL_FILTER } from "./const";
import { useUsersPage } from "./useUsersPage";

export function UsersPage() {
  const {
    users,
    meta,
    isLoading,
    isError,
    error,
    refetch,
    search,
    role,
    status,
    deleting,
    setDeleting,
    setPage,
    isDeleting,
    handleSearchChange,
    handleRoleChange,
    handleStatusChange,
    handleSetStatus,
    handleDelete,
  } = useUsersPage();

  const columns: Column<UserDto>[] = [
    {
      key: "user",
      header: "User",
      render: (u) => (
        <div>
          <p className="font-medium">{u.name}</p>
          <p className="text-xs text-muted-foreground">{u.email}</p>
        </div>
      ),
    },
    { key: "role", header: "Role", render: (u) => <span className="capitalize">{u.role.replace("_", " ")}</span> },
    {
      key: "verified",
      header: "Verified",
      className: "hidden md:table-cell",
      render: (u) => (u.isEmailVerified ? <Badge variant="success">Yes</Badge> : <Badge variant="secondary">No</Badge>),
    },
    {
      key: "status",
      header: "Status",
      render: (u) =>
        u.status === "active" ? <Badge variant="success">Active</Badge> : <Badge variant="destructive">Suspended</Badge>,
    },
    {
      key: "joined",
      header: "Joined",
      className: "hidden lg:table-cell",
      render: (u) => <span className="text-muted-foreground">{formatDate(u.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "w-28 text-right",
      render: (u) =>
        u.role === "super_admin" ? null : (
          <div className="flex justify-end gap-1">
            {u.status === "active" ? (
              <Button variant="ghost" size="icon" title="Suspend" onClick={() => handleSetStatus(u.id, "suspended")}>
                <ShieldBan className="size-4 text-yellow-500" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" title="Activate" onClick={() => handleSetStatus(u.id, "active")}>
                <ShieldCheck className="size-4 text-success" />
              </Button>
            )}
            <Button variant="ghost" size="icon" title="Delete" onClick={() => setDeleting(u)}>
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ),
    },
  ];

  if (isError) {
    return (
      <div>
        <PageHeader title="Users" description="All accounts across roles" />
        <QueryError error={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Users" description="All accounts across roles" />

      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          placeholder="Search name or email…"
          className="max-w-xs"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        <Select value={role} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER}>All roles</SelectItem>
            <SelectItem value="attendee">Attendee</SelectItem>
            <SelectItem value="organizer">Organizer</SelectItem>
            <SelectItem value="super_admin">Super admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER}>All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={users}
        rowKey={(u) => u.id}
        isLoading={isLoading}
        emptyMessage="No users match these filters"
        meta={meta}
        onPageChange={setPage}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${deleting?.name}?`}
        description="The account is soft-deleted: booking history is preserved, but the user can no longer log in."
        confirmLabel="Delete user"
        destructive
        pending={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
