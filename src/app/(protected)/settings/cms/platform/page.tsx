"use client";

import { useState } from "react";
import { Heading } from "@/components/Heading";
import { CompanyInfoCard } from "./_components/CompanyInfoCard";
import { AddressCard } from "./_components/AddressCard";
import { MissionVisionCard } from "./_components/MissionVisionCard";
import { useAddressData } from '@/lib/address-selection';

const Page = () => {
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyNumber, setCompanyNumber] = useState("");
  const [tagline, setTagline] = useState("");

  const [region, setRegion] = useState("");
  const [province, setProvince] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [barangay, setBarangay] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [address, setAddress] = useState("");

  const [mission, setMission] = useState("");
  const [vision, setVision] = useState("");
  const [objectives, setObjectives] = useState<string[]>([""]);

  const {
    regionOptions,
    provinceOptions,
    municipalityOptions,
    barangayOptions,
  } = useAddressData(region, province, municipality);

  return (
    <div className="p-10">
      <Heading
        title="Platform Settings"
        description="Manage your organization information, contact details, address, mission, vision, and objectives."
      />

      <div className="space-y-10 mt-10">
        <CompanyInfoCard
          companyName={companyName}
          companyEmail={companyEmail}
          companyNumber={companyNumber}
          tagline={tagline}
          onCompanyNameChange={setCompanyName}
          onCompanyEmailChange={setCompanyEmail}
          onCompanyNumberChange={setCompanyNumber}
          onTaglineChange={setTagline}
        />
        <AddressCard
          region={region}
          province={province}
          municipality={municipality}
          barangay={barangay}
          zipCode={zipCode}
          address={address}
          onRegionChange={(value) => {
            setRegion(value);
            setProvince("");
            setMunicipality("");
            setBarangay("");
          }}
          onProvinceChange={(value) => {
            setProvince(value);
            setMunicipality("");
            setBarangay("");
          }}
          onMunicipalityChange={(value) => {
            setMunicipality(value);
            setBarangay("");
          }}
          onBarangayChange={setBarangay}
          onZipCodeChange={setZipCode}
          onAddressChange={setAddress}
          regionOptions={regionOptions}
          provinceOptions={provinceOptions}
          municipalityOptions={municipalityOptions}
          barangayOptions={barangayOptions}
        />
        <MissionVisionCard
          mission={mission}
          vision={vision}
          objectives={objectives}
          onMissionChange={setMission}
          onVisionChange={setVision}
          onObjectivesChange={setObjectives}
        />
      </div>
    </div>
  );
};

export default Page;
