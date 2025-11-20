import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";

const registerSchema = z.object({
  firstName: z.string().min(2, "First Name is required"),
  lastName: z.string().min(2, "Last Name is required"),
  age: z.coerce.number().min(13, "You must be at least 13 years old"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const handleForm = createServerFn({ method: "POST" })
  .inputValidator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error("Invalid form data");
    }
    return data;
  })
  .handler(async (ctx) => {
    const formData = ctx.data;
    try {
      const data = Object.fromEntries(formData.entries());
      const parsedData = registerSchema.parse(data);
      //
      // Here would be your auth logic, e.g., creating a user in the database
      //
      console.log("User registered successfully:", parsedData);
      return { success: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        setResponseStatus(400);
        return { success: false, errors: error.flatten().fieldErrors };
      }
      setResponseStatus(500);
      return { success: false, error: "An unexpected error occurred." };
    }
  });

export const Route = createFileRoute("/user/sign_in/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      age: "",
      email: "",
      password: "",
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-sm border-none shadow-lg rounded-2xl px-6 py-8">
        <CardContent className="p-0">
          <img
            src="/public/image_landing.png"
            alt="People collaborating"
            className="w-full h-auto object-cover rounded-xl mb-6"
          />
          <h1 className="text-2xl font-semibold text-center mb-6 text-slate-900">
            Please sign up
          </h1>

          <form
            action={handleForm.url}
            method="POST"
            encType="multipart/form-data"
            className="space-y-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <form.Field
                name="firstName"
                validators={{ onChange: registerSchema.shape.firstName }}
                children={(field) => (
                  <div className="w-full space-y-1">
                    <Label htmlFor={field.name}>First name</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors ? (
                      <em role="alert" className="text-red-500 text-xs">
                        {field.state.meta.errors.at(0)?.message}
                      </em>
                    ) : null}
                  </div>
                )}
              />
              <form.Field
                name="lastName"
                validators={{ onChange: registerSchema.shape.lastName }}
                children={(field) => (
                  <div className="w-full space-y-1">
                    <Label htmlFor={field.name}>Last name</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors ? (
                      <em role="alert" className="text-red-500 text-xs">
                        {field.state.meta.errors.at(0)?.message}
                      </em>
                    ) : null}
                  </div>
                )}
              />
            </div>

            <form.Field
              name="age"
              validators={{
                onChange: ({ value }) => {
                  const result = registerSchema.shape.age.safeParse(value);
                  if (!result.success) {
                    return result.error.issues.at(0)?.message;
                  }
                },
              }}
              children={(field) => (
                <div className="space-y-1">
                  <Label htmlFor={field.name}>Age</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    type="number"
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors ? (
                    <em role="alert" className="text-red-500 text-xs">
                      {field.state.meta.errors.at(0)}
                    </em>
                  ) : null}
                </div>
              )}
            />

            <form.Field
              name="email"
              validators={{ onChange: registerSchema.shape.email }}
              children={(field) => (
                <div className="space-y-1">
                  <Label htmlFor={field.name}>Email address</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    type="email"
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors ? (
                    <em role="alert" className="text-red-500 text-xs">
                      {field.state.meta.errors.at(0)?.message}
                    </em>
                  ) : null}
                </div>
              )}
            />

            <form.Field
              name="password"
              validators={{
                onChange: registerSchema.shape.password,
              }}
              children={(field) => (
                <div className="space-y-1">
                  <Label htmlFor={field.name}>Password</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    type="password"
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors ? (
                    <em role="alert" className="text-red-500 text-xs">
                      {field.state.meta.errors.at(0)?.message}
                    </em>
                  ) : null}
                </div>
              )}
            />
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full mt-3 bg-amber-400 hover:bg-amber-500 text-white font-semibold rounded-xl h-11"
                >
                  {isSubmitting ? "Signing Up..." : "Sign Up"}
                </Button>
              )}
            />
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm text-amber-500 hover:text-amber-600 underline-offset-2"
            >
              ← Return to Main Page
            </Link>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">2025</p>
        </CardContent>
      </Card>
    </div>
  );
}
