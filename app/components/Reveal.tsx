"use client";

import { useEffect, useRef, useState } from "react";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: 0 | 1 | 2 | 3;
};

export default function Reveal({
  children,
  className = "",
  delay = 0,
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.16 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const delayClass =
    delay === 1
      ? "reveal-delay-1"
      : delay === 2
      ? "reveal-delay-2"
      : delay === 3
      ? "reveal-delay-3"
      : "";

  return (
    <div
      ref={ref}
      className={`reveal-up ${visible ? "is-visible" : ""} ${delayClass} ${className}`}
    >
      {children}
    </div>
  );
}