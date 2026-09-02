'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface Car360ViewerProps {
  /** Base URL of the folder containing the frame images, trailing slash optional. */
  folder: string;
  /** Filename pattern for a frame, with `{index}` as a placeholder (1-based). */
  filenamePattern: string;
  frameCount: number;
  alt: string;
  isActive?: boolean;
  dragSensitivityPx?: number;
  autoplayFrameIntervalMs?: number;
}

function buildFrameUrl(folder: string, filenamePattern: string, frameIndex: number): string {
  const normalizedFolder = folder.endsWith('/') ? folder : `${folder}/`;
  const filename = filenamePattern.replace('{index}', String(frameIndex + 1));
  return `${normalizedFolder}${encodeURIComponent(filename)}`;
}

export default function Car360Viewer({
  folder,
  filenamePattern,
  frameCount,
  alt,
  isActive = true,
  dragSensitivityPx = 8,
  autoplayFrameIntervalMs = 60,
}: Car360ViewerProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  const [prevIsActive, setPrevIsActive] = useState(isActive);
  if (isActive !== prevIsActive) {
    setPrevIsActive(isActive);
    if (isActive) setHasInteracted(false);
  }

  const isDraggingRef = useRef(false);
  const lastPointerXRef = useRef(0);
  const accumulatedDeltaRef = useRef(0);

  const isReady = loadedCount >= frameCount;
  const isAutoplaying = isReady && !hasInteracted;

  useEffect(() => {
    let cancelled = false;
    let loaded = 0;

    for (let frame = 0; frame < frameCount; frame += 1) {
      const image = new window.Image();
      image.src = buildFrameUrl(folder, filenamePattern, frame);
      image.onload = image.onerror = () => {
        if (cancelled) return;
        loaded += 1;
        setLoadedCount(loaded);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [frameCount, folder, filenamePattern]);

  useEffect(() => {
    if (!isAutoplaying) return;

    const intervalId = window.setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frameCount);
    }, autoplayFrameIntervalMs);

    return () => window.clearInterval(intervalId);
  }, [isAutoplaying, frameCount, autoplayFrameIntervalMs]);

  const stepByPixelDelta = useCallback(
    (deltaX: number) => {
      accumulatedDeltaRef.current += deltaX;
      const framesToStep = Math.trunc(accumulatedDeltaRef.current / dragSensitivityPx);

      if (framesToStep !== 0) {
        setCurrentFrame((prev) => (prev - framesToStep + frameCount) % frameCount);
        accumulatedDeltaRef.current -= framesToStep * dragSensitivityPx;
      }
    },
    [dragSensitivityPx, frameCount]
  );

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    lastPointerXRef.current = event.clientX;
    accumulatedDeltaRef.current = 0;
    setHasInteracted(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current) return;
      const deltaX = event.clientX - lastPointerXRef.current;
      lastPointerXRef.current = event.clientX;
      stepByPixelDelta(deltaX);
    },
    [stepByPixelDelta]
  );

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        setHasInteracted(true);
        setCurrentFrame((prev) => (prev - 1 + frameCount) % frameCount);
      } else if (event.key === 'ArrowRight') {
        setHasInteracted(true);
        setCurrentFrame((prev) => (prev + 1) % frameCount);
      }
    },
    [frameCount]
  );

  return (
    <div
      role="img"
      aria-label={alt}
      aria-busy={!isReady}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      className="relative aspect-[4/3] w-full max-w-5xl mx-auto touch-none select-none cursor-grab outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:cursor-grabbing"
    >
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-neutral-100">
          <span className="text-sm text-neutral-500">
            Loading {loadedCount}/{frameCount}
          </span>
        </div>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element -- frames are swapped on every drag pixel; next/image's optimizer adds per-swap request overhead we can't afford here */}
      <img
        src={buildFrameUrl(folder, filenamePattern, currentFrame)}
        alt={alt}
        draggable={false}
        className={`h-full w-full rounded-lg object-contain transition-opacity duration-150 ${
          isReady ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {isAutoplaying && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-md">
          Click to Interact 360&deg;
        </div>
      )}

      {isReady && hasInteracted && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
          Drag to rotate
        </div>
      )}
    </div>
  );
}
