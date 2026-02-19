import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { IconPhotoPlus } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";

export const ProfileCard = () => {
  return (
    <div>
      <p>Your profile</p>
      <Card className="bg-transparent mt-4">
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="size-13">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-sm">Profile Picture</h3>
                <p className="text-muted-foreground text-xs">
                  Use a photo or image that is 132px square or larger.
                </p>
              </div>
            </div>
            <Button size="xs" variant="outline">
              <IconPhotoPlus className="size-3.5" />
              Upload a new photo
            </Button>
          </div>
          <div className="mt-7">
            <p className="text-sm">Full name</p>
            <p className="text-muted-foreground text-xs mb-2 mt-1.5">
              Use your full name, preferred name, or a nickname…
            </p>
            <Input value="Kyle Andre Lim" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
