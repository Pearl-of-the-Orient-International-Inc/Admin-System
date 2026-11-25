const PSGC_API_BASE_URL = "https://psgc.gitlab.io/api";
const NCR_REGION_CODE = "130000000";
const NCR_METRO_MANILA_CODE = "ncr-metro-manila";

export type PsgcLocation = {
  code: string;
  name: string;
  regionName?: string;
};

async function getLocations(path: string): Promise<PsgcLocation[]> {
  const response = await fetch(`${PSGC_API_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("PSGC location data could not be loaded.");
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("PSGC returned an unexpected location response.");
  }

  return data.filter(
    (item): item is PsgcLocation =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as PsgcLocation).code === "string" &&
      typeof (item as PsgcLocation).name === "string",
  );
}

export const getPsgcRegions = () => getLocations("/regions/");

export const getPsgcProvinces = (regionCode: string) => {
  // NCR has no provinces in PSGC. Treat Metro Manila as its province-level
  // selection so province-dependent forms can continue to cities/municipalities.
  if (regionCode === NCR_REGION_CODE) {
    return Promise.resolve([
      { code: NCR_METRO_MANILA_CODE, name: "Metro Manila" },
    ]);
  }

  return getLocations(`/regions/${encodeURIComponent(regionCode)}/provinces/`);
};

export const getPsgcCitiesMunicipalities = (provinceCode: string) => {
  if (provinceCode === NCR_METRO_MANILA_CODE) {
    return getLocations(
      `/regions/${NCR_REGION_CODE}/cities-municipalities/`,
    );
  }

  return getLocations(
    `/provinces/${encodeURIComponent(provinceCode)}/cities-municipalities/`,
  );
};

export const getPsgcBarangays = (cityMunicipalityCode: string) =>
  getLocations(
    `/cities-municipalities/${encodeURIComponent(cityMunicipalityCode)}/barangays/`,
  );

export const getPsgcRegionLabel = (region: PsgcLocation) => {
  // The membership form has historically saved NCR and CAR by their full
  // administrative names. Keep those existing member records scope-compatible.
  if (
    region.regionName === "National Capital Region" ||
    region.regionName === "Cordillera Administrative Region"
  ) {
    return region.regionName;
  }

  return region.name;
};
