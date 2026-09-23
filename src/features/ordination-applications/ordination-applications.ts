import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/http-client";

export type OrdinationApplication = {
  id: string; status: string; eligibilityBasis: string; eligibilityMemberType: string;
  ministryBackground: string; callingStatement: string; proposedMinistry: string; additionalInformation: string | null;
  documents: { type: string; fileUrl: string; fileName: string; mimeType?: string }[];
  informationAccurate: boolean; codeOfConductAccepted: boolean; backgroundCheckConsent: boolean;
  requestedInformation: string | null; adminNotes: string | null; submittedAt: string | null; reviewedAt: string | null; decidedAt: string | null; createdAt: string; updatedAt: string;
  member: { id: string; firstName: string; middleInitial: string | null; lastName: string; memberType: string; status: string; isActive: boolean; user: { email: string; avatar: string | null } };
  reviews: { id: string; action: string; notes: string | null; createdAt: string; reviewer: { id: string; name: string; email: string } }[];
};

const getApplications = async () => (await api.get<{ data: OrdinationApplication[] }>("/ordination-applications")).data.data;
const reviewApplication = async ({ id, action, notes }: { id: string; action: string; notes?: string }) => (await api.patch(`/ordination-applications/${id}/review`, { action, notes })).data.data;
export const useOrdinationApplicationsQuery = () => useQuery({ queryKey: ["ordination-applications"], queryFn: getApplications });
export const useReviewOrdinationApplicationMutation = () => { const client = useQueryClient(); return useMutation({ mutationFn: reviewApplication, onSuccess: async () => client.invalidateQueries({ queryKey: ["ordination-applications"] }) }); };
