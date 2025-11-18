import { createServerFn } from "@tanstack/react-start";

const updateCount = createServerFn({ method: "POST" })
  .inputValidator((d: number) => d)
  .handler(async ({ data }) => {});

function RoomsList() {
  return <div>Hello</div>;
}
