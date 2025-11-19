<<<<<<< Updated upstream
import * as React from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
=======
import { createFileRoute } from "@tanstack/react-router";
import {
  Zap,
  Server,
  Route as RouteIcon,
  Shield,
  Waves,
  Sparkles,
} from "lucide-react";
>>>>>>> Stashed changes

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card"

<<<<<<< Updated upstream
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
=======
function App() {
  const features = [
    {
      icon: <Zap className="w-12 h-12 text-cyan-400" />,
      title: "Powerful Server Functions",
      description:
        "Write server-side code that seamlessly integrates with your client components. Type-safe, secure, and simple.",
    },
    {
      icon: <Server className="w-12 h-12 text-cyan-400" />,
      title: "Flexible Server Side Rendering",
      description:
        "Full-document SSR, streaming, and progressive enhancement out of the box. Control exactly what renders where.",
    },
    {
      icon: <RouteIcon className="w-12 h-12 text-cyan-400" />,
      title: "API Routes",
      description:
        "Build type-safe API endpoints alongside your application. No separate backend needed.",
    },
    {
      icon: <Shield className="w-12 h-12 text-cyan-400" />,
      title: "Strongly Typed Everything",
      description:
        "End-to-end type safety from server to client. Catch errors before they reach production.",
    },
    {
      icon: <Waves className="w-12 h-12 text-cyan-400" />,
      title: "Full Streaming Support",
      description:
        "Stream data from server to client progressively. Perfect for AI applications and real-time updates.",
    },
    {
      icon: <Sparkles className="w-12 h-12 text-cyan-400" />,
      title: "Next Generation Ready",
      description:
        "Built from the ground up for modern web applications. Deploy anywhere JavaScript runs.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <section className="relative py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10"></div>
        <div className="relative max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-6 mb-6">
            <img
              src="/tanstack-circle-logo.png"
              alt="TanStack Logo"
              className="w-24 h-24 md:w-32 md:h-32"
            />
            <h1 className="text-6xl md:text-7xl font-black text-white [letter-spacing:-0.08em]">
              <span className="text-gray-300">TANSTACK</span>{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                START
              </span>
            </h1>
          </div>
          <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-light">
            The framework for next generation AI applications
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-8">
            Full-stack framework powered by TanStack Router for React and Solid.
            Build modern applications with server functions, streaming, and type
            safety.
          </p>
          <div className="flex flex-col items-center gap-4">
            <a
              href="https://tanstack.com/start"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/50"
            >
              Documentation
            </a>
            <p className="text-gray-400 text-sm mt-2">
              Begin your TanStack Start journey by editing{" "}
              <code className="px-2 py-1 bg-slate-700 rounded text-cyan-400">
                /src/routes/index.tsx
              </code>
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
>>>>>>> Stashed changes
    </div>
  )
}
