import { AccountForm } from "../_components/account-form";

type PageProps = {
  params: Promise<{
    accountId: string;
  }>;
};

const Page = async ({ params }: PageProps) => {
  const { accountId } = await params;

  if (accountId === "new") {
    return <AccountForm mode="create" />;
  }

  return <AccountForm mode="update" accountId={accountId} />;
};

export default Page;
