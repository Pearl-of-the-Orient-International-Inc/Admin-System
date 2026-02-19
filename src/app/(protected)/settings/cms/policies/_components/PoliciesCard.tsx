"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconScale } from "@tabler/icons-react";
import { EditIcon } from "lucide-react";
import {
  createInitialPolicyState,
  CATEGORY_LABELS,
  type PolicyItem,
  type PolicyCategory,
} from "./policy-definitions";
import { EditPolicyDialog } from "./EditPolicyDialog";


export const PoliciesCard = () => {
  const [policies, setPolicies] = useState<PolicyItem[]>(createInitialPolicyState);
  const [categoryFilter, setCategoryFilter] = useState<string>("legal");
  const [editingPolicy, setEditingPolicy] = useState<PolicyItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const filtered = useMemo(() => {
    return policies.filter((p) => p.category === categoryFilter);
  }, [policies, categoryFilter]);

  const handleEdit = (policy: PolicyItem) => {
    setEditingPolicy(policy);
    setIsEditOpen(true);
  };

  const handleSave = (id: string, content: string, isPublished: boolean) => {
    setPolicies((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              content,
              isPublished,
              lastUpdated: new Date().toISOString().slice(0, 10),
            }
          : p,
      ),
    );
    setEditingPolicy(null);
    setIsEditOpen(false);
  };

  return (
    <div>
      <p>Platform policies</p>
      <Card className="bg-transparent mt-4">
        <CardContent>
          <div className="flex items-start gap-4 mb-6">
            <div className="size-8 rounded-full bg-accent flex items-center justify-center shrink-0">
              <IconScale className="size-4.5 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm">Legal & policy documents</p>
              <p className="text-xs text-muted-foreground">
                Manage privacy, ministry conduct, worship standards, chaplaincy
                care, and governance policies for your organization.
              </p>
            </div>
          </div>

          <Tabs defaultValue="legal" onValueChange={setCategoryFilter}>
            <TabsList variant="line">
              {(Object.keys(CATEGORY_LABELS) as PolicyCategory[]).map((cat) => (
                <TabsTrigger key={cat} value={cat} className="whitespace-nowrap">
                  {CATEGORY_LABELS[cat]}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={categoryFilter} className="mt-5">
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='p-4'>Policy</TableHead>
                      <TableHead className='p-4'>Category</TableHead>
                      <TableHead className='p-4'>Status</TableHead>
                      <TableHead className='p-4'>Last updated</TableHead>
                      <TableHead className="w-0 p-4 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((policy) => (
                      <TableRow key={policy.id}>
                        <TableCell className='p-4'>
                          <div>
                            <p className="text-sm font-medium">{policy.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {policy.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className='p-4'>
                          <Badge variant="secondary" className="text-xs font-normal">
                            {CATEGORY_LABELS[policy.category]}
                          </Badge>
                        </TableCell>
                        <TableCell className='p-4'>
                          <Badge
                            variant={policy.isPublished ? "success" : "destructive"}
                            className="text-xs"
                          >
                            {policy.isPublished ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell className="p-4 text-muted-foreground">
                          {policy.lastUpdated ?? "-"}
                        </TableCell>
                        <TableCell className="text-right p-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => handleEdit(policy)}
                          >
                            <EditIcon className="size-3.5" />Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <EditPolicyDialog
        policy={editingPolicy}
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setEditingPolicy(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
};

