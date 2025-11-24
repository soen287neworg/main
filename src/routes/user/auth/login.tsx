import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { loginUser } from "@/lib/services/AuthService";
import { toast } from "sonner";
import { APIError } from "better-auth";
import { useEffect } from "react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string(),
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
      const parsedData = loginSchema.parse(data);

      const loggedInUser = await loginUser(
        parsedData.email,
        parsedData.password
      );

      console.log("User signed in successfully:", loggedInUser);
      return { success: true, user: loggedInUser };
    } catch (error) {
      if (error instanceof APIError) {
        setResponseStatus(error.statusCode);
        return {
          success: false,
          name: error.body?.code || "AUTH_ERROR",
          error: error.body?.message || "State error with auth",
        };
      }
      if (error instanceof z.ZodError) {
        setResponseStatus(400);
        return {
          success: false,
          name: "VALIDATION_ERR",
          errors: error.flatten().fieldErrors,
        };
      }
      setResponseStatus(500);
      return {
        success: false,
        name: "SERVER_ERR",
        error: "An unexpected error occurred.",
      };
    }
  });

export const Route = createFileRoute("/user/auth/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { data } = authClient.useSession();

  useEffect(() => {
    if (data?.session) {
      navigate({ to: "/" });
    }
  }, [data]);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      for (const key in value) {
        formData.append(key, value[key as keyof typeof value]);
      }

      toast.promise(handleForm({ data: formData }), {
        loading: "Loading...",
        success: (data) => {
          navigate({ to: "/dashboard", reloadDocument: true });
          return `Login successful!`;
        },
        error: (error) => {
          var errorMessage: string = "Sign in failed. Please try again.";
          switch (error.result.name) {
            case "VALIDATION_ERR":
              errorMessage = "Please correct the errors and try again.";
              if (error.errors) {
                const errorMap = Object.entries(
                  error.errors as Record<string, string[]>
                ).reduce(
                  (acc, [key, messages]) => {
                    acc[key] = messages.join(", ");
                    return acc;
                  },
                  {} as Record<string, string>
                );
                form.setErrorMap(errorMap);
              }
              break;
            default:
              errorMessage =
                (error.result.errors
                  ? error.results.errors[0]
                  : error.result.error) || "Sign in failed. Please try again.";
              break;
          }
          return errorMessage;
        },
      });
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
            Please sign in
          </h1>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <form.Field
              name="email"
              validators={{ onChange: loginSchema.shape.email }}
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
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </Button>
              )}
            />
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/user/auth/register"
              className="text-sm text-amber-500 hover:text-amber-600 underline-offset-2"
            >
              Don't have an account? Sign up
            </Link>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">2025</p>
        </CardContent>
      </Card>
    </div>
  );
}
