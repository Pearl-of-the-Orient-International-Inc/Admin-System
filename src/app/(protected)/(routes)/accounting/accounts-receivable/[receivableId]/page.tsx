import { AccountsReceivableFormPage } from "../_components/accounts-receivable-form-page";

const Page = async ({
  params,
}: {
  params: Promise<{ receivableId: string }>;
}) => {
  const { receivableId } = await params;

  return <AccountsReceivableFormPage receivableId={receivableId} />;
};

export default Page;
