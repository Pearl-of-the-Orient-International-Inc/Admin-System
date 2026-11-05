import { CertificationsPageContent } from "./_components/certifications-page-content";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string }>;
}) => {
  const { eventId } = await searchParams;
  return <CertificationsPageContent initialEventId={eventId} />;
};

export default Page;
