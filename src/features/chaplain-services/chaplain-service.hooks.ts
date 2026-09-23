import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as serviceApi from "./chaplain-service.api";

const listKey = ["chaplain-services", "list"];
const bookingListKey = ["chaplain-services", "bookings"];

export const useChaplainServicesQuery = () =>
  useQuery({ queryKey: listKey, queryFn: serviceApi.getChaplainServices, staleTime: 30_000 });

const useServiceMutation = <TVariables>(mutationFn: (values: TVariables) => Promise<unknown>, feature: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: listKey }); },
    meta: { feature },
  });
};

export const useCreateChaplainServiceMutation = () => useServiceMutation(serviceApi.createChaplainService, "chaplain-services.create");
export const useUpdateChaplainServiceMutation = () => useServiceMutation(serviceApi.updateChaplainService, "chaplain-services.update");

export const useChaplainServiceBookingsQuery = () =>
  useQuery({
    queryKey: bookingListKey,
    queryFn: serviceApi.getChaplainServiceBookings,
    staleTime: 15_000,
  });

export const useUpdateChaplainServiceBookingStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: serviceApi.updateChaplainServiceBookingStatus,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bookingListKey });
    },
    meta: { feature: "chaplain-service-bookings.update-status" },
  });
};

export const useUpdateChaplainServiceBookingFinancialsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: serviceApi.updateChaplainServiceBookingFinancials,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bookingListKey });
    },
    meta: { feature: "chaplain-service-bookings.update-financials" },
  });
};
