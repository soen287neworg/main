import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/admin/resources/blackout')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/resources/blackout"!</div>
}
