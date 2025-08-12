import React from "react";
import "./HeroWithStats.css";

export function StatCard({ kicker, title, subtext }) {
  return (
    <article className="stat-card" role="group" aria-label={`${kicker} ${title || ""}`.trim()}>
      <div className="stat-card__kicker">{kicker}</div>
      {title && <div className="stat-card__title">{title}</div>}
      {subtext && <p className="stat-card__subtext">{subtext}</p>}
    </article>
  );
}

/**
 * Reusable hero + stats section
 *
 * Props:
 * - heading (string)
 * - highlight (string) – optional highlighted word/phrase
 * - description (string)
 * - ctaText (string), ctaHref (string), onCtaClick (fn) – optional
 * - stats (array of { id, kicker, title?, subtext? })
 * - showDecorativeLine (boolean) – optional, default true
 * - className (string), style (object) – optional
 */
export default function HeroWithStats({
  heading,
  highlight,
  description,
  ctaText,
  ctaHref,
  onCtaClick,
  stats = [],
  showDecorativeLine = true,
  className = "",
  style,
}) {
  const sectionId = "hero-with-stats-heading";

  // split heading to inject highlight
  const renderHeading = () => {
    if (!highlight || !heading?.includes(highlight)) return heading;
    const [before, after] = heading.split(highlight);
    return (
      <>
        {before}
        <span className="hero__highlight">{highlight}</span>
        {after}
      </>
    );
  };

  return (
    <section
      className={`hero ${className}`}
      style={style}
      aria-labelledby={sectionId}
    >
      <div className="hero__inner">
        {/* Left column */}
        <div className="hero__left">
          <h1 id={sectionId} className="hero__heading">
            {renderHeading()}
          </h1>
          {description && <p className="hero__desc">{description}</p>}

          {(ctaText || showDecorativeLine) && (
            <div className="hero__actions">
              {ctaText && (
                <a
                  className="btn btn--outline"
                  href={ctaHref || "#"}
                  onClick={onCtaClick}
                >
                  {ctaText}
                </a>
              )}

              {showDecorativeLine && (
                <svg
                  className="hero__decor"
                  width="160"
                  height="88"
                  viewBox="0 0 160 88"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="44" r="6" />
                  <path d="M12 44 H120 V86" />
                </svg>
              )}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="hero__right">
          <div className="stats-grid">
            {stats.map((s) => (
              <StatCard
                key={s.id || `${s.kicker}-${s.title}`}
                kicker={s.kicker}
                title={s.title}
                subtext={s.subtext}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
