import React, { forwardRef, useState } from "react";
import "../styles/WidgetBanner.css"; // Ensure it picks up any necessary styles
import { useSelector } from "react-redux";
import { selectIsUserLoggedIn } from "../redux/reducers";

interface WidgetBannerProps {
  id: string;
  onRemove: (id: string) => void;
  onDataSourceChange: (dataSource: "geoJsonData" | "renderedMapData") => void; // Callback for data source change
}

const WidgetBanner = forwardRef<HTMLDivElement, WidgetBannerProps>(
  ({ id, onRemove, onDataSourceChange }, ref) => {
    const isLoggedIn = useSelector(selectIsUserLoggedIn);
    const [menuOpen, setMenuOpen] = useState(false); // State for burger menu

    const handleDataSourceChange = (dataSource: "geoJsonData" | "renderedMapData") => {
      onDataSourceChange(dataSource); // Notify parent component
      setMenuOpen(false); // Close the menu
    };

    return (
      <div className="widget-banner" ref={ref}>
        <div className="widget-banner-drag-handle">
          {/* Dragging happens from here */}
        </div>
        {isLoggedIn && (
          <>
            <div className="flex justify-between items-center w-full">
              <button className="remove-button" onClick={() => onRemove(id)}>
                ×
              </button>
              <button
                className="burger-menu-button bg-transparent shadow-md relative inline-block border-black h-[30px] text-black"
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                <span className="transform -translate-y-[2px]">☰</span>
              </button>
            </div>

            {menuOpen && (
              <div className="burger-menu absolute top-full left-0 ">
                <button
                  className="menu-item"
                  onClick={() => handleDataSourceChange("geoJsonData")}
                >
                  Use Entire Dataset
                </button>
                <button
                  className="menu-item"
                  onClick={() => handleDataSourceChange("renderedMapData")}
                >
                  Use Rendered Map Data
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }
);

export default WidgetBanner;
