import { MFACard } from './_components/MFACard';
import { LoginCard } from './_components/LoginCard';
import { PreferenceCard } from './_components/PreferenceCard';
import { ProfileCard } from "./_components/ProfileCard";
import { AccountActionCard } from './_components/AccountActionCard';
import { Heading } from "@/components/Heading";

const Page = () => {
  return (
    <div>
      <Heading
        title="Account Settings"
        description="Manage your profile, preferences, and account settings."
      />

      <div className="space-y-10 mt-10">
        <ProfileCard />
        <LoginCard />
        <MFACard />
        <PreferenceCard />
        <AccountActionCard />
      </div>
    </div>
  );
};

export default Page;
