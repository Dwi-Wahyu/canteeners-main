import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="">
      <div className="w-full h-44 bg-black/60"></div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 p-5">
        <Skeleton className="w-full h-52 rounded-xl" />
        <Skeleton className="w-full h-52 rounded-xl" />
        <Skeleton className="w-full h-52 rounded-xl" />
      </div>
    </div>
  );
}
