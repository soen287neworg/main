import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "../auth";

export const getSessionFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders();
    return auth.api.getSession({ headers });
  }
);

export const isAuthorizedFn = createServerFn({ method: "POST" })
  .inputValidator((data: { userId: string; bitmask: number }) => data)
  .handler(async () => {});
