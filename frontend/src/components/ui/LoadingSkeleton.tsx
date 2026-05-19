import React from 'react';

type SkVariant = 'text' | 'title' | 'stat' | 'row' | 'card' | 'avatar';

interface LoadingSkeletonProps {
  readonly variant?: SkVariant;
  readonly count?: number;
  readonly width?: string;
  readonly height?: string;
}

export default function LoadingSkeleton({
  variant = 'text',
  count = 1,
  width,
  height,
}: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`skeleton sk-${variant}`}
          style={{ width, height }}
        />
      ))}
    </>
  );
}
