import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  useCreateBooking,
  useGetEvent,
  useMockCheckout,
  useVerifyPayment,
  type BookingDto,
} from "@/api";
import { useCountdown } from "@/hooks/useCountdown";
import type { ActiveCheckout, CheckoutStep, RazorpayOptions } from "./types";

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load the Razorpay checkout"));
    document.body.appendChild(script);
  });
}

export function useBookingCheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const eventQuery = useGetEvent(slug);
  const event = eventQuery.data;

  const [step, setStep] = useState<CheckoutStep>("select");
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [active, setActive] = useState<ActiveCheckout | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingDto | null>(null);

  const onSaleTickets = useMemo(() => (event?.ticketTypes ?? []).filter((t) => t.isOnSale), [event]);

  const totalPaise = useMemo(
    () => onSaleTickets.reduce((sum, t) => sum + (quantities[t.id] ?? 0) * t.pricePaise, 0),
    [onSaleTickets, quantities],
  );
  const totalQuantity = useMemo(() => Object.values(quantities).reduce((a, b) => a + b, 0), [quantities]);

  const secondsLeft = useCountdown(active?.booking.expiresAt);
  const isHoldExpired = !!active && secondsLeft === 0;

  // delta-based functional update — immune to stale closures on rapid clicks
  const adjustQuantity = (ticketTypeId: number, delta: number, max: number) => {
    setQuantities((prev) => ({
      ...prev,
      [ticketTypeId]: Math.max(0, Math.min((prev[ticketTypeId] ?? 0) + delta, max)),
    }));
  };

  const createBooking = useCreateBooking({
    onSuccess: (result) => {
      setActive(result);
      setStep("pay");
    },
  });

  const verifyPayment = useVerifyPayment({
    onSuccess: (booking) => {
      setConfirmedBooking(booking);
      setStep("done");
      toast.success("Payment verified — booking confirmed!");
    },
  });

  const mockCheckout = useMockCheckout({
    onSuccess: (result) => {
      if ("declined" in result) {
        toast.error("Payment declined — you can try again while the hold lasts");
        return;
      }
      if (!active) return;
      verifyPayment.mutate({
        razorpayOrderId: active.checkout.orderId,
        razorpayPaymentId: result.razorpayPaymentId,
        razorpaySignature: result.razorpaySignature,
      });
    },
  });

  const handleProceed = () => {
    if (!event || totalQuantity === 0) return;
    const items = onSaleTickets
      .filter((t) => (quantities[t.id] ?? 0) > 0)
      .map((t) => ({ ticketTypeId: t.id, quantity: quantities[t.id] }));
    createBooking.mutate({ eventId: event.id, items });
  };

  const handleMockPay = (outcome: "success" | "failure") => {
    if (!active) return;
    mockCheckout.mutate({ orderId: active.checkout.orderId, outcome });
  };

  const handleRazorpayPay = async () => {
    if (!active || !event) return;
    try {
      await loadRazorpayScript();
      const options: RazorpayOptions = {
        key: active.checkout.keyId,
        amount: active.checkout.amountPaise,
        currency: active.checkout.currency,
        name: "EventSphere",
        description: event.title,
        order_id: active.checkout.orderId,
        handler: (response) =>
          verifyPayment.mutate({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          }),
        theme: { color: "#18181b" },
      };
      new window.Razorpay!(options).open();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not open checkout");
    }
  };

  const handleStartOver = () => {
    setActive(null);
    setStep("select");
  };

  return {
    event,
    isLoadingEvent: eventQuery.isPending,
    isEventError: eventQuery.isError,
    eventError: eventQuery.error,
    refetchEvent: eventQuery.refetch,
    step,
    onSaleTickets,
    quantities,
    totalPaise,
    totalQuantity,
    active,
    confirmedBooking,
    secondsLeft,
    isHoldExpired,
    isCreating: createBooking.isPending,
    isPaying: mockCheckout.isPending || verifyPayment.isPending,
    adjustQuantity,
    handleProceed,
    handleMockPay,
    handleRazorpayPay,
    handleStartOver,
    goToBooking: () => confirmedBooking && navigate(`/account/bookings/${confirmedBooking.id}`),
  };
}
