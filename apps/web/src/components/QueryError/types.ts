export interface QueryErrorProps {
  error: unknown;
  onRetry: () => void;
}

export interface QueryErrorView {
  message: string;
}
