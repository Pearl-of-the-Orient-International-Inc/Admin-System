import { OfficeTitleForm } from "../_components/office-title-form";

type PageProps = {
  params: Promise<{
    officeTitleId: string;
  }>;
};

const Page = async ({ params }: PageProps) => {
  const { officeTitleId } = await params;

  if (officeTitleId === "create") {
    return <OfficeTitleForm mode="create" />;
  }

  return <OfficeTitleForm mode="update" officeTitleId={officeTitleId} />;
};

export default Page;
