import { createFileRoute } from "@tanstack/react-router";
import { findAllUsers } from "@/lib/services/UserService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useMemo, useState, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Role } from "@/generated/prisma/browser";
import { createServerFn } from "@tanstack/react-start";

type UserWithRoles = User & { roles: Role[] };

export const getUsers = createServerFn({ method: "GET" }).handler(async () => {
  return (await findAllUsers()) as UserWithRoles[];
});

export const Route = createFileRoute("/dashboard/admin/users")({
  component: RouteComponent,
  loader: () => getUsers(),
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
  const users = Route.useLoaderData();
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(
    users?.[0] ?? null
  );
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

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
          {filteredUsers.map((user) => (
            <Card
              key={user.id}
              className={`cursor-pointer ${selectedUser?.id === user.id ? "bg-muted" : ""}`}
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
                <p>
                  Roles:{" "}
                  {selectedUser.roles.map((role) => role.name).join(", ")}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button>Edit</Button>
                  <Button variant="destructive">Delete</Button>
                </div>
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
