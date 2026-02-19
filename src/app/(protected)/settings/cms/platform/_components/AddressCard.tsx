"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconMapPin } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { SaveIcon } from "lucide-react";

type AddressCardProps = {
  region: string;
  province: string;
  municipality: string;
  barangay: string;
  zipCode: string;
  address: string;
  onRegionChange: (value: string) => void;
  onProvinceChange: (value: string) => void;
  onMunicipalityChange: (value: string) => void;
  onBarangayChange: (value: string) => void;
  onZipCodeChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  regionOptions: string[];
  provinceOptions: string[];
  municipalityOptions: string[];
  barangayOptions: string[];
};

export const AddressCard = ({
  region,
  province,
  municipality,
  barangay,
  zipCode,
  address,
  onRegionChange,
  onProvinceChange,
  onMunicipalityChange,
  onBarangayChange,
  onZipCodeChange,
  onAddressChange,
  regionOptions,
  provinceOptions,
  municipalityOptions,
  barangayOptions,
}: AddressCardProps) => {
  return (
    <div>
      <p>Address</p>
      <Card className="bg-transparent mt-4">
        <CardContent>
          <div className="flex items-start gap-4 mb-6">
            <div className="size-8 rounded-full bg-accent flex items-center justify-center shrink-0">
              <IconMapPin className="size-4.5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm">Address details</p>
              <p className="text-xs text-muted-foreground mt-1">
                Organization or office address for correspondence and display.
              </p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
              <div>
                <p className="text-sm">Region</p>
                <p className="text-muted-foreground text-xs mb-2 mt-1.5">
                  Philippine region.
                </p>
                <Select
                  value={region || undefined}
                  onValueChange={onRegionChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regionOptions.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm">Province</p>
                <p className="text-muted-foreground text-xs mb-2 mt-1.5">
                  Province or independent city group.
                </p>
                <Select
                  value={province || undefined}
                  onValueChange={onProvinceChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        region ? "Select province" : "Select region first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {provinceOptions.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
              <div>
                <p className="text-sm">Municipality / City</p>
                <p className="text-muted-foreground text-xs mb-2 mt-1.5">
                  City or municipality.
                </p>
                <Select
                  value={municipality || undefined}
                  onValueChange={onMunicipalityChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        province
                          ? "Select municipality"
                          : "Select province first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {municipalityOptions.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm">Barangay</p>
                <p className="text-muted-foreground text-xs mb-2 mt-1.5">
                  Barangay or district.
                </p>
                <Select
                  value={barangay || undefined}
                  onValueChange={onBarangayChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        municipality
                          ? "Select barangay"
                          : "Select municipality first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {barangayOptions.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <p className="text-sm">ZIP code</p>
              <p className="text-muted-foreground text-xs mb-2 mt-1.5">
                Postal code.
              </p>
              <Input
                value={zipCode}
                onChange={(e) => onZipCodeChange(e.target.value)}
                placeholder="e.g. 1300"
              />
            </div>
            <div>
              <p className="text-sm">Street address</p>
              <p className="text-muted-foreground text-xs mb-2 mt-1.5">
                Building, street, and other details.
              </p>
              <Textarea
                value={address}
                onChange={(e) => onAddressChange(e.target.value)}
                placeholder="e.g. 123 Main St, Building A"
                rows={2}
              />
            </div>
          </div>
          <Button className="flex justify-end ml-auto mt-4" size="xs">
            <SaveIcon className="size-3.5" />
            Save changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
