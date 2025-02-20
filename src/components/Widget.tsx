import React, { useEffect, useRef, useState } from "react";
import "../App.css";
import { Coord } from "../Utils";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { Resizable } from "react-resizable";
import "react-resizable/css/styles.css";
import WidgetBanner from "./WidgetBanner";
import GeoJSONUpload from "../GeoJSONUpload";

export interface WidgetProps {
  id: string;
  location: Coord;
  mouseLocation: Coord;
  onRemove: (id: string) => void;
  onMouseLocationChange: (id: string, mouseLocation: Coord) => void;
}

export const Widget = ({
  id,
  location,
  mouseLocation: initialMouseLocation,
  onRemove,
  onMouseLocationChange,
}: WidgetProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mouseLocation, setMouseLocation] = useState(initialMouseLocation);
  const [size, setSize] = useState({ width: 100, height: 100 });
  const sizeRef = useRef({ width: 100, height: 100 });
  const isResizing = useRef(false);

  // console.log(`Widget Rendered: ${id}`, { location, isDragging }); // Add this log

  // useEffect for rendering draggable object on move
  useEffect(() => {
    const el = ref.current;
    const bannerEl = bannerRef.current;
    if (!el) return;

    return draggable({
      element: el,
      dragHandle: bannerEl || undefined,
      getInitialData: () => ({
        id: id,
        location,
        mouseLocation,
        onRemove,
      }),
      onDragStart({ source, location }) {
        // console.log("onDragStart", { source, location });
        if (isResizing.current) return;
        const newMouseLocation = new Coord(
          location.initial.input.clientX,
          location.initial.input.clientY
        );
        setMouseLocation(newMouseLocation);
        onMouseLocationChange(id, newMouseLocation);
      },
      onDrag() {
        if (isResizing.current) return;
        setIsDragging(true);
      },
      onDrop() {
        setIsDragging(false);
      },
    });
  }, [id, location, onMouseLocationChange]);

  return (
    <div
      ref={ref}
      className="widget"
      style={{
        left: `${location.x}px`,
        top: `${location.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        opacity: isDragging ? 0.5 : 1,
        position: "absolute",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "lightblue",
        borderRadius: "5px",
      }}
    >
      {/* Drag and close button are inside the banner */}
      <WidgetBanner id={id} onRemove={onRemove} ref={bannerRef} />

      <div
        style={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <GeoJSONUpload />
      </div>

      {/* Resizable Handle - Placed in Bottom-Right Corner */}
      <Resizable
        width={size.width}
        height={size.height}
        minConstraints={[50, 50]}
        maxConstraints={[500, 500]}
        onResizeStart={() => {
          isResizing.current = true; // Mark resizing as active
        }}
        onResizeStop={(event, { size }) => {
          setSize(size);
          isResizing.current = false; // Allow dragging after resize
        }}
        onResize={(event, { size }) => {
          setSize(size);
        }}
      >
        <div
          className="resize-handle"
          style={{
            position: "absolute",
            width: "10px",
            height: "10px",
            bottom: "0",
            right: "0",
            background: "#666",
            cursor: "se-resize",
          }}
        />
      </Resizable>
    </div>
  );
};
