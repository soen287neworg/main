import * as React from "react";
import type { FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { createServerFn } from "@tanstack/react-start";

import {
  createServerValidate,
  formOptions,
  getFormData,
  mergeForm,
  ServerValidateError,
  useForm,
  useStore,
  useTransform,
} from "@tanstack/react-form-start";

import { setResponseStatus } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";

const formTemplate = formOptions({
  defaultValues: {
    firstName: "",

    lastName: "",

    age: 0,

    email: "",

    password: "",
  },
});

const validateForm = createServerValidate({
  ...formTemplate,

  onServerValidate: ({ value }) => {
    const errors: {
      firstName?: string;

      lastName?: string;

      age?: string;

      email?: string;

      password?: string;
    } = {};

    if (!value.firstName.trim().length) {
      errors.firstName = "First Name required";
    }

    if (!value.lastName.trim().length) {
      errors.lastName = "Last Name required";
    }

    if (value.age < 13) {
      errors.age = "This service is available to people over the age of 13";
    }

    if (!value.email.trim().length) {
      errors.email = "Email cannot be empty";
    }

    if (value.password.trim().length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (Object.keys(errors).length > 0) {
      return errors;
    }
  },
});

export const handleForm = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) {
      throw new Error("Invalid form data");
    }

    return data;
  })

  .handler(async (ctx) => {
    try {
      const validated = await validateForm(ctx.data);
      // auth logic here
    } catch (e) {
      if (e instanceof ServerValidateError) {
        return e.response;
      }

      setResponseStatus(500);

      return "There was a server error";
    }

    return "Account created successfully";
  });

export const Route = createFileRoute("/user/sign_in/register")({
  component: RouteComponent,

  loader: async () => ({
    state: getFormData(),
  }),
});

function RouteComponent() {
  const { state } = Route.useLoaderData();

  const form = useForm({
    ...formTemplate,

    transform: useTransform((baseForm) => mergeForm(baseForm, state), [state]),
  });

  const formErrors = useStore(form.store, (formState) => formState.errors);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50scale-110 lg:scale-125 ">
      <Card className="w-full max-w-sm border-none shadow-lg rounded-2xl px-6 py-8">
        <CardContent className="p-0">
          {/* Top image */}

          <img
            src="/public/image_landing.png"
            alt="People collaborating"
            className="w-full h-70 object-cover rounded-xl mb-6"
          />

          {/* Title */}

          <h1 className="text-2xl font-semibold text-center mb-6 text-slate-900">
            Please sign up
          </h1>

          {/* Form */}

          <form
            action={handleForm.url}
            method="post"
            encType="multipart/formData"
            className="space-y-4"
          >
            {/* First + Last name */}

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <div className="w-full space-y-1">
                <form.Field
                  name="firstName"
                  validators={{
                    onChange: ({ value }) =>
                      value.trim().length ? "First Name required" : undefined,
                  }}
                >
                  {(field) => (
                    <>
                      <Label htmlFor="firstName">First name</Label>

                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        required
                      />

                      {field.state.meta.errors.map((error) => (
                        <p key={error as string}>{error}</p>
                      ))}
                    </>
                  )}
                </form.Field>
              </div>

              <div className="w-full space-y-1">
                <form.Field
                  name="lastName"
                  validators={{
                    onChange: ({ value }) =>
                      value.trim().length ? "Last Name required" : undefined,
                  }}
                >
                  {(field) => (
                    <>
                      <Label htmlFor="lastName">Last name</Label>

                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        required
                      />

                      {field.state.meta.errors.map((error) => (
                        <p key={error as string}>{error}</p>
                      ))}
                    </>
                  )}
                </form.Field>
              </div>
            </div>

            {/* Age */}

            <div className="space-y-1">
              <form.Field
                name="age"
                validators={{
                  onChange: ({ value }) =>
                    value < 13
                      ? "This service is available to people over the age of 13"
                      : undefined,
                }}
              >
                {(field) => (
                  <>
                    <Label htmlFor="age">Age</Label>

                    <Input
                      id="age"
                      name="age"
                      type="number"
                      min={0}
                      placeholder="20"
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value))
                      }
                      required
                    />

                    {field.state.meta.errors.map((error) => (
                      <p key={error as string}>{error}</p>
                    ))}
                  </>
                )}
              </form.Field>
            </div>

            {/* Email */}

            <div className="space-y-1">
              <form.Field
                name="email"
                validators={{
                  onChange: ({ value }) =>
                    value.trim().length ? "Email cannot be empty" : undefined,
                }}
              >
                {(field) => (
                  <>
                    <Label htmlFor="email">Email address</Label>

                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      required
                    />

                    {field.state.meta.errors.map((error) => (
                      <p key={error as string}>{error}</p>
                    ))}
                  </>
                )}
              </form.Field>
            </div>

            {/* Password */}

            <div className="space-y-1">
              <form.Field
                name="password"
                validators={{
                  onChange: ({ value }) =>
                    value.trim().length < 8
                      ? "Password must be at least 8 characters"
                      : undefined,
                }}
              >
                {(field) => (
                  <>
                    <Label htmlFor="password">Password</Label>

                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      required
                    />

                    {field.state.meta.errors.map((error) => (
                      <p key={error as string}>{error}</p>
                    ))}
                  </>
                )}
              </form.Field>
            </div>

            {/* Checkboxes */}

            <div className="space-y-2 pt-1">
              <div className="flex items-center space-x-2">
                <Checkbox id="rememberMe" name="rememberMe" />

                <Label htmlFor="rememberMe" className="text-sm text-slate-700">
                  Remember me
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="isAdmin" name="isAdmin" />

                <Label htmlFor="isAdmin" className="text-sm text-slate-700">
                  Sign up as Admin
                </Label>
              </div>
            </div>

            {/* Submit button */}

            <form.Subscribe
              selector={(formState) => [
                formState.canSubmit,

                formState.isSubmitting,
              ]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full mt-3 bg-amber-400 hover:bg-amber-500 text-white font-semibold rounded-xl h-11"
                >
                  {isSubmitting ? "Signing Up..." : "Sign Up"}
                </Button>
              )}
            </form.Subscribe>
          </form>

          {/* Return link */}

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm text-amber-500 hover:text-amber-600 underline-offset-2"
            >
              ← Return to Main Page
            </Link>
          </div>

          {/* Year */}

          <p className="mt-6 text-center text-xs text-slate-400">2025</p>
        </CardContent>
      </Card>
    </div>
  );
}
