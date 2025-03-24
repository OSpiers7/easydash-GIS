import React, { useEffect, useRef, useState } from "react";
import "../App.css";
import { Coord } from "../Utils";
import { Rnd } from "react-rnd";
import WidgetBanner from "./WidgetBanner";
import GeoJSONUpload from "./GeoJsonUpload";
import Table from "./Table";
import GeoJSONChart from "./GeoJSONChart";
import PieChart from "./PieChart";
import Map from "./Map"; // Import Map component


//USE THIS CODE TO ACCESS THE DATA FROM THE REDUX STORE
import { useSelector } from 'react-redux';


export interface WidgetProps {
  id: string;
  location: Coord;
  onRemove: (id: string) => void;
 // geoJsonData: any;
  type: string; // Add type prop
  config: any; // Add config prop
}

export const Widget = ({
  id,
  location: initialLocation,
  onRemove,
  //geoJsonData,
  type, // Destructure type prop
  config, // Destructure config prop
}: WidgetProps) => {

  const ReduxKey = useSelector((state: any) => state.geoJsonDataKey);
  const geoJsonData = useSelector((state: any) => state.geoJsonData.get(ReduxKey));

  

  const bannerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 300, height: 300 });
  const [position, setPosition] = useState({ x: 200, y: 800 }); // Updated initial position

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
        setPosition({ x: d.x, y: d.y }); // Direct drag update
      }}
      onResizeStop={(e, direction, ref, delta, newPosition) => {
        setSize({ width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10) });
        setPosition(newPosition); // Ensures correct positioning when resizing from corners 
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

          {type === "bar" && <GeoJSONChart data={geoJsonData} xAttr={config.xAttr} yAttr={config.yAttr} filters={config.filters} />}
          {type === "pie" && <PieChart data={geoJsonData} xAttr={config.xAttr} filters={config.filters} />}
          {type === "line" && <p>Line chart not implemented yet.</p>}
          {type === "table" && <Table selectedFeatures={config.attributes} />}
          {type === "map" && <Map geoJsonData={geoJsonData} />} {/* Render Map component */}

        </div>
      </div>
    </Rnd>
  );
};

export default Widget;
