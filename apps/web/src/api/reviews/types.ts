import type { ApiSuccess, ReviewCreateInput, ReviewDto, ReviewSummaryDto } from "@eventsphere/shared";

export type { ReviewCreateInput, ReviewDto, ReviewSummaryDto };

export type ReviewsResponse = ApiSuccess<{ reviews: ReviewDto[]; summary: ReviewSummaryDto }>;
export type ReviewResponse = ApiSuccess<{ review: ReviewDto }>;

export interface CreateReviewVariables extends ReviewCreateInput {
  eventId: number;
}

export interface ReplyReviewVariables {
  id: number;
  reply: string;
}
