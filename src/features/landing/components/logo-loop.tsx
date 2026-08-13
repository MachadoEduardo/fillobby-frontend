import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type Key,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/** Faixa animada de plataformas usada na apresentação da landing page. */
export type LogoItem =
  | {
      node: ReactNode;
      title?: string;
      ariaLabel?: string;
      href?: string;
    }
  | {
      src: string;
      alt: string;
      title?: string;
      href?: string;
      width?: number;
      height?: number;
    };

export interface LogoLoopProps {
  logos: LogoItem[];
  speed?: number;
  direction?: "left" | "right" | "up" | "down";
  width?: number | string;
  logoHeight?: number;
  gap?: number;
  hoverSpeed?: number;
  fadeOut?: boolean;
  fadeOutColor?: string;
  scaleOnHover?: boolean;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

const MIN_COPIES = 2;
const COPY_HEADROOM = 2;

function toCssLength(value: number | string | undefined) {
  return typeof value === "number" ? `${value}px` : value;
}

function isNodeLogo(
  item: LogoItem,
): item is Extract<LogoItem, { node: ReactNode }> {
  return "node" in item;
}

export const LogoLoop = memo(function LogoLoop({
  logos,
  speed = 72,
  direction = "left",
  width = "100%",
  logoHeight = 28,
  gap = 40,
  hoverSpeed = 0,
  fadeOut = false,
  fadeOutColor,
  scaleOnHover = false,
  ariaLabel = "Plataformas disponíveis",
  className,
  style,
}: LogoLoopProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const sequenceRef = useRef<HTMLUListElement>(null);
  const offsetRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const timestampRef = useRef<number | null>(null);
  const velocityRef = useRef(0);
  const [sequenceSize, setSequenceSize] = useState(0);
  const [copyCount, setCopyCount] = useState(MIN_COPIES);
  const [isHovered, setIsHovered] = useState(false);

  const isVertical = direction === "up" || direction === "down";
  const velocity = useMemo(() => {
    const magnitude = Math.abs(speed);
    const directionMultiplier = isVertical
      ? direction === "up"
        ? 1
        : -1
      : direction === "left"
        ? 1
        : -1;
    return magnitude * directionMultiplier * (speed < 0 ? -1 : 1);
  }, [direction, isVertical, speed]);

  const measure = useCallback(() => {
    const container = containerRef.current;
    const sequence = sequenceRef.current;
    if (!container || !sequence) return;

    const rect = sequence.getBoundingClientRect();
    const nextSize = isVertical ? rect.height : rect.width;
    const viewport = isVertical
      ? container.clientHeight
      : container.clientWidth;
    if (nextSize <= 0 || viewport <= 0) return;

    setSequenceSize(Math.ceil(nextSize));
    setCopyCount(
      Math.max(MIN_COPIES, Math.ceil(viewport / nextSize) + COPY_HEADROOM),
    );
  }, [isVertical]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    measure();
    return () => observer.disconnect();
  }, [measure]);

  useEffect(() => {
    measure();
  }, [gap, logoHeight, logos, measure]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || sequenceSize <= 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      track.style.transform = "translate3d(0, 0, 0)";
      return;
    }

    const animate = (timestamp: number) => {
      const previousTimestamp = timestampRef.current ?? timestamp;
      const elapsed = Math.max(0, timestamp - previousTimestamp) / 1000;
      timestampRef.current = timestamp;
      const targetVelocity = isHovered ? hoverSpeed : velocity;
      const smoothing = 1 - Math.exp(-elapsed / 0.25);
      velocityRef.current += (targetVelocity - velocityRef.current) * smoothing;
      offsetRef.current =
        (((offsetRef.current + velocityRef.current * elapsed) % sequenceSize) +
          sequenceSize) %
        sequenceSize;

      track.style.transform = isVertical
        ? `translate3d(0, ${-offsetRef.current}px, 0)`
        : `translate3d(${-offsetRef.current}px, 0, 0)`;
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      timestampRef.current = null;
    };
  }, [hoverSpeed, isHovered, isVertical, sequenceSize, velocity]);

  const renderLogo = useCallback(
    (item: LogoItem, key: Key) => {
      const content = isNodeLogo(item) ? (
        <span
          className={cn(
            "inline-flex items-center text-[length:var(--logo-loop-height)] leading-none",
            scaleOnHover &&
              "transition-transform duration-200 group-hover/logo-loop-item:scale-105",
          )}
          aria-hidden={!item.ariaLabel}
        >
          {item.node}
        </span>
      ) : (
        <img
          className={cn(
            "h-[var(--logo-loop-height)] w-auto object-contain",
            scaleOnHover &&
              "transition-transform duration-200 group-hover/logo-loop-item:scale-105",
          )}
          src={item.src}
          alt={item.alt}
          width={item.width}
          height={item.height}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      );
      const label = isNodeLogo(item)
        ? (item.ariaLabel ?? item.title)
        : item.alt;

      return (
        <li
          key={key}
          className={cn(
            "group/logo-loop-item flex-none",
            isVertical
              ? "mb-[var(--logo-loop-gap)]"
              : "mr-[var(--logo-loop-gap)]",
          )}
        >
          {item.href ? (
            <a
              href={item.href}
              aria-label={label}
              title={item.title}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
            >
              {content}
            </a>
          ) : (
            <span aria-label={label} title={item.title}>
              {content}
            </span>
          )}
        </li>
      );
    },
    [isVertical, scaleOnHover],
  );

  const copies = useMemo(
    () =>
      Array.from({ length: copyCount }, (_, copyIndex) => (
        <ul
          key={copyIndex}
          ref={copyIndex === 0 ? sequenceRef : undefined}
          aria-hidden={copyIndex > 0}
          className={cn("flex items-center", isVertical && "flex-col")}
        >
          {logos.map((logo, logoIndex) =>
            renderLogo(logo, `${copyIndex}-${logoIndex}`),
          )}
        </ul>
      )),
    [copyCount, isVertical, logos, renderLogo],
  );

  const fadeColor = fadeOutColor ?? "#0F1C21";
  const containerStyle = {
    width: toCssLength(width) ?? "100%",
    "--logo-loop-gap": `${gap}px`,
    "--logo-loop-height": `${logoHeight}px`,
    ...style,
  } as CSSProperties;

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={ariaLabel}
      className={cn(
        "relative overflow-hidden",
        isVertical && "h-full",
        className,
      )}
      style={containerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {fadeOut && (
        <>
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute z-10",
              isVertical ? "inset-x-0 top-0 h-8" : "inset-y-0 left-0 w-12",
            )}
            style={{
              background: isVertical
                ? `linear-gradient(to bottom, ${fadeColor}, transparent)`
                : `linear-gradient(to right, ${fadeColor}, transparent)`,
            }}
          />
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute z-10",
              isVertical ? "inset-x-0 bottom-0 h-8" : "inset-y-0 right-0 w-12",
            )}
            style={{
              background: isVertical
                ? `linear-gradient(to top, ${fadeColor}, transparent)`
                : `linear-gradient(to left, ${fadeColor}, transparent)`,
            }}
          />
        </>
      )}
      <div
        ref={trackRef}
        className={cn(
          "relative flex w-max will-change-transform motion-reduce:transform-none",
          isVertical && "flex-col",
        )}
      >
        {copies}
      </div>
    </div>
  );
});
