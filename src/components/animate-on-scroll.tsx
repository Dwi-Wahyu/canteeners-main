"use client";

import { useEffect, useRef, useState } from "react";

type AnimationType =
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "zoom-in"
  | "fade";

interface AnimateOnScrollProps {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: number; // ms
  duration?: number; // ms
  className?: string;
  threshold?: number;
}

const animationStyles: Record<AnimationType, { hidden: string; visible: string }> = {
  "fade-up": {
    hidden: "opacity-0 translate-y-10",
    visible: "opacity-100 translate-y-0",
  },
  "fade-down": {
    hidden: "opacity-0 -translate-y-10",
    visible: "opacity-100 translate-y-0",
  },
  "fade-left": {
    hidden: "opacity-0 translate-x-10",
    visible: "opacity-100 translate-x-0",
  },
  "fade-right": {
    hidden: "opacity-0 -translate-x-10",
    visible: "opacity-100 translate-x-0",
  },
  "zoom-in": {
    hidden: "opacity-0 scale-90",
    visible: "opacity-100 scale-100",
  },
  fade: {
    hidden: "opacity-0",
    visible: "opacity-100",
  },
};

export default function AnimateOnScroll({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 600,
  className = "",
  threshold = 0.15,
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const styles = animationStyles[animation];

  return (
    <div
      ref={ref}
      className={`transition-all ${styles.hidden} ${visible ? styles.visible : ""} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: visible ? `${delay}ms` : "0ms",
        transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      }}
    >
      {children}
    </div>
  );
}
