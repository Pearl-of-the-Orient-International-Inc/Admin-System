import { NewsBlogForm } from "./_components/news-blog-form";

type PageProps = {
  params: Promise<{
    newsBlogId: string;
  }>;
};

const Page = async ({ params }: PageProps) => {
  const { newsBlogId } = await params;

  if (newsBlogId === "create") {
    return <NewsBlogForm mode="create" />;
  }

  return <NewsBlogForm mode="update" newsBlogId={newsBlogId} />;
};

export default Page;
