import { Link } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

export default function Header() {
  const { data } = authClient.useSession();

  return (
    <header className="w-full border-b bg-white sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Left: logo / brand */}
        <Link to="/" className="flex items-center gap-2">
          {/* If you want a logo image, replace this text with <img /> */}
          <span className="text-lg font-semibold text-slate-900">
            Campus Booking
          </span>
        </Link>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-slate-600">
          <Link
            to="/"
            className="hover:text-slate-900"
            activeProps={{ className: "font-semibold text-slate-900" }}
          >
            Main
          </Link>
          <Link
            to="/resources"
            className="hover:text-slate-900"
            activeProps={{ className: "font-semibold text-slate-900" }}
          >
            Resources
          </Link>
        </div>

        {/* Right side: auth buttons */}
        <div className="flex items-center gap-2 text-sm">
          {data?.session ? (
            <Button onClick={() => authClient.signOut()}>Logout</Button>
          ) : (
            <>
              <Link
                to="/user/auth/login"
                className="px-3 py-1.5 rounded-lg border border-amber-300 text-amber-600 hover:bg-amber-50 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/user/auth/register"
                className="px-3 py-1.5 rounded-lg bg-amber-400 text-white font-medium hover:bg-amber-500 transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
