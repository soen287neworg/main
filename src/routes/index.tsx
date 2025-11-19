import * as React from "react"
import { createFileRoute, Link } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card"

export const Route = createFileRoute("/")({
  component: LandingPage,
})

const features = [
  {
    key: "study-rooms",
    label: "Study Rooms",
    icon: "📚",
    title: "Study Rooms",
    description:
      "Book quiet or group study rooms for focused work or team projects.",
    rules: "Respect time limits. Leave the room clean for the next group.",
  },
  {
    key: "labs",
    label: "Labs",
    icon: "⚛️",
    title: "Labs",
    description:
      "Reserve access to computer labs or specialized lab spaces on campus.",
    rules: "Follow safety protocols and lab-specific guidelines at all times.",
  },
  {
    key: "sports",
    label: "Sports Spaces",
    icon: "🏀",
    title: "Sports Spaces",
    description:
      "Book gyms, courts, or indoor fields for practices, games, or events.",
    rules: "Use appropriate footwear and respect shared time slots.",
  },
  {
    key: "equipment",
    label: "Specialized Equipment",
    icon: "🔧",
    title: "Specialized Equipment",
    description:
      "Reserve cameras, projectors, lab tools, or other shared equipment.",
    rules: "Return equipment on time and report any damage immediately.",
  },
  {
    key: "software",
    label: "Software Seats",
    icon: "🖥️",
    title: "Software Seats",
    description:
      "Access to specialized software on campus computers (e.g., Adobe Creative Suite, MATLAB).",
    rules: "Log out after use. Do not save personal files on public machines.",
  },
]

function LandingPage() {
  return (
    <div className=" min-h-screen bg-slate-50 flex flex-col">
      {/* Top Nav */}
      <header className="w-full border-b bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-slate-900">
              Campus Booking
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <a href="#" className="hover:text-slate-900">
              Main
            </a>
            <a href="#" className="hover:text-slate-900">
              Resources
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/user/sign_in/user">
              <Button
                variant="outline"
                className="border-amber-200 text-amber-600 bg-white hover:bg-amber-50"
              >
                Sign In
              </Button>
            </Link>
            <Link to="/user/sign_in/register">
              <Button className="bg-amber-400 hover:bg-amber-500 text-white">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center">
  <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            {/* Left text / badges */}
            <div className="w-full lg:w-1/2 space-y-10">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
                Campus Booking
              </h1>
              <p className="text-lg text-slate-600">
                Reserve university spaces in one click.
              </p>

              <div className="flex flex-wrap gap-4 mt-7">
                {features.map((feature) => (
                  <HoverCard key={feature.key} openDelay={80} closeDelay={80}>
                    <HoverCardTrigger asChild>
                      <button
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm hover:shadow-md transition-shadow"
                        type="button"
                      >
                        <span>{feature.icon}</span>
                        <span>{feature.label}</span>
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent
                      side="top"
                      align="start"
                      className="max-w-xs shadow-lg border-0 rounded-2xl"
                    >
                      <Card className="border-0 shadow-none">
                        <div className="p-4">
                          <h3 className="text-sm font-semibold text-amber-500 mb-1">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-slate-700 mb-3">
                            {feature.description}
                          </p>
                          <p className="text-xs font-semibold text-amber-500 mb-1">
                            Rules:
                          </p>
                          <p className="text-xs text-slate-700">
                            {feature.rules}
                          </p>
                        </div>
                      </Card>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
            </div>

            {/* Right image */}
            <div className="w-full lg:w-1/2">
              <div className="rounded-3xl overflow-hidden shadow-xl bg-white">
                <img
                  src="/public/image_landing.png" // put your hero image in /public
                  alt="Students booking campus spaces"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-xs text-center text-slate-500">
            © 2025 Campus Booking | Concordia University Project.
          </p>
        </div>
      </footer>
    </div>
  )
}
