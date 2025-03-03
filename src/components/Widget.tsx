import React, { useEffect, useRef, useState } from "react";
import "../App.css";
import { Coord } from "../Utils";
import { Rnd } from "react-rnd";
import WidgetBanner from "./WidgetBanner";
import GeoJSONUpload from "./GeoJsonUpload";
import Table from "./Table";
import GeoJSONChart from "./GeoJSONChart";
import PieChart from "./PieChart"; // Import PieChart component

import { debounce } from 'lodash'; // Import debounce from lodash

export interface WidgetProps {
  id: string;
  location: Coord;
  onRemove: (id: string) => void;
  geoJsonData: any;
  type: string; // Add type prop
  config: any; // Add config prop
}

export const Widget = ({
  id,
  location: initialLocation,
  onRemove,
  geoJsonData,
  type, // Destructure type prop
  config, // Destructure config prop
}: WidgetProps) => {
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 100, height: 100 });
  const [position, setPosition] = useState({ x: initialLocation.x, y: initialLocation.y });

  // Store the height and width of the table
  const [curHeight, setCurHeight] = useState<number>(100); // Default height
  const [curWidth, setCurWidth] = useState<number>(100);   // Default width

  // Debounced resize function to update height/width after user stops resizing
  const debouncedResize = useRef(
    debounce((width: number, height: number) => {
      setCurWidth(width);
      setCurHeight(height);
    }, 500) // Delay the update to improve performance
  ).current;

  const debouncedDrag = useRef(
    debounce((x: number, y: number) => {
      setPosition({ x, y });
    }, 500)
  ).current;

  return (
    <Rnd
      className="widget-container"
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      minWidth={100}
      minHeight={100}
      maxWidth={1000}
      maxHeight={1000}
      bounds="parent" // Keep the widget within the Dashboard
      dragHandleClassName="widget-banner"
      onDragStop={(e, d) => {
        debouncedDrag(d.x, d.y); // Debounced drag update
      }}
      onResizeStop={(e, direction, ref, delta, newPosition) => {
        setSize({ width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10) });
        setPosition(newPosition); // Ensures correct positioning when resizing from corners 
        
        // Use the debounced function to update the table's size
        debouncedResize(parseInt(ref.style.width, 10), parseInt(ref.style.height, 10));
      }}
    >
      <div
        className="widget"
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "lightblue",
          borderRadius: "5px",
          position: "relative",
        }}
      >
        {/* Drag and close button inside the banner */}
        <WidgetBanner id={id} onRemove={onRemove} ref={bannerRef} />

        <div
          style={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
          }}
        >
          {/* Conditionally render content based on widget type */}
          {type === "bar" && <GeoJSONChart data={geoJsonData} xAttr={config.xAttr} yAttr={config.yAttr} />}
          {type === "pie" && <PieChart data={geoJsonData} xAttr={config.xAttr} />}
          {type === "line" && <p>Line chart not implemented yet.</p>}
          {type === "table" && <Table geoJsonData={geoJsonData} height='100%' width='100%' selectedFeatures={config.attributes} />}
        </div>
      </div>
    </Rnd>
  );
};

export default Widget;
