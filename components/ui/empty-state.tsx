import { EmptySparkIcon } from "@/components/ui/icons";

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.25rem] border border-dashed border-slate-300 bg-white/75 p-8 text-center">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-orange-50 text-brand shadow-sm ring-1 ring-orange-100">
        <EmptySparkIcon className="size-6" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
