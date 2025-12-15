import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingKantinPage() {
  return (
    <div className="p-5 flex flex-col gap-4">
      <Skeleton className="w-full h-40" />
      <Skeleton className="w-full h-40" />
      <Skeleton className="w-full h-40" />
    </div>
  );
}
