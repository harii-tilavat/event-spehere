import { useState } from "react";
import { toast } from "sonner";
import { useCreateReview, useDeleteReview, useGetEventReviews, useReplyReview } from "@/api";
import { useAuth } from "@/context/AuthContext";

export function useReviewsSection(eventId: number, organizerId: number) {
  const { user, status } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  // wait for session bootstrap so isMine reflects the viewer (avoids an unauthenticated first fetch)
  const reviewsQuery = useGetEventReviews(eventId, { enabled: status !== "loading" });

  const createReview = useCreateReview({
    onSuccess: () => {
      toast.success("Review posted — thank you!");
      setComment("");
    },
  });
  const replyReview = useReplyReview({
    onSuccess: () => {
      toast.success("Reply posted");
      setReplyingTo(null);
      setReplyText("");
    },
  });
  const deleteReview = useDeleteReview({
    onSuccess: () => toast.success("Review removed"),
  });

  const reviews = reviewsQuery.data?.reviews ?? [];
  const alreadyReviewed = reviews.some((r) => r.isMine);

  return {
    reviews,
    summary: reviewsQuery.data?.summary ?? { average: 0, count: 0 },
    isLoading: reviewsQuery.isPending,
    canWrite: user?.role === "attendee" && !alreadyReviewed,
    canReply: !!user && (user.id === organizerId || user.role === "super_admin"),
    canModerate: user?.role === "super_admin",
    rating,
    setRating,
    comment,
    setComment,
    replyingTo,
    setReplyingTo,
    replyText,
    setReplyText,
    isPosting: createReview.isPending,
    isReplying: replyReview.isPending,
    handlePost: () => createReview.mutate({ eventId, rating, comment: comment.trim() || null }),
    handleReply: (id: number) => replyText.trim() && replyReview.mutate({ id, reply: replyText.trim() }),
    handleDelete: (id: number) => deleteReview.mutate(id),
  };
}
