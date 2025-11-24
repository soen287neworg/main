import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  findAllUsers,
  updateUser,
  deleteUser,
} from "@/lib/services/UserService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useMemo, useState, Suspense, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Role } from "@/generated/prisma/client";
import { createServerFn } from "@tanstack/react-start";
import {
  addRoleToUser,
  findAllRoles,
  removeRoleFromUser,
} from "@/lib/services/RoleService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  AddRoleModal,
  EditUserModal,
  DeleteUserModal,
} from "@/components/dashboard/user-management-modals";
import { UserUpdateInput } from "@/generated/prisma/models";
import { Plus } from "lucide-react";

type UserWithRoles = User & { roles: Role[] };

export const getUsers = createServerFn({ method: "GET" }).handler(async () => {
  return (await findAllUsers()) as UserWithRoles[];
});

export const getRoles = createServerFn({ method: "GET" }).handler(async () => {
  return await findAllRoles();
});

export const addUserRole = createServerFn({
  method: "POST",
})
  .inputValidator((data: { userId: string; roleId: string }) => data)
  .handler(async ({ data }) => {
    return await addRoleToUser(data.userId, data.roleId);
  });

export const updateUserFn = createServerFn({
  method: "POST",
})
  .inputValidator((data: { userId: string; userData: UserUpdateInput }) => data)
  .handler(async ({ data }) => {
    return await updateUser(data.userId, data.userData);
  });

export const deleteUserFn = createServerFn({
  method: "POST",
})
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    return await deleteUser(data.userId);
  });

export const removeUserRole = createServerFn({
  method: "POST",
})
  .inputValidator((data: { userId: string; roleId: string }) => data)
  .handler(async ({ data }) => {
    return await removeRoleFromUser(data.userId, data.roleId);
  });

export const Route = createFileRoute("/dashboard/admin/users")({
  component: RouteComponent,
  loader: async () => {
    const users = await getUsers();
    const roles = await getRoles();
    return { users, roles };
  },
});

function UserListSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-4">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2 mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

function UserDetailsSkeleton() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4 mt-2" />
        </div>
      </div>
      <div className="mt-6 space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

function RouteComponent() {
  return (
    <Suspense
      fallback={
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel>
            <UserListSkeleton />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel>
            <UserDetailsSkeleton />
          </ResizablePanel>
        </ResizablePanelGroup>
      }
    >
      <UsersPage />
    </Suspense>
  );
}

function UsersPage() {
  const { users, roles } = Route.useLoaderData();
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(
    users?.[0] ?? null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(
      (user: UserWithRoles) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  useEffect(() => {
    if (selectedUser) {
      const updatedUser = users.find(
        (u: UserWithRoles) => u.id === selectedUser.id
      );
      if (updatedUser) {
        setSelectedUser(updatedUser);
      }
    }
  }, [users, selectedUser]);

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={30}>
        <div className="p-4">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2 p-4">
          {filteredUsers.map((user: UserWithRoles) => (
            <Card
              key={user.id}
              className={`cursor-pointer ${
                selectedUser?.id === user.id ? "bg-muted" : ""
              }`}
              onClick={() => setSelectedUser(user)}
            >
              <CardHeader className="flex flex-row items-center gap-3 p-2">
                <Avatar>
                  <AvatarImage src={user.image ?? undefined} />
                  <AvatarFallback>
                    {user.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={70}>
        {selectedUser ? (
          <div className="p-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={selectedUser.image ?? undefined} />
                  <AvatarFallback className="text-4xl">
                    {selectedUser.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">
                    {selectedUser.name}
                  </CardTitle>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                </div>
              </CardHeader>
              <CardContent>
                <RoleManager
                  user={selectedUser}
                  allRoles={roles}
                  onRoleChange={() => router.invalidate()}
                  onAddRoleClick={() => setIsAddRoleModalOpen(true)}
                />
                <div className="mt-4 flex gap-2">
                  <Button onClick={() => setIsEditUserModalOpen(true)}>
                    Edit User
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteUserModalOpen(true)}
                  >
                    Delete User
                  </Button>
                </div>
                {selectedUser && (
                  <>
                    <AddRoleModal
                      user={selectedUser}
                      allRoles={roles}
                      isOpen={isAddRoleModalOpen}
                      onClose={() => setIsAddRoleModalOpen(false)}
                      onAddRoles={async (roleIds) => {
                        const promises = roleIds.map((roleId) =>
                          addUserRole({
                            data: { userId: selectedUser.id, roleId },
                          })
                        );
                        await Promise.all(promises);
                        router.invalidate();
                      }}
                    />
                    <EditUserModal
                      user={selectedUser}
                      isOpen={isEditUserModalOpen}
                      onClose={() => setIsEditUserModalOpen(false)}
                      onUpdate={async (values) => {
                        await updateUserFn({
                          data: { userId: selectedUser.id, userData: values },
                        });
                        router.invalidate();
                      }}
                    />
                    <DeleteUserModal
                      user={selectedUser}
                      isOpen={isDeleteUserModalOpen}
                      onClose={() => setIsDeleteUserModalOpen(false)}
                      onDelete={async () => {
                        await deleteUserFn({
                          data: { userId: selectedUser.id },
                        });
                        setSelectedUser(null);
                        router.invalidate();
                      }}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p>Select a user to see details</p>
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

function RoleManager({
  user,
  allRoles,
  onRoleChange,
  onAddRoleClick,
}: {
  user: UserWithRoles;
  allRoles: Role[];
  onRoleChange: () => void;
  onAddRoleClick: () => void;
}) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const userRoleIds = useMemo(
    () => new Set(user.roles.map((r) => r.id)),
    [user.roles]
  );

  const availableRoles = useMemo(
    () => allRoles.filter((r) => !userRoleIds.has(r.id)),
    [allRoles, userRoleIds]
  );

  const handleAddRole = async () => {
    if (!selectedRole) return;
    try {
      await addUserRole({ data: { userId: user.id, roleId: selectedRole } });
      toast.success("Role added successfully");
      onRoleChange();
    } catch (error) {
      toast.error("Failed to add role");
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    try {
      await removeUserRole({ data: { userId: user.id, roleId: roleId } });
      toast.success("Role removed successfully");
      onRoleChange();
    } catch (error) {
      toast.error("Failed to remove role");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Roles</h3>
        <Button size="sm" onClick={onAddRoleClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Role
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {user.roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell>{role.name}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveRole(role.id)}
                >
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
