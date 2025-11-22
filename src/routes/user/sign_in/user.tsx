import { auth } from "@/lib/auth"

import * as React from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { setResponseStatus } from "@tanstack/react-start/server"
import { redirect } from "@tanstack/react-router"


import {
  formOptions,
  mergeForm,
  useForm,
  useStore,
  useTransform,
} from "@tanstack/react-form-start"

import {
  createServerValidate,
  getFormData,
  ServerValidateError,
} from "@tanstack/react-form-start"

// shadcn/ui components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"

// ------------------------
// 1) Form options
// ------------------------
const loginFormOptions = formOptions({
  defaultValues: {
    email: "",
    password: "",
  },
})

// ------------------------
// 2) Server-side validation
// ------------------------
const validateLoginForm = createServerValidate({
  ...loginFormOptions,
  onServerValidate: async ({
    value,
  }: {
    value: { email: string; password: string }
  }) => {
    const errors: Record<string, string> = {}

    if (!value.email?.trim()) {
      errors.email = "Email cannot be empty"
    }

    if (!value.password?.trim()) {
      errors.password = "Password is required"
    }

    return Object.keys(errors).length ? errors : undefined
  },
})

// ------------------------
// 3) Login server action
// ------------------------
export const loginAction = createServerFn({
  method: "POST",
})
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) {
      throw new Error("Invalid form data")
    }
    return data
  })
  .handler(async (ctx) => {
    try {
      const validated = await validateLoginForm(ctx.data)
      const { email, password } = validated
      const rememberMe = ctx.data.get("remember") === "on"

      await auth.api.signInEmail({
        body: {
          email,
          password,
          rememberMe,
        },
        
      })

      throw redirect({ to: "/dashboard" })
    } catch (e) {
      if (e instanceof ServerValidateError) {
        return e.response
      }
      console.error(e)
      setResponseStatus(500)
      return "There was a server error"
    }
  })

// ------------------------
// 4) Loader to hydrate form state
// ------------------------
export const getLoginFormDataFromServer = createServerFn({
  method: "GET",
}).handler(async () => {
  return getFormData()
})

// ------------------------
// 5) Route definition
// ------------------------
export const Route = createFileRoute("/user/sign_in/user")({
  component: RouteComponent,
  loader: async () => ({
    state: await getLoginFormDataFromServer(),
  }),
})

// ------------------------
// 6) React component
// ------------------------
function RouteComponent() {
  const { state } = Route.useLoaderData()

const form = useForm({
  ...loginFormOptions,
  transform: useTransform((baseForm) => mergeForm(baseForm, state), [state]),
})



  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 scale-110 lg:scale-125">
      <Card className="w-full max-w-sm border-none shadow-lg rounded-2xl px-6 py-8">
        <CardContent className="p-0">
          {/* Image */}
          <img
            src="/image_landing.png" // file under /public
            alt="Team working"
            className="w-full h-60 object-cover rounded-xl mb-6"
          />

          {/* Title */}
          <h1 className="text-2xl font-semibold text-center mb-6 text-slate-900">
            Please sign in
          </h1>

          {/* FORM */}
          <form
            action={loginAction.url}
            method="post"
            encType="multipart/form-data"
            className="space-y-4"
          >
            {/* Email */}
            <form.Field name="email">
              {(field) => (
                <div className="space-y-1">
                  <Label htmlFor={field.name}>Email address</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    placeholder="you@example.com"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors?.length ? (
                    <p className="text-sm text-red-500">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  ) : null}
                </div>
              )}
            </form.Field>

            {/* Password */}
            <form.Field name="password">
              {(field) => (
                <div className="space-y-1">
                  <Label htmlFor={field.name}>Password</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    placeholder="••••••••"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors?.length ? (
                    <p className="text-sm text-red-500">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  ) : null}
                </div>
              )}
            </form.Field>

            {/* Remember me */}
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox id="remember" name="remember" />
              <Label htmlFor="remember" className="text-sm text-slate-700">
                Remember me
              </Label>
            </div>

            {/* Submit button */}
            <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="w-full mt-3 bg-amber-400 hover:bg-amber-500 text-white font-semibold rounded-xl h-11 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </Button>
              )}
            </form.Subscribe>
          </form>

          {/* Link to sign up */}
          <div className="mt-6 text-center">
            <Link
              to="/user/sign_in/register"
              className="text-sm text-amber-500 hover:text-amber-600"
            >
              Don&apos;t have an account? Sign up
            </Link>
          </div>

          {/* Year */}
          <p className="mt-6 text-center text-xs text-slate-400">2025</p>
        </CardContent>
      </Card>
    </div>
  )
}
