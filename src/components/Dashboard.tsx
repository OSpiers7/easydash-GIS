import React, { useEffect, useRef, useState } from "react";
import TopBanner from "./TopBanner";
import { Widget, WidgetProps } from "./Widget";
import "../styles/App.css";
import { Coord } from "../Utils";
import UploadGeo from "./GeoJsonUpload";
import Modal from "./Modal";
import WidgetSelectionForm from "./WidgetSelectionForm";
import ChartForm from "./ChartForm";
import TableConfigForm from "./TableConfigForm";
import SaveDashboardForm from "./SaveDashboardForm";
import DataSelectionForm from "./DataSelectionForm";
import Squares from "./Squares";
import WMSupload from "./WMSupload";

import { useDispatch } from "react-redux"; // Import useDispatch
import { useSelector } from "react-redux";

import {
  FeatureCollection,
  Feature,
  Geometry,
  GeoJsonProperties,
} from "geojson";
import { setGeoJsonData, setSaveState, setSelectedKey } from "../redux/actions";

export interface DashboardProps {
  name: string;
  onBack: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ name, onBack }) => {
  // Access the geoJsonData from the Redux store
  const ReduxKey = useSelector((state: any) => state.geoJsonDataKey);
  // Access the saveState from the Redux store
  const SaveState = useSelector((state: any) => state.saveState);

  console.log("KEY", ReduxKey);

  const [widgets, setWidgets] = useState<WidgetProps[]>([]);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [isDataSelectionModalOpen, setDataSelectionModalOpen] = useState(false);
  const [isSelectionModalOpen, setSelectionModalOpen] = useState(false);
  const [isConfigModalOpen, setConfigModalOpen] = useState(false);
  const [isSaveSelectionModalOpen, setSaveSelectionModalOpen] = useState(false);
  const [selectedWidgetType, setSelectedWidgetType] = useState<string | null>(
    null
  );

  const [isUploadDataOpen, setUploadDataModalOpen] = useState(false);

  const [widgetConfig, setWidgetConfig] = useState<any>(null);

  const [dashboardName, setDashboardName] = useState<string>(name);
  if (dashboardName === "DefaultValue") setDashboardName("New Dashboard");

  const [isFeatureSelectionModalOpen, setFeatureSelectionModalOpen] =
    useState(false);

  const dispatch = useDispatch();

  const addWidget = (type: string, config: any) => {
    const newWidget = {
      id: `widget-${Date.now()}`,
      onRemove: removeWidget,
      type: type,
      config: config,
      onUpdatePositionSize: updateWidgetPositionSize,
      //geoJsonData: setGeoJsonData
    };
    setWidgets((prevWidgets) => [...prevWidgets, newWidget]);
  };

  const updateWidgetPositionSize = (
    id: string,
    position: { x: number; y: number },
    size: { width: number; height: number }
  ) => {
    setWidgets((prevWidgets) =>
      prevWidgets.map((widget) =>
        widget.id === id ? { ...widget, position, size } : widget
      )
    );
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

  const handleWidgetCreate = (
    xAttr: string,
    filters?: Record<string, string[]>
  ) => {
    try {
      if (selectedWidgetType) {
        const localKey = ReduxKey || "defaultKey";

        let config;
        if (selectedWidgetType === "bar" || selectedWidgetType === "pie") {
          config = { xAttr, yAttr: "count", filters, key: localKey }; // Automatically set yAttr to "count"
        } else if (selectedWidgetType === "table") {
          config = { attributes: xAttr, key: localKey }; // Assuming xAttr contains comma-separated attributes for table
        } else {
          config = { xAttr, yAttr: "count", filters, key: localKey };
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

  //this button will open the next modal. its a confirm button the other modals automatically close it but a confirm button is probably a better aproach
  const handleDataSelectionComplete = () => {
    setDataSelectionModalOpen(false); // Close data selection modal
    setSelectionModalOpen(true); // Open widget selection modal
  };

  // This will change the saveState redux variable to begin saving the dashboard with the name
  const handleSaveForm = (dashName: string) => {
    dispatch(setSaveState("save")); // Dispatch the action to set the save state
    setDashboardName(dashName); // Save the dashboard name
    setSaveSelectionModalOpen(false); // Close the save modal
  };

  useEffect(() => {
    if (SaveState[0] === "save") {
      localStorage.setItem(dashboardName, JSON.stringify(widgets));
      dispatch(setSaveState("")); // Reset the save state
    } else if (SaveState[0] === "load") {
      const savedWidgets = localStorage.getItem(SaveState[1]);
      if (savedWidgets) setWidgets(JSON.parse(savedWidgets));
    } else return;
  }, [SaveState]);

  return (
    <div className="w-screen min-h-screen relative ">
      {/* BACKGROUND LAYER */}
      <div className="fixed inset-0 z-0 h-full w-full">
        <Squares
          speed={0.05}
          squareSize={80}
          direction="diagonal"
          borderColor="#fff"
          hoverFillColor="#222"
        />
      </div>

      {/* FOREGROUND CONTENT */}
      <div className="relative z-10">
        {/* CALL FOR THE TOP BANNER */}
        <div className="fixed top-0 left-0 w-full z-50 mt-[20px]">
          <TopBanner
            onAddWidget={() => {
              setDataSelectionModalOpen(true);
            }}
            onSaveDashboard={() => {
              // Change saveState to "saving"
              setSaveSelectionModalOpen(true);
            }}
            onBack={onBack}
            uploadData={() => {
              // Change saveState to "saving"
              setUploadDataModalOpen(true);
            }}
          />
        </div>
        {/*Origianlly was opening selection widget. Made it open data selection modal
        
        
        ADD THE RESSET FOR THE KEY USE EFFECT ON THE ON ADD WIDGET
      
        
        */}
        <div ref={dropZoneRef} className="drop-zone">
          {widgets.map((widget) => (
            <Widget
              key={widget.id}
              id={widget.id}
              onRemove={removeWidget}
              type={widget.type}
              config={widget.config}
              onUpdatePositionSize={updateWidgetPositionSize}
              //geoJsonData = {setGeoJsonData}
            />
          ))}
        </div>
        {/*Modal to select data, still need to create a redux item that keeps track of data. Then go into the widgets call that use effect to access the map */}
        <Modal
          isOpen={isDataSelectionModalOpen}
          onClose={() => setDataSelectionModalOpen(false)}
          title="Select Data Set"
        >
          <DataSelectionForm />
          <p>Selected Key: {ReduxKey}</p> {/* Display the selected key */}
          <button onClick={handleDataSelectionComplete}>Confirm</button>{" "}
          {/* Button to confirm and proceed */}
        </Modal>
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
            <ChartForm onSelect={handleWidgetCreate} />
          )}
          {selectedWidgetType === "pie" && (
            <ChartForm onSelect={handleWidgetCreate} />
          )}
          {selectedWidgetType === "line" && (
            <p>Line chart configuration not implemented yet.</p>
          )}

          {selectedWidgetType === "table" && (
            <TableConfigForm onSelect={handleWidgetCreate} />
          )}
        </Modal>
        {/* Dashboard Saving Modal */}
        <Modal
          isOpen={isSaveSelectionModalOpen}
          onClose={() => setSaveSelectionModalOpen(false)}
          title="Enter Dashboard Name"
        >
          <SaveDashboardForm
            onEnter={handleSaveForm}
            curDashName={dashboardName}
          />
        </Modal>

        <Modal
          isOpen={isUploadDataOpen}
          onClose={() => setUploadDataModalOpen(false)}
          title="Enter your data sources"
        >
          <UploadGeo />
          <WMSupload />
        </Modal>
      </div>
    </div>
  );
};

export default Dashboard;
