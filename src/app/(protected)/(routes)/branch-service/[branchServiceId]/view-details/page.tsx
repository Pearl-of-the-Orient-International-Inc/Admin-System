import { BranchServiceDetailsPageContent } from "../../_components/branch-service-details-page-content";

type PageProps = {
  params: Promise<{
    branchServiceId: string;
  }>;
};

const Page = async ({ params }: PageProps) => {
  const { branchServiceId } = await params;

  return <BranchServiceDetailsPageContent branchServiceId={branchServiceId} />;
};

export default Page;
