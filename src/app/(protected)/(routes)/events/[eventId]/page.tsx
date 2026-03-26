import { EventForm } from "../_components/event-form";

type PageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

const Page = async ({ params }: PageProps) => {
  const { eventId } = await params;

  if (eventId === "new") {
    return <EventForm mode="create" />;
  }

  return <EventForm mode="update" eventId={eventId} />;
};

export default Page;
