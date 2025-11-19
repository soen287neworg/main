import { createFileRoute, Link } from '@tanstack/react-router'
import * as React from 'react'

// shadcn/ui components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"


export const Route = createFileRoute('/user/sign_in/user')({
  component: RouteComponent,
})

function RouteComponent() {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // TODO: hook up to backend login
  }

  return (
    <div className="min-h-screen flex items-center justify-center scale-110 lg:scale-125 bg-slate-50">
      <Card className="w-full max-w-sm border-none shadow-lg rounded-2xl px-6 py-8">
        <CardContent className="p-0">

          {/* Image */}
          <img
            src="/public/image_landing.png" // Replace with your image path
            alt="Team working"
            className="w-full h-60 object-cover rounded-xl mb-6"
          />

          {/* Title */}
          <h1 className="text-2xl font-semibold text-center mb-6 text-slate-900">
            Please sign in
          </h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
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
                type="password"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Remember me */}
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm text-slate-700">
                Remember me
              </Label>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full mt-3 bg-amber-400 hover:bg-amber-500 text-white font-semibold rounded-xl h-11"
            >
              Sign In
            </Button>
          </form>

          {/* Return link */}
          <div className="mt-6 text-center">
            <Link
              to="/user/sign_in/register"
              className="text-sm text-amber-500 hover:text-amber-600"
            >
              Don't have an account? Sign up
            </Link>
          </div>

          {/* Year */}
          <p className="mt-6 text-center text-xs text-slate-400">2025</p>
        </CardContent>
      </Card>
    </div>
  )
}
