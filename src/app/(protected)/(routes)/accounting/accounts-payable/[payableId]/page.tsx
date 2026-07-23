import { AccountsPayableFormPage } from "../_components/accounts-payable-form-page";

const Page = async ({
  params,
}: {
  params: Promise<{ payableId: string }>;
}) => {
  const { payableId } = await params;

  return <AccountsPayableFormPage payableId={payableId} />;
};

export default Page;
