// features/chat/ui/infinite-scroll-trigger.tsx
import { useEffect, useRef } from "react";
import { Dot, Loader2 } from "lucide-react";

interface InfiniteScrollTriggerProps {
  onIntersect: () => void;
  isLoading: boolean;
  hasMore: boolean;
}

export function InfiniteScrollTrigger({
  onIntersect,
  isLoading,
  hasMore,
}: InfiniteScrollTriggerProps) {
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = triggerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onIntersect();
        }
      },
      {
        // Mulai load lebih awal 200px sebelum elemen terlihat
        rootMargin: "0px 0px 200px 0px",
        threshold: 0,
      },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [onIntersect, hasMore, isLoading]);

  if (!hasMore) {
    return (
      <div className="p-4 flex justify-center">
        <Dot className="text-muted" />
      </div>
    );
  }

  return (
    <div ref={triggerRef} className="p-4 flex justify-center">
      {isLoading && <Loader2 className="size-5 animate-spin text-gray-400" />}
    </div>
  );
}
