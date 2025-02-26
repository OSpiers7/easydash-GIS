import React, { useEffect, useRef, useState } from "react";
// import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import TopBanner from "./TopBanner";
import { Widget, WidgetProps } from "./Widget";
import "../Dashboard.css";
import { Coord, isEqualCoord } from "../Utils";

const Dashboard: React.FC = () => {
  const [widgets, setWidgets] = useState<WidgetProps[]>([]);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const addWidget = () => {
    const newWidget = {
      id: `widget-${Date.now()}`,
      location: new Coord(500, 100),
      onRemove: removeWidget,
    };
    setWidgets((prevWidgets) => [...prevWidgets, newWidget]);
  };

  const removeWidget = (id: string) => {
    setWidgets((prevWidgets) =>
      prevWidgets.filter((widget) => widget.id !== id)
    );
  };

  return (
    <div className="dashboard">
      <TopBanner onAddWidget={addWidget} />
      <div ref={dropZoneRef} className="drop-zone">
        {widgets.map((widget) => (
          <Widget
            key={widget.id}
            id={widget.id}
            location={widget.location}
            onRemove={removeWidget}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
