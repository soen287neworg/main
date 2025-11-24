import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import {
  getRequestHeaders,
  setResponseStatus,
} from "@tanstack/react-start/server";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const AGE_STORAGE_PREFIX = "dashboard-profile-age-";

const profileSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Enter a valid email address"),
  age: z
    .coerce.number()
    .int()
    .min(13, "You must be at least 13 years old")
    .max(120, "Please enter a valid age")
    .optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(8, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export const saveProfile = createServerFn({ method: "POST" })
  .inputValidator((data: ProfileFormValues) => profileSchema.parse(data))
  .handler(async ({ data }) => {
    const headers = getRequestHeaders();

    try {
      const session = await auth.api.getSession({ headers });
      const currentEmail = session?.user?.email;
      const updates: Record<string, unknown> = {};

      if (data.fullName) {
        updates.name = data.fullName;
      }

      if (Object.keys(updates).length > 0) {
        await auth.api.updateUser({ body: updates, headers });
      }

      if (data.email && data.email !== currentEmail) {
        await auth.api.changeEmail({
          body: {
            newEmail: data.email,
          },
          headers,
        });
      }

      return { success: true };
    } catch (error) {
      console.error("Failed to save profile", error);
      setResponseStatus(400);
      return {
        success: false,
        message: "We couldn't update your profile. Please try again.",
      };
    }
  });

export const updatePassword = createServerFn({ method: "POST" })
  .inputValidator((data: PasswordFormValues) => passwordSchema.parse(data))
  .handler(async ({ data }) => {
    const headers = getRequestHeaders();

    try {
      await auth.api.changePassword({
        body: {
          newPassword: data.newPassword,
          currentPassword: data.currentPassword,
          revokeOtherSessions: true,
        },
        headers,
      });

      return { success: true };
    } catch (error) {
      console.error("Failed to update password", error);
      setResponseStatus(400);
      return {
        success: false,
        message:
          "We couldn't update your password. Double-check your current password and try again.",
      };
    }
  });

export const Route = createFileRoute("/dashboard/profile/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: sessionPayload } = authClient.useSession();
  const user = sessionPayload?.user;

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.name ?? "",
      email: user?.email ?? "",
      age: undefined,
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    user?.image ?? undefined
  );
  const previewUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user) {
      profileForm.reset({
        fullName: user.name ?? "",
        email: user.email ?? "",
        age: readStoredAge(user.id),
      });
      setAvatarFile(null);
      setAvatarPreview(user.image ?? undefined);
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    }
  }, [user, profileForm]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const handleAvatarChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    previewUrlRef.current = objectUrl;
    setAvatarFile(file);
    setAvatarPreview(objectUrl);
  };

  const handleProfileSubmit = async (values: ProfileFormValues) => {
    toast.promise(
      saveProfile({
        data: values,
      }),
      {
        loading: "Saving profile...",
        success: () => {
          if (values.age && user?.id) {
            storeAge(user.id, values.age);
          }

          return "Profile updated successfully.";
        },
        error: (error) =>
          error?.message || "We couldn't update your profile right now.",
      }
    );
  };

  const handlePasswordSubmit = async (values: PasswordFormValues) => {
    toast.promise(
      updatePassword({
        data: values,
      }),
      {
        loading: "Updating password...",
        success: () => {
          passwordForm.reset({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          return "Password updated.";
        },
        error: (error) =>
          error?.message || "We couldn't update your password right now.",
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold leading-tight">Profile</h1>
        <p className="text-muted-foreground">
          Update the details you shared during sign up and keep your account
          secure.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Personal information</CardTitle>
              <CardDescription>
                Your basic information and contact email.
              </CardDescription>
            </div>
            <Badge variant="outline">Editable</Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={avatarPreview} alt={user?.name} />
                <AvatarFallback>
                  {user?.name
                    ?.split(" ")
                    .map((part) => part.at(0))
                    .join("")
                    .toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="font-medium">{user?.name || "Unnamed user"}</p>
                <p className="text-sm text-muted-foreground">
                  {user?.email || "Add your contact email"}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload new avatar
                </Button>
                {avatarFile ? (
                  <p className="text-xs text-muted-foreground">
                    Not uploaded yet - kept locally for this session.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Choose a file to preview; upload will be added later.
                  </p>
                )}
              </div>
            </div>

            <Separator />

            <Form {...profileForm}>
              <form
                className="space-y-6"
                onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={profileForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            {...field}
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            {...field}
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={13}
                            max={120}
                            placeholder="18"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      profileForm.reset({
                        fullName: user?.name ?? "",
                        email: user?.email ?? "",
                        age: readStoredAge(user?.id),
                      });
                      if (previewUrlRef.current) {
                        URL.revokeObjectURL(previewUrlRef.current);
                        previewUrlRef.current = null;
                      }
                      setAvatarFile(null);
                      setAvatarPreview(user?.image ?? undefined);
                    }}
                  >
                    Reset
                  </Button>
                  <Button type="submit">Save changes</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Account status</CardTitle>
            <CardDescription>
              Keep your sign-in details up to date and secure.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Email verification</p>
                <p className="text-sm text-muted-foreground">
                  {user?.emailVerified
                    ? "Your email is verified"
                    : "Verify your email to secure your account"}
                </p>
              </div>
              <Badge variant={user?.emailVerified ? "default" : "secondary"}>
                {user?.emailVerified ? "Verified" : "Pending"}
              </Badge>
            </div>
            <div className="rounded-lg border p-3">
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">
                Use a strong, unique password to protect your account.
              </p>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">
                    Last updated
                  </span>
                  <span className="text-sm font-medium">
                    Keep this up to date
                  </span>
                </div>
                <Badge variant="outline">Secure</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>
            Update your password regularly to keep your account safe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
            >
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Current password</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm new password</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-3 sm:col-span-2 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    passwordForm.reset({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    })
                  }
                >
                  Cancel
                </Button>
                <Button type="submit">Update password</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

const readStoredAge = (userId?: string) => {
  if (typeof window === "undefined" || !userId) {
    return undefined;
  }

  const stored = window.localStorage.getItem(`${AGE_STORAGE_PREFIX}${userId}`);
  const parsed = Number(stored);

  if (Number.isNaN(parsed)) {
    return undefined;
  }

  return parsed;
};

const storeAge = (userId: string, age?: number) => {
  if (typeof window === "undefined") {
    return;
  }

  const key = `${AGE_STORAGE_PREFIX}${userId}`;

  if (!age) {
    window.localStorage.removeItem(key);
    return;
  }

  window.localStorage.setItem(key, String(age));
};
