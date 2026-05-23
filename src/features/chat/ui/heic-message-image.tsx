import { useState, useEffect } from "react";

export function HEICMessageImage({
  src,
  alt,
  className,
  onClick,
}: {
  src: string;
  alt?: string;
  className?: string;
  onClick?: () => void;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const cleanSrc = src.split("?")[0] || src;
    const isHeicUrl =
      cleanSrc.toLowerCase().endsWith(".heic") ||
      cleanSrc.toLowerCase().endsWith(".heif");

    if (!isHeicUrl) {
      setImageUrl(src);
      setLoading(false);
      return;
    }

    let active = true;
    let objectUrl: string | null = null;

    const loadAndConvert = async () => {
      try {
        const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(src)}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const blob = await response.blob();

        let heic2anyFn: any;
        if (typeof window !== "undefined") {
          try {
            const module = await Function('return import("heic2any")')();
            heic2anyFn = module.default;
          } catch (e) {
            if (!(window as any).heic2any) {
              await new Promise<void>((resolve, reject) => {
                const script = document.createElement("script");
                script.src =
                  "https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js";
                script.async = true;
                script.onload = () => resolve();
                script.onerror = () =>
                  reject(new Error("Failed to load heic2any from CDN"));
                document.body.appendChild(script);
              });
            }
            heic2anyFn = (window as any).heic2any;
          }
        }

        if (!heic2anyFn) {
          throw new Error("heic2any library is not loaded");
        }

        const converted = await heic2anyFn({
          blob,
          toType: "image/jpeg",
          quality: 0.6,
        });

        if (active) {
          const resultBlob = Array.isArray(converted) ? converted[0] : converted;
          objectUrl = URL.createObjectURL(resultBlob);
          setImageUrl(objectUrl);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to render HEIC attachment:", err);
        if (active) {
          setError(true);
          setLoading(false);
        }
      }
    };

    loadAndConvert();

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center bg-muted animate-pulse rounded-md ${className}`}
      >
        <span className="text-[10px] text-muted-foreground font-medium text-center px-1">
          Loading HEIC...
        </span>
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-destructive/10 text-destructive rounded-md ${className}`}
      >
        <span className="text-[9px] font-medium text-center px-1">
          HEIC Error
        </span>
      </div>
    );
  }

  return <img src={imageUrl} alt={alt} className={className} onClick={onClick} />;
}
