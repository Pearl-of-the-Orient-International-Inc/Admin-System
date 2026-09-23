import { BookingRequestsSection } from "../_components/booking-requests-section";

export default function ChaplainServiceBookingRequestsPage() {
  return (
    <section className="space-y-6 p-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Booking Requests
        </h1>
        <p className="text-muted-foreground text-sm">
          Review chaplain service requests, schedules, and recorded decisions.
        </p>
      </div>
      <BookingRequestsSection />
    </section>
  );
}
