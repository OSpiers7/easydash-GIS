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
      location: new Coord(50, 50),
      mouseLocation: new Coord(0, 0),
      onRemove: removeWidget,
      onMouseLocationChange: updateMouseLocation,
    };
    setWidgets((prevWidgets) => [...prevWidgets, newWidget]);
  };

  const removeWidget = (id: string) => {
    setWidgets((prevWidgets) =>
      prevWidgets.filter((widget) => widget.id !== id)
    );
  };

  const updateMouseLocation = (id: string, mouseLocation: Coord) => {
    setWidgets((prevWidgets) =>
      prevWidgets.map((widget) =>
        widget.id === id ? { ...widget, mouseLocation } : widget
      )
    );
  };

  useEffect(() => {
    const el = dropZoneRef.current;
    if (!el) return;

    return dropTargetForElements({
      element: el,
      getData: () => ({ location }),
      onDragEnter() {
        console.log("dragEnter");
      },
      onDragLeave() {
        console.log("dragLeave");
      },
      onDrop() {
        console.log("drop");
      },
    });
  }, [location, widgets]);

  useEffect(() => {
    const el = dropZoneRef.current;
    if (!el) return;

    return combine(
      monitorForElements({
        onDrop({ source, location }) {
          const destination = location.current.dropTargets[0];
          console.log("onDrop", { source, location });
          if (!destination) return;

          const destinationLocation = new Coord(
            location.current.input.clientX,
            location.current.input.clientY
          );

          const widgetId = source.data.id;

          setWidgets((prevWidgets) =>
            prevWidgets.map((widget) =>
              widget.id === widgetId
                ? {
                    ...widget,
                    location: widget.location.add(
                      destinationLocation.subtract(widget.mouseLocation)
                    ),
                  }
                : widget
            )
          );
        },
      })
    );
  }, [widgets]);

  return (
    <div className="dashboard">
      <TopBanner onAddWidget={addWidget} />
      <div ref={dropZoneRef} className="drop-zone">
        {widgets.map((widget) => (
          <Widget
            key={widget.id}
            id={widget.id}
            location={widget.location}
            mouseLocation={widget.mouseLocation}
            onRemove={removeWidget}
            onMouseLocationChange={updateMouseLocation}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
