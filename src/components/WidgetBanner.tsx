import React, { forwardRef } from "react";
import "../WidgetBanner.css"; // Ensure it picks up any necessary styles

interface WidgetBannerProps {
  id: string;
  onRemove: (id: string) => void;
}

const WidgetBanner = forwardRef<HTMLDivElement, WidgetBannerProps>(
  ({ id, onRemove }, ref) => {
    return (
      <div className="widget-banner" ref={ref}>
        <div className="widget-banner-drag-handle">
          {/* Dragging happens from here */}
        </div>
        <button className="remove-button" onClick={() => onRemove(id)}>
          ×
        </button>
      </div>
    );
  }
);

export default WidgetBanner;
