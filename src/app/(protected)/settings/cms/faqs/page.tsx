import { Heading } from "@/components/Heading";
import { FaqsCard } from "./_components/FaqsCard";

const Page = () => {
  return (
    <div>
      <Heading
        title="Frequently asked questions"
        description="Create and manage FAQs for members, ministry workers, seminarians, and chaplaincy staff."
      />

      <div className="space-y-10 mt-10">
        <FaqsCard />
      </div>
    </div>
  );
};

export default Page;
