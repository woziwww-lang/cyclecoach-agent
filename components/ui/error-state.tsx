import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "Something went wrong",
  description,
  actionLabel,
  onRetry
}: {
  title?: string;
  description: string;
  actionLabel?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="cc-card border-red-200 bg-red-50/70 p-6 text-center">
      <div className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-white text-red-600 shadow-sm">!</div>
      <h3 className="mt-4 text-lg font-semibold text-red-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-red-700">{description}</p>
      {onRetry ? (
        <div className="mt-5">
          <Button tone="secondary" onClick={onRetry}>{actionLabel ?? "Try again"}</Button>
        </div>
      ) : null}
    </div>
  );
}
