import React, { useRef, useState } from "react";
import TopBanner from "./TopBanner";
import { Widget, WidgetProps } from "./Widget";
import "../Dashboard.css";
import { Coord } from "../Utils";
import UploadGeo from "./GeoJsonUpload";
import Modal from "./Modal";
import WidgetSelectionForm from "./WidgetSelectionForm";
import ChartForm from "./ChartForm";
import TableConfigForm from "./TableConfigForm";

const Dashboard: React.FC = () => {
  const [widgets, setWidgets] = useState<WidgetProps[]>([]);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [isSelectionModalOpen, setSelectionModalOpen] = useState(false);
  const [isConfigModalOpen, setConfigModalOpen] = useState(false);
  const [selectedWidgetType, setSelectedWidgetType] = useState<string | null>(null);
  const [widgetConfig, setWidgetConfig] = useState<any>(null);

  const addWidget = (type: string, config: any) => {
    const newWidget = {
      id: `widget-${Date.now()}`,
      location: new Coord(500, 100),
      onRemove: removeWidget,
      geoJsonData: geoJsonData,
      type: type,
      config: config,
    };
    setWidgets((prevWidgets) => [...prevWidgets, newWidget]);
  };

  const removeWidget = (id: string) => {
    setWidgets((prevWidgets) =>
      prevWidgets.filter((widget) => widget.id !== id)
    );
  };

  const handleWidgetSelect = (widgetType: string) => {
    setSelectedWidgetType(widgetType);
    setSelectionModalOpen(false);
    if (widgetType === "map") {
      addWidget(widgetType, {}); // Directly add the map widget without configuration
    } else {
      setConfigModalOpen(true);
    }
  };

  const handleWidgetCreate = (xAttr: string, filters?: Record<string, string[]>) => {
    try {
      if (selectedWidgetType) {
        let config;
        if (selectedWidgetType === "bar" || selectedWidgetType === "pie") {
          config = { xAttr, yAttr: "count", filters }; // Automatically set yAttr to "count"
        } else if (selectedWidgetType === "table") {
          config = { attributes: xAttr }; // Assuming xAttr contains comma-separated attributes for table
        } else {
          config = { xAttr, yAttr: "count", filters };
        }
        addWidget(selectedWidgetType, config);
      }
      setConfigModalOpen(false);
      setSelectedWidgetType(null);
      setWidgetConfig(null);
    } catch (error) {
      console.error("Error creating widget:", error);
      alert("An error occurred while creating the widget. Please try again.");
    }
  };

  return (
    <div className="dashboard">
      <TopBanner onAddWidget={() => setSelectionModalOpen(true)} />
      <div ref={dropZoneRef} className="drop-zone">
        <UploadGeo setGeoJsonData={setGeoJsonData} />
        {widgets.map((widget) => (
          <Widget
            key={widget.id}
            id={widget.id}
            location={widget.location}
            onRemove={removeWidget}
            geoJsonData={geoJsonData}
            type={widget.type}
            config={widget.config}
          />
        ))}
      </div>

      {/* Widget Selection Modal */}
      <Modal
        isOpen={isSelectionModalOpen}
        onClose={() => setSelectionModalOpen(false)}
        title="Select Widget Type"
      >
        <WidgetSelectionForm onSelect={handleWidgetSelect} />
      </Modal>

      {/* Widget Configuration Modal */}
      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => setConfigModalOpen(false)}
        title="Configure Widget"
      >
        {selectedWidgetType === "bar" && (
          <ChartForm data={geoJsonData} onSelect={handleWidgetCreate} />
        )}
        {selectedWidgetType === "pie" && (
          <ChartForm data={geoJsonData} onSelect={handleWidgetCreate} />
        )}
        {selectedWidgetType === "line" && (
          <p>Line chart configuration not implemented yet.</p>
        )}
        {selectedWidgetType === "table" && (
          <TableConfigForm data={geoJsonData} onSelect={(attributes) => handleWidgetCreate(attributes)} />
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
