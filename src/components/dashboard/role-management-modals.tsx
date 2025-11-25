import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Role } from "@/generated/prisma/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { BitfieldSystemDefinitions } from "@/lib/types/roles";

type RoleWithDetails = Role & {
  users: any[];
  systemPermissions: any[];
};

const createRoleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
});

const editRoleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
});

type CreateRoleFormValues = z.infer<typeof createRoleSchema>;
type EditRoleFormValues = z.infer<typeof editRoleSchema>;

export function CreateRoleModal({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const form = useForm<CreateRoleFormValues>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (values: CreateRoleFormValues) => {
    onCreate(values.name);
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Role</DialogTitle>
          <DialogDescription>
            Create a new role with custom permissions.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Manager" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Create Role</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function EditRoleModal({
  role,
  isOpen,
  onClose,
  onUpdate,
}: {
  role: RoleWithDetails;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (name: string) => void;
}) {
  const form = useForm<EditRoleFormValues>({
    resolver: zodResolver(editRoleSchema),
    defaultValues: {
      name: role?.name ?? "",
    },
  });

  const onSubmit = (values: EditRoleFormValues) => {
    onUpdate(values.name);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Role: {role.name}</DialogTitle>
          <DialogDescription>
            Update the role name and permissions.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Manager" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteRoleModal({
  role,
  isOpen,
  onClose,
  onDelete,
}: {
  role: RoleWithDetails;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Role: {role.name}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this role? This action cannot be
            undone and will remove the role from all users who currently have
            it.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onDelete();
              onClose();
            }}
          >
            Delete Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PermissionManagerModal({
  role,
  isOpen,
  onClose,
  onUpdate,
}: {
  role: RoleWithDetails;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (permissions: number) => void;
}) {
  const systemPermissions = [
    {
      value: BitfieldSystemDefinitions.BOOK_RESOURCES,
      label: "Book Resources",
      description: "Allow users to make bookings",
    },
    {
      value: BitfieldSystemDefinitions.MANAGE_RESOURCES,
      label: "Manage Resources",
      description: "Create, edit, and delete rooms and schedules",
    },
    {
      value: BitfieldSystemDefinitions.MANAGE_USERS,
      label: "Manage Users",
      description: "Create, edit, and delete user accounts",
    },
    {
      value: BitfieldSystemDefinitions.MANAGE_ROLES,
      label: "Manage Roles",
      description: "Create, edit, and delete roles and permissions",
    },
    {
      value: BitfieldSystemDefinitions.MANAGE_ANALYTICS,
      label: "View Analytics",
      description: "Access reports and analytics dashboard",
    },
    {
      value: BitfieldSystemDefinitions.MANAGE_ALERTS,
      label: "Manage Alerts",
      description: "Create and manage system alerts",
    },
  ];

  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  // Initialize permissions from role data
  useEffect(() => {
    const currentPermission = role.systemPermissions?.[0]?.permission || 0;
    const selected = systemPermissions
      .filter((perm) => (currentPermission & perm.value) === perm.value)
      .map((perm) => perm.value);
    setSelectedPermissions(selected);
  }, [role.systemPermissions]);

  const handlePermissionToggle = (value: number) => {
    setSelectedPermissions((prev: number[]) => {
      if (prev.includes(value)) {
        return prev.filter((p: number) => p !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const onSubmit = () => {
    const finalPermission = selectedPermissions.reduce(
      (sum: number, perm: number) => sum | perm,
      0
    );
    onUpdate(finalPermission);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Permissions for {role.name}</DialogTitle>
          <DialogDescription>
            Select which permissions this role should have.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {systemPermissions.map((permission) => (
            <div
              key={permission.value}
              className="flex items-start space-x-3 p-3 border rounded-lg"
            >
              <Checkbox
                id={`permission-${permission.value}`}
                checked={selectedPermissions.includes(permission.value)}
                onCheckedChange={() => handlePermissionToggle(permission.value)}
                className="mt-1"
              />
              <div className="flex-1">
                <label
                  htmlFor={`permission-${permission.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {permission.label}
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  {permission.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>Save Permissions</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
