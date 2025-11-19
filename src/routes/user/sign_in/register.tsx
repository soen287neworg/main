import * as React from "react"
import type { FormEvent } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"

// shadcn/ui components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"

export const Route = createFileRoute("/user/sign_in/register")({
  component: RouteComponent,
})

function RouteComponent() {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)

    const payload = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      age: Number(formData.get("age")),
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      rememberMe: formData.get("rememberMe") === "on",
      isAdmin: formData.get("isAdmin") === "on",
    }

    try {
      // 🔗 Replace this URL with your real backend endpoint
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error("Failed to sign up")
      }

      // ✅ TODO: handle success (redirect, show message, store token, etc.)
      // e.g. navigate to login or dashboard
      // router.navigate({ to: "/user/sign_in/user" })
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50scale-110 lg:scale-125 ">
      <Card className="w-full max-w-sm border-none shadow-lg rounded-2xl px-6 py-8">
        <CardContent className="p-0">
          {/* Top image */}
          <img
            src="/public/image_landing.png" // put your image in /public and use its name
            alt="People collaborating"
            className="w-full h-70 object-cover rounded-xl mb-6"
          />

          {/* Title */}
          <h1 className="text-2xl font-semibold text-center mb-6 text-slate-900">
            Please sign up
          </h1>

          {/* Error message */}
          {error && (
            <p className="mb-4 text-sm text-red-500 text-center">{error}</p>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First + Last name */}
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <div className="w-full space-y-1">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  required
                />
              </div>
              <div className="w-full space-y-1">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            {/* Age */}
            <div className="space-y-1">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                name="age"
                type="number"
                min={0}
                placeholder="20"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
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
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 bg-amber-400 hover:bg-amber-500 text-white font-semibold rounded-xl h-11"
            >
              {isSubmitting ? "Signing Up..." : "Sign Up"}
            </Button>
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
  )
}
