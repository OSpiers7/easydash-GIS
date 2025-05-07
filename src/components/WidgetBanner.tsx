import React, { forwardRef } from "react";
import "../styles/WidgetBanner.css"; // Ensure it picks up any necessary styles
import { useSelector } from "react-redux";
import { selectIsUserLoggedIn } from "../redux/reducers";

interface WidgetBannerProps {
  id: string;
  onRemove: (id: string) => void;
}

const WidgetBanner = forwardRef<HTMLDivElement, WidgetBannerProps>(
  ({ id, onRemove }, ref) => {
    // Check if user is logged in
    const isLoggedIn = useSelector(selectIsUserLoggedIn);
    return (
      <div className="widget-banner" ref={ref}>
        <div className="widget-banner-drag-handle">
          {/* Dragging happens from here */}
        </div>
        {isLoggedIn && (
          <button className="remove-button" onClick={() => onRemove(id)}>
            ×
          </button>
        )}
      </div>
    );
  }
);

export default WidgetBanner;
