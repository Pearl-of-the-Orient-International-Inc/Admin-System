"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { SaveIcon, Target } from "lucide-react";

type MissionVisionCardProps = {
  mission: string;
  vision: string;
  objectives: string[];
  onMissionChange: (value: string) => void;
  onVisionChange: (value: string) => void;
  onObjectivesChange: (value: string[]) => void;
};

export const MissionVisionCard = ({
  mission,
  vision,
  objectives,
  onMissionChange,
  onVisionChange,
  onObjectivesChange,
}: MissionVisionCardProps) => {
  const handleObjectiveChange = (index: number, value: string) => {
    const nextObjectives = objectives.map((objective, i) =>
      i === index ? value : objective,
    );
    onObjectivesChange(nextObjectives);
  };

  const handleAddObjective = () => {
    onObjectivesChange([...objectives, ""]);
  };

  const handleRemoveObjective = (index: number) => {
    if (objectives.length === 1) {
      onObjectivesChange([""]);
      return;
    }

    onObjectivesChange(objectives.filter((_, i) => i !== index));
  };

  return (
    <div>
      <p>Mission, vision, and objectives</p>
      <Card className="bg-transparent mt-4">
        <CardContent>
          <div className="flex items-start gap-4 mb-6">
            <div className="size-8 rounded-full bg-accent flex items-center justify-center shrink-0">
              <Target className="size-4.5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm">Strategic foundation</p>
              <p className="text-xs text-muted-foreground mt-1">
                Define your mission, long-term vision, and key objectives for
                ministry direction.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm">Mission</p>
              <p className="text-muted-foreground text-xs mb-2 mt-1.5">
                The core purpose of your organization and whom you serve.
              </p>
              <Textarea
                value={mission}
                onChange={(e) => onMissionChange(e.target.value)}
                placeholder="e.g. To Organize a Chaplain Team both here and abroad who are; Professional, able, credible, available, initiative, and intelligent in delivering services to the people in all walks of life in times of their deepest and darkest moments of their needs."
                rows={3}
              />
            </div>

            <div>
              <p className="text-sm">Vision</p>
              <p className="text-muted-foreground text-xs mb-2 mt-1.5">
                The future impact your organization seeks to achieve.
              </p>
              <Textarea
                value={vision}
                onChange={(e) => onVisionChange(e.target.value)}
                placeholder="e.g. Bring national-transformation and nation building though bible-based values education to different sectors of our society."
                rows={3}
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div>
                  <p className="text-sm">Objectives</p>
                  <p className="text-muted-foreground text-xs mt-1.5">
                    Add measurable objectives that support your mission and
                    vision.
                  </p>
                </div>
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  onClick={handleAddObjective}
                >
                  <IconPlus className="size-3.5" />
                  Add objective
                </Button>
              </div>

              <div className="space-y-3 mt-4">
                {objectives.map((objective, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={objective}
                      onChange={(e) =>
                        handleObjectiveChange(index, e.target.value)
                      }
                      placeholder={`Objective ${index + 1}`}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveObjective(index)}
                      aria-label={`Remove objective ${index + 1}`}
                      className="shrink-0"
                    >
                      <IconTrash className="size-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
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
