"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { IconBuildingStore } from "@tabler/icons-react";
import { SaveIcon } from "lucide-react";
import Image from "next/image";

type CompanyInfoCardProps = {
  companyName: string;
  companyEmail: string;
  companyNumber: string;
  tagline: string;
  onCompanyNameChange: (value: string) => void;
  onCompanyEmailChange: (value: string) => void;
  onCompanyNumberChange: (value: string) => void;
  onTaglineChange: (value: string) => void;
};

export const CompanyInfoCard = ({
  companyName,
  companyEmail,
  companyNumber,
  tagline,
  onCompanyNameChange,
  onCompanyEmailChange,
  onCompanyNumberChange,
  onTaglineChange,
}: CompanyInfoCardProps) => {
  return (
    <div>
      <p>Organization information</p>
      <Card className="bg-transparent mt-4">
        <CardContent>
          <div className="flex items-start gap-4 mb-6">
            <div className="size-8 rounded-full bg-accent flex items-center justify-center shrink-0">
              <IconBuildingStore className="size-4.5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm">General details</p>
              <p className="text-xs text-muted-foreground mt-1">
                Basic organization details shown to users and in communications.
              </p>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-sm">Organization name</p>
              <p className="text-muted-foreground text-xs mb-2 mt-1.5">
                Your business or platform name.
              </p>
              <Input
                value={companyName}
                onChange={(e) => onCompanyNameChange(e.target.value)}
                placeholder="e.g. Pearl of the Orient International Auxiliary Chaplain Values Educators Inc."
              />
            </div>
            <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
              <div>
                <p className="text-sm">Organization email</p>
                <p className="text-muted-foreground text-xs mb-2 mt-1.5">
                  Contact email for support and notifications.
                </p>
                <Input
                  type="email"
                  value={companyEmail}
                  onChange={(e) => onCompanyEmailChange(e.target.value)}
                  placeholder="e.g. poile@gmail.com"
                />
              </div>
              <div>
                <p className="text-sm">Organization number</p>
                <p className="text-muted-foreground text-xs mb-2 mt-1.5">
                  Phone number for contact and support.
                </p>
                <div className="flex gap-2">
                  <Select disabled defaultValue="ph">
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ph">
                        <Image
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Flag_of_the_Philippines.svg/1920px-Flag_of_the_Philippines.svg.png"
                          alt="PH"
                          width={20}
                          height={20}
                          className="mr-1"
                        />
                        +63
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="tel"
                    className="flex-1"
                    value={companyNumber}
                    onChange={(e) => onCompanyNumberChange(e.target.value)}
                    placeholder="912 345 6789"
                  />
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm">Tagline</p>
              <p className="text-muted-foreground text-xs mb-2 mt-1.5">
                Short phrase or slogan for your organization.
              </p>
              <Textarea
                value={tagline}
                onChange={(e) => onTaglineChange(e.target.value)}
                placeholder="e.g. The best way to find yourself is to lose in the service of others"
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
