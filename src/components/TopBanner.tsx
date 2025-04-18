import React from "react";
import "../styles/App.css";
import UploadGeo from "./GeoJsonUpload";

interface TopBannerProps {
  onAddWidget: () => void;
  onSaveDashboard: () => void;
  onBack?: () => void; // Optional back handler
}

const TopBanner: React.FC<TopBannerProps> = ({ onAddWidget, onSaveDashboard, onBack }) => (
  <div className="top-banner">
    <div className="top-banner-content">
    {onBack && (
        <button
          onClick={onBack}
          style={{
            marginRight: "1rem",
            background: "#444",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            padding: "6px 12px",
            cursor: "pointer"
          }}
        >
          ← Home
        </button>
      )}
      <button onClick={onAddWidget}>New Widget</button>
      <button className="save-dashboard" onClick={onSaveDashboard}>Save Dashboard</button>
      <UploadGeo />

    </div>
  </div>
);

export default TopBanner;
