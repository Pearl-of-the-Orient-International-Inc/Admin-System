import { initialOfficeData } from "../_components/office-data"
import { OfficeForm } from "../_components/office-form"

type PageProps = {
  params: Promise<{
    organizationId: string
  }>
}

const Page = async ({ params }: PageProps) => {
  const { organizationId } = await params
  const office = initialOfficeData.find((item) => item.id === organizationId)

  if (!office) {
    return <OfficeForm mode="create" officeId={organizationId} />
  }

  return <OfficeForm mode="update" initialOffice={office} officeId={organizationId} />
}

export default Page
