import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Role, User } from "@/generated/prisma/client";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";
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

type UserWithRoles = User & { roles: Role[] };

export function AddRoleModal({
  user,
  allRoles,
  isOpen,
  onClose,
  onAddRoles,
}: {
  user: UserWithRoles;
  allRoles: Role[];
  isOpen: boolean;
  onClose: () => void;
  onAddRoles: (roleIds: string[]) => void;
}) {
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [open, setOpen] = useState(false);

  const userRoleIds = new Set(user.roles.map((r) => r.id));
  const availableRoles = allRoles.filter((r) => !userRoleIds.has(r.id));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Roles to {user.name}</DialogTitle>
          <DialogDescription>
            Select one or more roles to add to this user.
          </DialogDescription>
        </DialogHeader>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedRoles.length > 0
                ? selectedRoles.map((role) => role.name).join(", ")
                : "Select roles..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search roles..." />
              <CommandList>
                <CommandEmpty>No roles found.</CommandEmpty>
                <CommandGroup>
                  {availableRoles.map((role) => (
                    <CommandItem
                      key={role.id}
                      value={role.name}
                      onSelect={() => {
                        setSelectedRoles((prev) =>
                          prev.some((r) => r.id === role.id)
                            ? prev.filter((r) => r.id !== role.id)
                            : [...prev, role]
                        );
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedRoles.some((r) => r.id === role.id)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {role.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onAddRoles(selectedRoles.map((r) => r.id));
              onClose();
            }}
            disabled={selectedRoles.length === 0}
          >
            Add Roles
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const editUserSchema = z.object({
  name: z.string().min(2, "Please enter a full name"),
  email: z.string().email("Enter a valid email address"),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

export function EditUserModal({
  user,
  isOpen,
  onClose,
  onUpdate,
}: {
  user: UserWithRoles;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (values: EditUserFormValues) => void;
}) {
  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: user.name ?? "",
      email: user.email ?? "",
    },
  });

  const onSubmit = (values: EditUserFormValues) => {
    onUpdate(values);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User: {user.name}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                    />
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

export function DeleteUserModal({
  user,
  isOpen,
  onClose,
  onDelete,
}: {
  user: UserWithRoles;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User: {user.name}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this user? This action cannot be
            undone.
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
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
