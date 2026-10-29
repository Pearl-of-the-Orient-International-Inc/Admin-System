"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LockKeyhole, Pencil, Plus, RefreshCw, Trophy } from "lucide-react";
import { api, toApiError } from "@/lib/http-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";

type Criterion = {
  key: string;
  label: string;
  description: string | null;
  points: number;
  isActive: boolean;
  monthlyCap: number | null;
};

type NewCriterion = {
  key: string;
  label: string;
  description: string;
  points: string;
  monthlyCap: string;
};

const emptyCriterion: NewCriterion = {
  key: "",
  label: "",
  description: "",
  points: "",
  monthlyCap: "",
};

type Ranking = {
  rank: number;
  name: string;
  memberNumber: string | null;
  points: number;
  milestones: number;
};

const currentPeriod = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
  })
    .format(new Date())
    .slice(0, 7);

export default function ReferralRecognitionPage() {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [period, setPeriod] = useState(currentPeriod);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [isLocking, setIsLocking] = useState(false);
  const [newCriterion, setNewCriterion] = useState<NewCriterion>(emptyCriterion);
  const [isCreating, setIsCreating] = useState(false);
  const [isCriterionSheetOpen, setIsCriterionSheetOpen] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState<Criterion | null>(null);

  const periodLabel = useMemo(() => {
    const [year, month] = period.split("-").map(Number);
    return Number.isFinite(year) && Number.isFinite(month)
      ? new Intl.DateTimeFormat("en-PH", {
          month: "long",
          year: "numeric",
        }).format(new Date(year, month - 1, 1))
      : period;
  }, [period]);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const [criteriaResponse, honorRollResponse] = await Promise.all([
        api.get<{ data: Criterion[] }>("/members/referral-criteria"),
        api.get<{ data: { rankings: Ranking[] } }>("/members/honor-roll", {
          params: { period },
        }),
      ]);
      setCriteria(criteriaResponse.data.data);
      setRankings(honorRollResponse.data.data.rankings);
    } catch (error) {
      const apiError = toApiError(error);
      toast({
        title: "Referral settings unavailable",
        description:
          apiError.message ?? "Could not load the referral settings.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveCriterion = async (criterion: Criterion) => {
    try {
      setIsSaving(criterion.key);
      const { data } = await api.put<{ data: Criterion }>(
        `/members/referral-criteria/${encodeURIComponent(criterion.key)}`,
        {
          points: criterion.points,
          isActive: criterion.isActive,
          monthlyCap: criterion.monthlyCap,
        },
      );
      setCriteria((items) =>
        items.map((item) => (item.key === criterion.key ? data.data : item)),
      );
      toast({
        title: "Referral rule saved",
        description: `${criterion.label} now awards ${data.data.points} point${data.data.points === 1 ? "" : "s"}.`,
        variant: "success",
      });
    } catch (error) {
      const apiError = toApiError(error);
      toast({
        title: "Referral rule not saved",
        description: apiError.message ?? "Unable to save this referral rule.",
        variant: "error",
      });
    } finally {
      setIsSaving(null);
    }
  };

  const createCriterion = async () => {
    try {
      setIsCreating(true);
      const { data } = await api.post<{ data: Criterion }>(
        "/members/referral-criteria",
        {
          key: newCriterion.key || undefined,
          label: newCriterion.label,
          description: newCriterion.description,
          points: Number(newCriterion.points),
          monthlyCap:
            newCriterion.monthlyCap === ""
              ? null
              : Number(newCriterion.monthlyCap),
        },
      );
      setCriteria((items) => [...items, data.data]);
      setNewCriterion(emptyCriterion);
      setEditingCriterion(null);
      setIsCriterionSheetOpen(false);
      toast({
        title: "Criterion created",
        description:
          "The rule is inactive until its verified milestone is connected.",
        variant: "success",
      });
    } catch (error) {
      const apiError = toApiError(error);
      toast({
        title: "Criterion not created",
        description:
          apiError.message ?? "Check the title, key, and point value.",
        variant: "error",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const updateCriterionDetails = async () => {
    if (!editingCriterion) return;

    try {
      setIsCreating(true);
      const { data } = await api.put<{ data: Criterion }>(
        `/members/referral-criteria/${encodeURIComponent(editingCriterion.key)}`,
        {
          label: newCriterion.label,
          description: newCriterion.description,
        },
      );
      setCriteria((items) =>
        items.map((item) =>
          item.key === editingCriterion.key ? data.data : item,
        ),
      );
      setEditingCriterion(null);
      setNewCriterion(emptyCriterion);
      setIsCriterionSheetOpen(false);
      toast({ title: "Criterion details saved", variant: "success" });
    } catch (error) {
      const apiError = toApiError(error);
      toast({
        title: "Criterion details not saved",
        description: apiError.message ?? "Unable to update this criterion.",
        variant: "error",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const openCreateCriterion = () => {
    setEditingCriterion(null);
    setNewCriterion(emptyCriterion);
    setIsCriterionSheetOpen(true);
  };

  const openEditCriterion = (criterion: Criterion) => {
    setEditingCriterion(criterion);
    setNewCriterion({
      key: criterion.key,
      label: criterion.label,
      description: criterion.description ?? "",
      points: String(criterion.points),
      monthlyCap: criterion.monthlyCap === null ? "" : String(criterion.monthlyCap),
    });
    setIsCriterionSheetOpen(true);
  };

  const lockPeriod = async () => {
    try {
      setIsLocking(true);
      await api.post(`/members/honor-roll/${encodeURIComponent(period)}/lock`);
      toast({
        title: "Honor Roll locked",
        description: `${periodLabel} has been snapshotted. Certificate issuance remains a separate workflow.`,
        variant: "success",
      });
      await load();
    } catch (error) {
      const apiError = toApiError(error);
      toast({
        title: "Honor Roll was not locked",
        description: apiError.message ?? "Unable to lock this period.",
        variant: "error",
      });
    } finally {
      setIsLocking(false);
    }
  };

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-medium text-green-700">
            Membership Builders
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            Referral & Recognition
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Configure points for verified member referrals and review the public
            monthly Top 3.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void load()}
          disabled={isLoading}
        >
          <RefreshCw className="size-4" /> Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="size-5 text-amber-600" />
            Referral point rules
          </CardTitle>
          <CardDescription>
            Set the points, optional monthly limit, and active status for each
            verified referral milestone.
          </CardDescription>
          <CardAction>
            <Button type="button" onClick={openCreateCriterion}>
              <Plus className="size-4" /> Add criterion
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="px-4">Criterion</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Monthly cap</TableHead>
                  <TableHead className="px-4 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
            {criteria.map((criterion) => (
              <TableRow key={criterion.key}>
                <TableCell className="px-4 whitespace-normal">
                  <p className="font-medium">{criterion.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {criterion.description}
                  </p>
                  <Badge
                    variant="outline"
                    className="mt-2 font-mono text-[11px]"
                  >
                    {criterion.key}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                  <Checkbox
                    id={`criterion-${criterion.key}`}
                    checked={criterion.isActive}
                    onCheckedChange={(checked) =>
                      setCriteria((items) =>
                        items.map((item) =>
                          item.key === criterion.key
                            ? { ...item, isActive: checked === true }
                            : item,
                        ),
                      )
                    }
                  />
                    <Label htmlFor={`criterion-${criterion.key}`} className="sr-only">Active</Label>
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    id={`points-${criterion.key}`}
                    type="number"
                    min="0"
                    step="1"
                    value={criterion.points}
                    onChange={(event) =>
                      setCriteria((items) =>
                        items.map((item) =>
                          item.key === criterion.key
                            ? {
                                ...item,
                                points: Math.max(
                                  0,
                                  Number(event.target.value) || 0,
                                ),
                              }
                            : item,
                        ),
                      )
                    }
                    className="w-20"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    id={`cap-${criterion.key}`}
                    type="number"
                    min="0"
                    step="1"
                    placeholder="No limit"
                    value={criterion.monthlyCap ?? ""}
                    onChange={(event) =>
                      setCriteria((items) =>
                        items.map((item) =>
                          item.key === criterion.key
                            ? {
                                ...item,
                                monthlyCap:
                                  event.target.value === ""
                                    ? null
                                    : Math.max(
                                        0,
                                        Number(event.target.value) || 0,
                                      ),
                              }
                            : item,
                        ),
                      )
                    }
                    className="w-24"
                  />
                </TableCell>
                <TableCell className="px-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => openEditCriterion(criterion)}><Pencil className="size-3.5" /> Edit details</Button>
                    <Button
                      size="sm"
                      onClick={() => void saveCriterion(criterion)}
                      disabled={isSaving === criterion.key}
                    >
                      {isSaving === criterion.key ? "Saving…" : "Save rule"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={isCriterionSheetOpen} onOpenChange={setIsCriterionSheetOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto max-w-lg!">
          <SheetHeader>
            <SheetTitle>{editingCriterion ? "Edit referral criterion" : "Add referral criterion"}</SheetTitle>
            <SheetDescription>
              {editingCriterion
                ? "Update the public-facing title and description. The rule key cannot change after creation."
                : "Create the rule first. It remains inactive until we connect it to a verified event in the relevant module."}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-5 px-4 pb-4">
            <div className="space-y-2">
              <Label htmlFor="new-criterion-label">Criterion title</Label>
              <Input id="new-criterion-label" value={newCriterion.label} onChange={(event) => setNewCriterion((current) => ({ ...current, label: event.target.value }))} placeholder="Orientation attended" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-criterion-key">Rule key <span className="font-normal text-muted-foreground">(optional)</span></Label>
              <Input id="new-criterion-key" value={newCriterion.key} onChange={(event) => setNewCriterion((current) => ({ ...current, key: event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "") }))} placeholder="ORIENTATION_ATTENDED" disabled={Boolean(editingCriterion)} />
            </div>
            {!editingCriterion && <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="new-criterion-points">Points</Label><Input id="new-criterion-points" type="number" min="0" step="1" value={newCriterion.points} onChange={(event) => setNewCriterion((current) => ({ ...current, points: event.target.value }))} placeholder="15" /></div>
              <div className="space-y-2"><Label htmlFor="new-criterion-cap">Monthly cap <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="new-criterion-cap" type="number" min="0" step="1" value={newCriterion.monthlyCap} onChange={(event) => setNewCriterion((current) => ({ ...current, monthlyCap: event.target.value }))} placeholder="No limit" /></div>
            </div>}
            <div className="space-y-2"><Label htmlFor="new-criterion-description">Description <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="new-criterion-description" value={newCriterion.description} onChange={(event) => setNewCriterion((current) => ({ ...current, description: event.target.value }))} placeholder="The referred member is checked in at orientation." /></div>
          </div>
          <SheetFooter className="mt-auto border-t sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => { setIsCriterionSheetOpen(false); setEditingCriterion(null); }}>Cancel</Button>
            <Button type="button" onClick={() => void (editingCriterion ? updateCriterionDetails() : createCriterion())} disabled={isCreating || !newCriterion.label.trim() || (!editingCriterion && newCriterion.points === "")}><Pencil className="size-4" />{isCreating ? "Saving…" : editingCriterion ? "Save details" : "Create criterion"}</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>Monthly Honor Roll</CardTitle>
            <CardDescription className="mt-1">
              Review the provisional Top 3, then lock the month after resolving
              any ties.
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="honor-roll-period">Period</Label>
            <Input
              id="honor-roll-period"
              type="month"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="px-4">Rank</TableHead>
                  <TableHead className="px-4">Member</TableHead>
                  <TableHead className="px-4 text-right">Points</TableHead>
                  <TableHead className="px-4 text-right">Milestones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankings.length ? (
                  rankings.map((entry) => (
                    <TableRow
                      key={`${entry.rank}-${entry.memberNumber ?? entry.name}`}
                    >
                      <TableCell className="px-4">#{entry.rank}</TableCell>
                      <TableCell className="px-4">
                        <p className="font-medium">{entry.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.memberNumber ?? "No member number"}
                        </p>
                      </TableCell>
                      <TableCell className="px-4 text-right font-semibold">
                        {entry.points}
                      </TableCell>
                      <TableCell className="px-4 text-right">
                        {entry.milestones}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No earned referral points for this period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-950">
            <p>
              Locking saves the current Top 3 snapshot. Recognition certificate
              issuance is intentionally outside this screen.
            </p>
            <Button
              onClick={() => void lockPeriod()}
              disabled={isLocking || !rankings.length}
            >
              <LockKeyhole className="size-4" />
              {isLocking ? "Locking…" : `Lock ${periodLabel}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
