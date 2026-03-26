import { UserActivityTimelinePageContent } from "./_components/user-activity-timeline-page-content";

type PageProps = {
  params: Promise<{
    userId: string;
  }>;
};

const Page = async ({ params }: PageProps) => {
  const { userId } = await params;

  return <UserActivityTimelinePageContent userId={userId} />;
};

export default Page;
