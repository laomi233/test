import React from "react";
import { MapTo } from "@adobe/aem-react-editable-components";
import "./stat-card.css";

const RESOURCE_TYPE = "myproject/components/statcard";

const editConfig = {
  emptyLabel: "Stat Card",
  isEmpty: (props) => !props?.kicker && !props?.title && !props?.subtext,
};

function StatCard({ kicker, title, subtext, isInEditor }) {
  const empty = editConfig.isEmpty({ kicker, title, subtext });
  if (empty && !isInEditor) return null;

  return (
    <article className={`stat-card${empty ? " aem-empty" : ""}`}>
      <div className="stat-card__kicker">{kicker || "Kicker"}</div>
      {title ? <div className="stat-card__title">{title}</div> : null}
      {subtext ? <p className="stat-card__subtext">{subtext}</p> : null}
    </article>
  );
}

export default MapTo(RESOURCE_TYPE)(StatCard, editConfig);
