import React from "react";
import "../TopBanner.css";

interface TopBannerProps {
  onAddWidget: () => void;
}

const TopBanner: React.FC<TopBannerProps> = ({ onAddWidget }) => (
  <div className="top-banner">
    <button onClick={onAddWidget}>New Widget</button>
  </div>
);

export default TopBanner;
