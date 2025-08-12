import React from "react";
import HeroWithStats from "./HeroWithStats";

export default function App() {
  const stats = [
    {
      id: "s1",
      kicker: "1st",
      title: "Batch of HK equity ESG MPF products",
      subtext: "",
    },
    {
      id: "s2",
      kicker: "1st",
      title: "ESG ETF via Stock Connect",
      subtext: "",
    },
    {
      id: "s3",
      kicker: "29",
      title: "Sustainability indexes",
      subtext: "with diverse investment strategies",
    },
    {
      id: "s4",
      kicker: "10+ Years",
      title: "",
      subtext:
        "in leading Hong Kong and A-shares market ESG indexes",
    },
  ];

  return (
    <HeroWithStats
      heading="A major provider of sustainability indexes in Asia"
      highlight="A major provider"
      description="We provide investors with index investment solutions that cater for various sustainability-themed investment strategies, as well as tailor-made index solutions based on clients’ needs for own benchmarking or product structuring purposes"
      ctaText="Download Brochure"
      ctaHref="#"
      stats={stats}
      showDecorativeLine
    />
  );
}
