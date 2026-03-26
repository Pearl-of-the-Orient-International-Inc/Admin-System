import { AccountActivityPageContent } from "../../_components/account-activity-page-content";

type PageProps = {
  params: Promise<{
    accountId: string;
  }>;
};

const Page = async ({ params }: PageProps) => {
  const { accountId } = await params;

  return <AccountActivityPageContent accountId={accountId} />;
};

export default Page;
