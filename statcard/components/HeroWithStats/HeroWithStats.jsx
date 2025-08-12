import React from "react";
import { MapTo, Container } from "@adobe/aem-react-editable-components";
import "./hero-with-stats.css";

const RESOURCE_TYPE = "myproject/components/hero-with-stats";

const hasChildren = (p) =>
  Array.isArray(p?.cqItemsOrder) && p.cqItemsOrder.length > 0;

const editConfig = {
  emptyLabel: "Hero with Stats",
  isEmpty: (props) => !props?.heading && !props?.description && !hasChildren(props),
};

function HeroWithStats(props) {
  const {
    heading,
    highlight,
    description,
    ctaText,
    ctaLink,
    isInEditor,
  } = props;

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

  const empty = editConfig.isEmpty(props);
  if (empty && !isInEditor) return null;

  return (
    <section className={`hero${empty ? " aem-empty" : ""}`} aria-labelledby="hero-title">
      <div className="hero__inner">
        {/* Left column */}
        <div className="hero__left">
          <h1 id="hero-title" className="hero__heading">
            {heading ? renderHeading() : "Editable heading"}
          </h1>
          {description ? <p className="hero__desc">{description}</p> : null}

          {(ctaText || isInEditor) && (
            <div className="hero__actions">
              {ctaText ? (
                <a className="btn btn--outline" href={ctaLink || "#"}>{ctaText}</a>
              ) : (
                isInEditor && <span className="btn btn--outline">CTA</span>
              )}

              {/* decorative elbow line */}
              <svg className="hero__decor" width="160" height="88" viewBox="0 0 160 88" aria-hidden="true">
                <circle cx="12" cy="44" r="6" />
                <path d="M12 44 H120 V86" />
              </svg>
            </div>
          )}
        </div>

        {/* Right column — drop zone for StatCard items */}
        <div className="hero__right">
          <div className="stats-grid">
            <Container {...props} /> {/* renders cqItems / cqItemsOrder */}
          </div>
        </div>
      </div>
    </section>
  );
}

export default MapTo(RESOURCE_TYPE)(HeroWithStats, editConfig);
