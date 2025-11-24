import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/booking/booking/$bookingId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/booking/booking/$bookingId"!</div>
}
