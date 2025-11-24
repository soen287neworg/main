import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/admin/resources/rooms')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/resources/rooms"!</div>
}
