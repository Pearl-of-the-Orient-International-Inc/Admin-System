import { OfficeTitleDetailsPageContent } from "../../_components/office-title-details-page-content";

type PageProps = {
  params: Promise<{
    officeTitleId: string;
  }>;
};

const Page = async ({ params }: PageProps) => {
  const { officeTitleId } = await params;

  return <OfficeTitleDetailsPageContent officeTitleId={officeTitleId} />;
};

export default Page;
