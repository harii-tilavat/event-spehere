import { useState } from "react";
import { toast } from "sonner";
import type { PaymentListItemDto } from "@eventsphere/shared";
import { useGetPayments, useRefundPayment } from "@/api";

const ALL_FILTER = "all";

export function useAdminPaymentsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>(ALL_FILTER);
  const [refunding, setRefunding] = useState<PaymentListItemDto | null>(null);

  const paymentsQuery = useGetPayments({ page, status: status === ALL_FILTER ? undefined : status });

  const refundPayment = useRefundPayment({
    onSuccess: () => {
      toast.success("Payment refunded — booking marked refunded and tickets voided");
      setRefunding(null);
    },
  });

  return {
    payments: paymentsQuery.data?.rows ?? [],
    meta: paymentsQuery.data?.meta,
    isLoading: paymentsQuery.isPending,
    isError: paymentsQuery.isError,
    error: paymentsQuery.error,
    refetch: paymentsQuery.refetch,
    status,
    allFilter: ALL_FILTER,
    setPage,
    refunding,
    setRefunding,
    isRefunding: refundPayment.isPending,
    handleStatusChange: (value: string) => {
      setStatus(value);
      setPage(1);
    },
    handleRefund: () => refunding && refundPayment.mutate(refunding.id),
  };
}
