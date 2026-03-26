import { BranchServiceForm } from "../_components/branch-service-form";

type PageProps = {
  params: Promise<{
    branchServiceId: string;
  }>;
};

const Page = async ({ params }: PageProps) => {
  const { branchServiceId } = await params;

  if (branchServiceId === "create") {
    return <BranchServiceForm mode="create" />;
  }

  return <BranchServiceForm mode="update" branchServiceId={branchServiceId} />;
};

export default Page;
