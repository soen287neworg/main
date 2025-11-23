import { setCookie } from "@tanstack/react-start/server";
import { BetterAuthPlugin } from "better-auth";
import { parseSetCookieHeader } from "better-auth/cookies";
import { createAuthMiddleware } from "@better-auth/core/middleware";

// BetterAuth messed something up with the auto cookie plugin
// This function is a copy of BetterAuth's but modifies the hooks that are called differently in Tanstack start
// Credits: https://github.com/better-auth/better-auth/issues/4389#issuecomment-3383331495

export function autoCookies(): BetterAuthPlugin {
  return {
    id: "auto-cookies",
    hooks: {
      after: [
        {
          matcher(_ctx) {
            return true;
          },
          handler: createAuthMiddleware(async (ctx) => {
            const returned = ctx.context.responseHeaders;
            if ("_flag" in ctx && ctx._flag === "router") {
              return;
            }
            if (returned instanceof Headers) {
              const setCookies = returned?.get("set-cookie");
              if (!setCookies) {
                return;
              }
              const parsed = parseSetCookieHeader(setCookies);
              parsed.forEach((value, key) => {
                if (!key) {
                  return;
                }
                const opts = {
                  sameSite: value.samesite,
                  secure: value.secure,
                  maxAge: value["max-age"],
                  httpOnly: value.httponly,
                  domain: value.domain,
                  path: value.path,
                };

                setCookie(key, decodeURIComponent(value.value), opts);
              });
              return;
            }
          }),
        },
      ],
    },
  };
}
