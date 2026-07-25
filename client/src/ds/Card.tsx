/**
 * @implements DSS-7 v1 (card / surface & elevation contract)
 *
 * Ported from `design/design-system/steward/preview/post-card.html`. The base
 * surface every stream card and panel is built on: token radius, the
 * three-layer elevation, and a 4:3 org-photo hero slot.
 *
 * The substrate's marketplace card is inverted for a workspace (ADR-0001), but
 * one thing carries over deliberately: the ORG'S OWN PHOTOGRAPHY is the hero
 * (VAL-4). `PhotoSlot` reserves the 4:3 box so a card's layout does not jump
 * when the image loads, and states its absence honestly rather than collapsing.
 */
import type { HTMLAttributes, ReactNode } from "react";

export type CardElevation = "flat" | "ring" | "raised";

const elevations: Record<CardElevation, string> = {
  /** The stream default: hairline separation on the canvas, no shadow. */
  flat: "border border-border shadow-flat",
  /** A focused row or a selected state. */
  ring: "border border-border shadow-ring",
  /** Reserved for the summoned pane and the approve panel (DSS-24/DSS-20). */
  raised: "border border-border shadow-raised",
};

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, "className"> {
  elevation?: CardElevation;
  /**
   * Render as `<article>` — the default, and what XH-12 requires of a stream
   * card ("each card a focusable article"). Set false for a plain panel.
   */
  asArticle?: boolean;
  children: ReactNode;
}

/** The base card surface (DSS-7). */
export function Card({ elevation = "flat", asArticle = true, children, ...rest }: CardProps) {
  const Tag = asArticle ? "article" : "div";
  return (
    <Tag
      className={`flex flex-col gap-3 rounded-md bg-surface p-4 ${elevations[elevation]}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export interface PhotoSlotProps {
  src?: string | undefined;
  /**
   * What the photo shows. Required when `src` is set — an org photo is content,
   * and content without a text alternative fails DS-4.
   */
  alt?: string;
  /** Shown in place of the image when there is none (GENS-4 awaiting-picture). */
  emptyLabel?: string;
}

/**
 * The 4:3 org-photo hero (DSS-7). Always reserves its box: a card that reflows
 * when the image arrives makes the stream feel like a moving feed, which XH-12
 * explicitly rejects.
 */
export function PhotoSlot({ src, alt, emptyLabel = "No photo yet" }: PhotoSlotProps) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={emptyLabel}
        className="flex aspect-[4/3] w-full items-center justify-center rounded-md bg-surface-warm font-body text-sm text-meta"
      >
        {emptyLabel}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt ?? ""}
      className="aspect-[4/3] w-full rounded-md object-cover"
      loading="lazy"
    />
  );
}
