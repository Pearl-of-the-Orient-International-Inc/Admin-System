import { useMemo } from "react";
import {
  getRegions,
  getProvinces,
  getMunicipalities,
  getBarangays,
} from "@/constants";

export const useAddressData = (
  selectedRegionName: string,
  selectedProvinceName: string,
  selectedMunicipalityName: string,
) => {
  const regionOptions = useMemo(
    () => getRegions().map((item) => item.region_description),
    [],
  );

  const regionId = useMemo(
    () =>
      getRegions().find((r) => r.region_description === selectedRegionName)
        ?.region_id ?? null,
    [selectedRegionName],
  );

  const provinceOptions = useMemo(
    () =>
      regionId !== null
        ? getProvinces(regionId).map((item) => item.province_name)
        : [],
    [regionId],
  );

  const provinceId = useMemo(
    () =>
      getProvinces(regionId).find(
        (p) => p.province_name === selectedProvinceName,
      )?.province_id ?? null,
    [regionId, selectedProvinceName],
  );

  const municipalityOptions = useMemo(
    () =>
      provinceId !== null
        ? getMunicipalities(provinceId).map((item) => item.municipality_name)
        : [],
    [provinceId],
  );

  const municipalityId = useMemo(
    () =>
      getMunicipalities(provinceId).find(
        (m) => m.municipality_name === selectedMunicipalityName,
      )?.municipality_id ?? null,
    [provinceId, selectedMunicipalityName],
  );

  const barangayOptions = useMemo(
    () =>
      municipalityId !== null
        ? getBarangays(municipalityId).map((item) => item.barangay_name)
        : [],
    [municipalityId],
  );

  return {
    regionOptions,
    provinceOptions,
    municipalityOptions,
    barangayOptions,
  };
};
