import { CornerDownRight, Star, Trash2 } from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Textarea, cn } from "@eventsphere/ui";
import { formatDate } from "@/lib/format";
import { useReviewsSection } from "./useReviewsSection";
import type { ReviewsSectionProps } from "./types";

function Stars({ value, onSelect }: { value: number; onSelect?: (v: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!onSelect}
          onClick={() => onSelect?.(i)}
          aria-label={`${i} star${i === 1 ? "" : "s"}`}
          className={onSelect ? "cursor-pointer" : "cursor-default"}
        >
          <Star className={cn("size-4", i <= value ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground")} />
        </button>
      ))}
    </div>
  );
}

export function ReviewsSection({ eventId, organizerId }: ReviewsSectionProps) {
  const {
    reviews,
    summary,
    isLoading,
    canWrite,
    canReply,
    canModerate,
    rating,
    setRating,
    comment,
    setComment,
    replyingTo,
    setReplyingTo,
    replyText,
    setReplyText,
    isPosting,
    isReplying,
    handlePost,
    handleReply,
    handleDelete,
  } = useReviewsSection(eventId, organizerId);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Reviews</CardTitle>
        {summary.count > 0 && (
          <Badge variant="secondary">
            <Star className="size-3 fill-yellow-500 text-yellow-500" /> {summary.average} · {summary.count}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {canWrite && (
          <div className="space-y-2 rounded-lg border p-3">
            <p className="text-sm font-medium">Attended this event? Leave a review</p>
            <Stars value={rating} onSelect={setRating} />
            <Textarea
              placeholder="Share your experience (optional)…"
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button size="sm" disabled={isPosting} onClick={handlePost}>
              {isPosting ? "Posting…" : "Post review"}
            </Button>
            <p className="text-xs text-muted-foreground">Reviews are limited to attendees who checked in.</p>
          </div>
        )}

        {isLoading && <div className="h-16 animate-pulse rounded-lg bg-muted" />}
        {!isLoading && reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet.</p>}

        {reviews.map((r) => (
          <div key={r.id} className="space-y-2 rounded-lg border p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium">{r.attendeeName}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <Stars value={r.rating} />
                  <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                </div>
              </div>
              {canModerate && (
                <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)} aria-label="Delete review">
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              )}
            </div>
            {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}

            {r.organizerReply && (
              <p className="flex items-start gap-2 rounded-md bg-secondary/50 p-2 text-sm text-muted-foreground">
                <CornerDownRight className="mt-0.5 size-4 shrink-0" />
                <span>
                  <span className="font-medium text-foreground">Organizer:</span> {r.organizerReply}
                </span>
              </p>
            )}

            {canReply && !r.organizerReply && (
              <div>
                {replyingTo === r.id ? (
                  <div className="space-y-2">
                    <Textarea rows={2} placeholder="Write a reply…" value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                    <div className="flex gap-2">
                      <Button size="sm" disabled={isReplying} onClick={() => handleReply(r.id)}>
                        {isReplying ? "Posting…" : "Post reply"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setReplyingTo(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => setReplyingTo(r.id)}>
                    <CornerDownRight className="size-4" /> Reply
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
