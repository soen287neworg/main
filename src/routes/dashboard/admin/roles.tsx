import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  findAllRoles,
  createRole,
  updateRole,
  deleteRole,
  getSystemPermission,
  setSystemPermission,
  findRoleByIdService,
} from "@/lib/services/RoleService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useMemo, useState, Suspense, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Role } from "@/generated/prisma/client";
import { createServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  CreateRoleModal,
  EditRoleModal,
  DeleteRoleModal,
  PermissionManagerModal,
} from "@/components/dashboard/role-management-modals";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BitfieldSystemDefinitions } from "@/lib/types/roles";
import { Shield, Users, Settings, Plus } from "lucide-react";

type RoleWithDetails = Role & {
  users: any[];
  systemPermissions: any[];
};

// Server Functions
export const getRoles = createServerFn({ method: "GET" }).handler(async () => {
  return (await findAllRoles()) as RoleWithDetails[];
});

export const getRoleDetails = createServerFn({
  method: "POST",
})
  .inputValidator((data: { roleId: string }) => data)
  .handler(async ({ data }) => {
    return await findRoleByIdService(data.roleId);
  });

export const createRoleFn = createServerFn({
  method: "POST",
})
  .inputValidator((data: { name: string }) => data)
  .handler(async ({ data }) => {
    return await createRole(data.name);
  });

export const updateRoleFn = createServerFn({
  method: "POST",
})
  .inputValidator((data: { roleId: string; name: string }) => data)
  .handler(async ({ data }) => {
    return await updateRole(data.roleId, data.name);
  });

export const deleteRoleFn = createServerFn({
  method: "POST",
})
  .inputValidator((data: { roleId: string }) => data)
  .handler(async ({ data }) => {
    return await deleteRole(data.roleId);
  });

export const setPermissionFn = createServerFn({
  method: "POST",
})
  .inputValidator((data: { roleId: string; permission: number }) => data)
  .handler(async ({ data }) => {
    return await setSystemPermission(data.roleId, data.permission);
  });

export const Route = createFileRoute("/dashboard/admin/roles")({
  component: RouteComponent,
  loader: async () => {
    const roles = await getRoles();
    return { roles };
  },
});

function RoleListSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-4">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2 mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

function RoleDetailsSkeleton() {
  return (
    <div className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-32 w-full" />
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
            <RoleListSkeleton />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel>
            <RoleDetailsSkeleton />
          </ResizablePanel>
        </ResizablePanelGroup>
      }
    >
      <RolesPage />
    </Suspense>
  );
}

