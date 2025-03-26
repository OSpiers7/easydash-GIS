import React from "react";
import "../TopBanner.css";
import UploadGeo from "./GeoJsonUpload";

interface TopBannerProps {
  onAddWidget: () => void;
}

const TopBanner: React.FC<TopBannerProps> = ({ onAddWidget }) => (
  <div className="top-banner">
    <div className="top-banner-content">
      <button onClick={onAddWidget}>New Widget</button>
      <UploadGeo />

    </div>
  </div>
);

export default TopBanner;
