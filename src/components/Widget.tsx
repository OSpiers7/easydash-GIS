import React, { useEffect, useRef, useState } from "react";
import "../styles/App.css";
import { Coord } from "../Utils";
import { Rnd } from "react-rnd";
import WidgetBanner from "./WidgetBanner";
import GeoJSONUpload from "./GeoJsonUpload";
import Table from "./Table";
import GeoJSONChart from "./GeoJSONChart";
import PieChart from "./PieChart";
import Map from "./Map"; // Import Map component

import { useDispatch } from 'react-redux';  // Import useDispatch
//USE THIS CODE TO ACCESS THE DATA FROM THE REDUX STORE
import { useSelector } from 'react-redux';


export interface WidgetProps {
  id: string;
  onRemove: (id: string) => void;
// geoJsonData: any;
  type: string; // Add type prop
  config: any; // Add config prop
  onUpdatePositionSize: (id: string, position: { x: number; y: number }, size: { width: number; height: number }) => void; // Add prop to give size and position to dashboard
}

export const Widget = ({
  id,
  onRemove//geoJsonData,
,//geoJsonData,

//geoJsonData,
  type, // Destructure type prop
  config, // Destructure config prop
  onUpdatePositionSize,
}: WidgetProps) => {
  const ReduxKey = useSelector((state: any) => state.geoJsonDataKey);
  const SaveState = useSelector((state: any) => state.saveState);
  const geoJsonData = useSelector((state: any) => state.geoJsonData.get(config.key));
  const mapData = useSelector((state: any) => state.geoJsonData);

  const bannerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 300, height: 300 });
  const [position, setPosition] = useState({ x: 200, y: 200 }); // Updated initial position

  useEffect(() => {
    if (SaveState[0] === "load") {
      const savedWidgets = localStorage.getItem(SaveState[1]);
      if (savedWidgets) {
        const saveData = JSON.parse(savedWidgets);
        for (let i = 0; i < saveData.length; i++) {
          if (saveData[i].id === id) {
            setPosition(saveData[i].position);
            setSize(saveData[i].size);
          }
        }
      }
    } else return;
  }, [SaveState]);

  useEffect(() => {
    onUpdatePositionSize(id, position, size);
  }, [position, size]);

  return (
    <Rnd
      className="widget-container"
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      minWidth={100}
      minHeight={100}
      bounds="parent" // Keep the widget within the Dashboard
      dragHandleClassName="widget-banner"
      onDragStop={(e, d) => {
        const newPosition = new Coord(d.x, d.y);
        setPosition(newPosition); // Direct drag update
      }}
      onResizeStop={(e, direction, ref, delta, newPosition) => {
        setSize({
          width: parseInt(ref.style.width, 10),
          height: parseInt(ref.style.height, 10),
        });
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
          backgroundColor: "#D8CAB8",
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
          {type === "bar" && (
            <GeoJSONChart
              data={geoJsonData}
              xAttr={config.xAttr}
              yAttr={config.yAttr} // Pass yAttr
              filters={config.filters}
              includeNulls={config.includeNulls} // Pass includeNulls
              buckets={config.buckets} // Pass buckets
            />
          )}
          {type === "pie" && (
            <PieChart
              data={geoJsonData}
              xAttr={config.xAttr}
              yAttr={config.yAttr} // Pass yAttr
              filters={config.filters}
              includeNulls={config.includeNulls} // Pass includeNulls
              buckets={config.buckets} // Pass buckets
            />
          )}
          {type === "line" && <p>Line chart not implemented yet.</p>}
          {type === "table" && (
            <Table
              selectedFeatures={config.attributes}
              geoJsonKey={config.key}
            />
          )}
          {type === "map" && <Map data={mapData} />}
        </div>
      </div>
    </Rnd>
  );
};

export default Widget;