function RolesPage() {
  const { roles } = Route.useLoaderData();
  const [selectedRole, setSelectedRole] = useState<RoleWithDetails | null>(
    roles?.[0] ?? null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

  const filteredRoles = useMemo(() => {
    if (!roles) return [];
    return roles.filter((role: RoleWithDetails) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [roles, searchTerm]);

  useEffect(() => {
    if (selectedRole) {
      const updatedRole = roles.find(
        (r: RoleWithDetails) => r.id === selectedRole.id
      );
      if (updatedRole) {
        setSelectedRole(updatedRole);
      }
    }
  }, [roles, selectedRole]);

  const loadRoleDetails = async (role: RoleWithDetails) => {
    try {
      const roleDetails = await getRoleDetails({ data: { roleId: role.id } });
      setSelectedRole(roleDetails);
    } catch (error) {
      console.error("Failed to load role details:", error);
    }
  };

  const handleCreateRole = async (name: string) => {
    try {
      await createRoleFn({ data: { name } });
      toast.success("Role created successfully");
      router.invalidate();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Failed to create role:", error);
      toast.error("Failed to create role");
    }
  };

  const handleUpdateRole = async (name: string) => {
    if (!selectedRole) return;
    try {
      await updateRoleFn({ data: { roleId: selectedRole.id, name } });
      toast.success("Role updated successfully");
      router.invalidate();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Failed to update role:", error);
      toast.error("Failed to update role");
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    try {
      await deleteRoleFn({ data: { roleId: selectedRole.id } });
      toast.success("Role deleted successfully");
      setSelectedRole(null);
      router.invalidate();
    } catch (error) {
      console.error("Failed to delete role:", error);
      toast.error("Failed to delete role");
    }
  };

  const handleUpdatePermissions = async (permission: number) => {
    if (!selectedRole) return;
    try {
      await setPermissionFn({
        data: { roleId: selectedRole.id, permission },
      });
      toast.success("Permissions updated successfully");
      router.invalidate();
      setIsPermissionModalOpen(false);
    } catch (error) {
      console.error("Failed to update permissions:", error);
      toast.error("Failed to update permissions");
    }
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={30}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Input
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button onClick={() => setIsCreateModalOpen(true)} className="ml-2">
              <Plus className="mr-2 h-4 w-4" />
              Create Role
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2 p-4">
          {filteredRoles.map((role: RoleWithDetails) => (
            <Card
              key={role.id}
              className={`cursor-pointer ${
                selectedRole?.id === role.id ? "bg-muted" : ""
              }`}
              onClick={() => loadRoleDetails(role)}
            >
              <CardHeader className="p-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    {role.name}
                  </CardTitle>
                  <Badge variant="outline">
                    {role.users?.length || 0} users
                  </Badge>
                </div>
                {role.systemPermissions?.[0]?.permission && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Settings className="h-3 w-3" />
                    <span>
                      {getPermissionCount(role.systemPermissions[0].permission)}{" "}
                      permissions
                    </span>
                  </div>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={70}>
        {selectedRole ? (
          <div className="p-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Shield className="h-6 w-6" />
                    {selectedRole.name}
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="outline">
                      <Users className="mr-1 h-3 w-3" />
                      {selectedRole.users?.length || 0} Users
                    </Badge>
                    <Badge variant="outline">
                      <Settings className="mr-1 h-3 w-3" />
                      {getPermissionCount(
                        selectedRole.systemPermissions?.[0]?.permission || 0
                      )}{" "}
                      Permissions
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsPermissionModalOpen(true)}
                  >
                    Permissions
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <RoleDetails role={selectedRole} />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p>Select a role to see details</p>
          </div>
        )}
      </ResizablePanel>

      <CreateRoleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateRole}
      />

      {selectedRole && (
        <>
          <EditRoleModal
            role={selectedRole}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onUpdate={handleUpdateRole}
          />
          <DeleteRoleModal
            role={selectedRole}
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onDelete={handleDeleteRole}
          />
          <PermissionManagerModal
            role={selectedRole}
            isOpen={isPermissionModalOpen}
            onClose={() => setIsPermissionModalOpen(false)}
            onUpdate={handleUpdatePermissions}
          />
        </>
      )}
    </ResizablePanelGroup>
  );
}

function RoleDetails({ role }: { role: RoleWithDetails }) {
  const systemPermissions = [
    {
      value: BitfieldSystemDefinitions.BOOK_RESOURCES,
      label: "Book Resources",
    },
    {
      value: BitfieldSystemDefinitions.MANAGE_RESOURCES,
      label: "Manage Resources",
    },
    {
      value: BitfieldSystemDefinitions.MANAGE_USERS,
      label: "Manage Users",
    },
    {
      value: BitfieldSystemDefinitions.MANAGE_ROLES,
      label: "Manage Roles",
    },
    {
      value: BitfieldSystemDefinitions.MANAGE_ANALYTICS,
      label: "View Analytics",
    },
    {
      value: BitfieldSystemDefinitions.MANAGE_ALERTS,
      label: "Manage Alerts",
    },
  ];

  const currentPermission = role.systemPermissions?.[0]?.permission || 0;
  const activePermissions = systemPermissions.filter(
    (perm) => (currentPermission & perm.value) === perm.value
  );

  return (
    <div className="space-y-6">
      {/* Users List */}
      <div>
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Users className="h-4 w-4" />
          Users with this Role
        </h3>
        {role.users && role.users.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {role.users.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">
            No users assigned to this role
          </p>
        )}
      </div>

      {/* Permissions List */}
      <div>
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Role Permissions
        </h3>
        {activePermissions.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {activePermissions.map((permission) => (
              <div
                key={permission.value}
                className="flex items-center gap-2 p-2 border rounded"
              >
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm">{permission.label}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No permissions assigned to this role
          </p>
        )}
      </div>
    </div>
  );
}

function getPermissionCount(permissionValue: number): number {
  if (permissionValue === 0) return 0;

  const permissions = [
    BitfieldSystemDefinitions.BOOK_RESOURCES,
    BitfieldSystemDefinitions.MANAGE_RESOURCES,
    BitfieldSystemDefinitions.MANAGE_USERS,
    BitfieldSystemDefinitions.MANAGE_ROLES,
    BitfieldSystemDefinitions.MANAGE_ANALYTICS,
    BitfieldSystemDefinitions.MANAGE_ALERTS,
  ];

  return permissions.filter((perm) => (permissionValue & perm) === perm).length;
}
