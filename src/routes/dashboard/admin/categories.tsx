import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Skeleton } from "@/components/ui/skeleton";
import { Room } from "@/generated/prisma/browser";
import { CategoryWithRooms } from "@/lib/services/RoomCategoryService";
import {
  createCategory,
  deleteCategoryAndRooms,
  listCategoriesWithRooms,
  updateCategory,
} from "@/lib/services/RoomCategoryService";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export const getCategories = createServerFn({ method: "GET" }).handler(
  async () => (await listCategoriesWithRooms()) as CategoryWithRooms[]
);

export const createCategoryAction = createServerFn({ method: "POST" })
  .inputValidator((data: { label: string }) => ({
    label: data.label?.trim() ?? "",
  }))
  .handler(async ({ data }) => {
    if (!data.label) {
      setResponseStatus(400);
      throw new Error("Category name is required.");
    }

    const created = await createCategory(data.label);
    if (!created) {
      setResponseStatus(500);
      throw new Error("Unable to create category.");
    }

    return created as CategoryWithRooms;
  });

export const updateCategoryAction = createServerFn({ method: "POST" })
  .inputValidator((data: { categoryId: string; label: string }) => ({
    categoryId: data.categoryId,
    label: data.label?.trim() ?? "",
  }))
  .handler(async ({ data }) => {
    if (!data.categoryId || !data.label) {
      setResponseStatus(400);
      throw new Error("Category id and name are required.");
    }

    const updated = await updateCategory(data.categoryId, data.label);
    if (!updated) {
      setResponseStatus(404);
      throw new Error("Category not found.");
    }

    return updated as CategoryWithRooms;
  });

export const deleteCategoryAction = createServerFn({ method: "POST" })
  .inputValidator((data: { categoryId: string }) => data)
  .handler(async ({ data }) => {
    if (!data.categoryId) {
      setResponseStatus(400);
      throw new Error("Category id is required.");
    }

    await deleteCategoryAndRooms(data.categoryId);

    return { id: data.categoryId };
  });

export const Route = createFileRoute("/dashboard/admin/categories")({
  component: RouteComponent,
  loader: () => getCategories(),
});

function RouteComponent() {
  return (
    <Suspense fallback={<CategoriesSkeleton />}>
      <CategoriesPage />
    </Suspense>
  );
}

function CategoriesSkeleton() {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={30}>
        <div className="p-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-16 w-full" />
          ))}
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={70}>
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-6 w-1/3" />
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

function CategoriesPage() {
  const loadedCategories = Route.useLoaderData() || [];
  const [categories, setCategories] = useState<CategoryWithRooms[]>(
    loadedCategories
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    loadedCategories?.[0]?.id ?? null
  );
  const [newName, setNewName] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editName, setEditName] = useState(
    loadedCategories?.[0]?.label ?? ""
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const selectedCategory = useMemo(
    () => categories.find((cat) => cat.id === selectedId) ?? null,
    [categories, selectedId]
  );

  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) =>
        cat.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [categories, searchTerm]);

  useEffect(() => {
    setEditName(selectedCategory?.label ?? "");
  }, [selectedCategory?.id, selectedCategory?.label]);

  const handleCreate = async () => {
    const label = newName.trim();
    if (!label) {
      toast.error("Please enter a category name.");
      return;
    }

    setIsCreating(true);
    try {
      const created = await createCategoryAction({ data: { label } });
      if (created) {
        setCategories((prev) =>
          [...prev, { ...created, rooms: created.rooms ?? [] }].sort((a, b) =>
            a.label.localeCompare(b.label)
          )
        );
        setSelectedId(created.id);
        setNewName("");
        setCreateOpen(false);
        toast.success("Category created.");
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create category right now."
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleRename = async () => {
    if (!selectedCategory) {
      return;
    }

    const label = editName.trim();
    if (!label) {
      toast.error("Category name cannot be empty.");
      return;
    }

    setIsRenaming(true);
    try {
      const updated = await updateCategoryAction({
        data: { categoryId: selectedCategory.id, label },
      });

      if (updated) {
        setCategories((prev) =>
          prev
            .map((cat) =>
              cat.id === updated.id ? { ...updated, rooms: updated.rooms } : cat
            )
            .sort((a, b) => a.label.localeCompare(b.label))
        );
        toast.success("Category renamed.");
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to rename the category."
      );
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteCategoryAction({
        data: { categoryId: selectedCategory.id },
      });

      setCategories((prev) =>
        prev.filter((cat) => cat.id !== selectedCategory.id)
      );
      const nextSelected = categories.find(
        (cat) => cat.id !== selectedCategory.id
      );
      setSelectedId(nextSelected?.id ?? null);
      setDeleteOpen(false);
      toast.success("Category and its rooms were deleted.");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete the category."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">Room categories</h1>
        <p className="text-muted-foreground">
          Organize rooms by category, add new groups, rename them, or remove
          them entirely.
        </p>
      </div>

      <ResizablePanelGroup direction="horizontal" className="h-full min-h-[520px]">
        <ResizablePanel defaultSize={32} minSize={25}>
          <div className="p-4 space-y-4">
            <Dialog
              open={createOpen}
              onOpenChange={(open) => {
                setCreateOpen(open);
                if (!open) {
                  setNewName("");
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="w-full">Create category</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a new category</DialogTitle>
                  <DialogDescription>
                    Add a name for the category. A slug will be generated automatically.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <Input
                    placeholder="Category name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    disabled={isCreating}
                    autoFocus
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateOpen(false)}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="flex flex-col gap-2">
              {filteredCategories.map((category) => (
                <Card
                  key={category.id}
                  className={`cursor-pointer border ${
                    selectedId === category.id ? "border-primary" : ""
                  }`}
                  onClick={() => setSelectedId(category.id)}
                >
                  <CardHeader className="p-3 flex flex-row items-center justify-between">
                    <div className="flex flex-col">
                      <CardTitle className="text-base">
                        {category.label}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {category.rooms.length} room
                        {category.rooms.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {category.rooms.length ? "Active" : "Empty"}
                    </Badge>
                  </CardHeader>
                </Card>
              ))}

              {filteredCategories.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No categories yet.
                </p>
              )}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={68} minSize={40}>
          {selectedCategory ? (
            <div className="p-6 space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold">
                    {selectedCategory.label}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedCategory.rooms.length} room
                    {selectedCategory.rooms.length === 1 ? "" : "s"} in this
                    category
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteOpen(true)}
                    disabled={isDeleting}
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="sm:w-80"
                  disabled={isRenaming}
                />
                <Button onClick={handleRename} disabled={isRenaming}>
                  {isRenaming ? "Saving..." : "Rename"}
                </Button>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Rooms</h3>
                {selectedCategory.rooms.length === 0 ? (
                  <Card>
                    <CardContent className="py-6 text-muted-foreground">
                      No rooms are currently assigned to this category.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {selectedCategory.rooms.map((room: Room) => (
                      <Card key={room.id} className="h-full">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">
                            {room.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Room #{room.number} - Level {room.level}
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            {room.description}
                          </p>
                          <div className="flex items-center justify-between text-sm">
                            <span>Capacity: {room.capacity}</span>
                            <Badge variant={room.active ? "secondary" : "destructive"}>
                              {room.active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Select a category to view its rooms.
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              Deleting a category will permanently remove it and all rooms
              assigned to it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
