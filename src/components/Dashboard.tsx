// Dashboard component. 
// This component is responsible for rendering the dashboard, managing widgets, and handling user interactions.



import React, { useEffect, useRef, useState } from "react";
import TopBanner from "./TopBanner";
import { Widget, WidgetProps } from "./Widget";
import "../styles/App.css";
import "../styles/Dashboard.css";
import { Coord } from "../Utils";
import UploadGeo from "./GeoJsonUpload";
import Modal from "./Modal";
import WidgetSelectionForm from "./WidgetSelectionForm";
import ChartForm from "./ChartForm";
import TableConfigForm from "./TableConfigForm";
import SaveDashboardForm from "./SaveDashboardForm";
import BarLoader from "./BarLoader";

import DataSelectionForm from './DataSelectionForm';
import { supabase } from '../supabaseClient';
import html2canvas from 'html2canvas';


//import Squares from "./Squares";
import WMSupload from "./WMSupload";
import Menu from "./Menu"

import DataRemove from "./DataRemove";

import { useDispatch } from "react-redux"; // Import useDispatch
import { useSelector } from "react-redux";

import {
  FeatureCollection,
  Feature,
  Geometry,
  GeoJsonProperties,
} from "geojson";
import { setGeoJsonData, setMapSyncComplete, setMapSyncStatus, setSaveState, setSelectedKey } from "../redux/actions";


export interface DashboardProps {
  name: string;
  onBack: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ name, onBack }) => {
  // Access the geoJsonData from the Redux store
  const ReduxKey = useSelector((state: any) => state.geoJsonDataKey);
  // Access the saveState from the Redux store
  const SaveState = useSelector((state: any) => state.saveState);
  // Access the mapSync data from the Redux store
  const MapSync = useSelector((state: any) => state.mapSync);

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
  const [isRemoveDataModalOpen, setRemoveDataModalOpen] = useState(false);
  const [isUserLoginModalOpen, setUserLoginModalOpen] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  //Controls the logic for opening the log in
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);

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

    yAttr: string, // Add yAttr parameter
    filters: Record<string, string[]>,
    includeNulls: boolean,
    buckets?: number // Add buckets parameter
  ) => {
    try {
      if (selectedWidgetType) {
        const localKey = ReduxKey || "defaultKey";

        let config;
        if (selectedWidgetType === "bar" || selectedWidgetType === "pie") {
          config = {
            xAttr,
            yAttr, // Include yAttr in the configuration
            filters,
            includeNulls,
            buckets, // Pass buckets to the widget configuration
            key: localKey,
          };
        } else if (selectedWidgetType === "table") {
          config = { attributes: xAttr, key: localKey }; // Assuming xAttr contains comma-separated attributes for table
        } else {
          config = { xAttr, yAttr: "count", filters, key: localKey }; // Default yAttr for other widgets
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

  // Add a state to track when we're saving (for the loading screen)
  const [isSavingWithLoader, setIsSavingWithLoader] = useState(false);

  // This will change the saveState redux variable to begin saving the dashboard with the name
  const handleSaveForm = (dashName: string) => {
    setDashboardName(dashName); // Save the dashboard name
    setSaveSelectionModalOpen(false); // Close the save modal
    setIsSavingWithLoader(true); // Show the loading screen
    setIsSaving(true); // Start the saving process
    dispatch(setMapSyncStatus("sync")); // Request map data
  };

  const captureDashboardScreenshot = async (dashboardElementId: string) => {
    const element = document.getElementById(dashboardElementId);
    if (!element) {
      console.error("Dashboard element not found");
      return null;
    }

    // Store the current state of the loader
    const loaderVisible = isSavingWithLoader;
    
    // Find and hide the TopBanner
    const topBanner = document.querySelector(".fixed.top-0.left-0.w-full.z-50.mt-\\[20px\\]") as HTMLElement;
    let topBannerDisplay = "block";
    
    if (topBanner) {
      topBannerDisplay = topBanner.style.display;
      topBanner.style.display = "none";
    }
    
    // Wait a moment for the UI to update
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(element, {
      scale: 1,
      backgroundColor: "#525252",
      useCORS: true,
      allowTaint: true
    });

    // Restore the TopBanner
    if (topBanner) {
      topBanner.style.display = topBannerDisplay;
    }
    
    // Restore the loader if it was visible before
    if (loaderVisible) {
      setIsSavingWithLoader(true);
    }

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob: Blob | null) => {
        resolve(blob);
      }, "image/png", 0.9);
    });
    return blob;
  };

  // Add a new state to track the saving process
  const [isSaving, setIsSaving] = useState(false);

  // Split the saving process into two useEffects
  // First useEffect: Trigger map sync and wait for response
  useEffect(() => {
    if (!isSaving) return;
    
    // If map data is synced or loaded, proceed to actual saving
    if (MapSync[0] === "synced" || MapSync[0] === "loaded") {
      // Create a combined object with widgets and mapData
      const dashboardData = {
        widgets: widgets,
        mapData: MapSync[1] || {} // Use empty object if MapSync[1] is null
      };
      
      // Save the combined data to localStorage
      localStorage.setItem(dashboardName, JSON.stringify(dashboardData));
      
      // Upload to Supabase
      uploadToSupabase();
      
      setIsSaving(false); // Reset saving state
      dispatch(setSaveState("")); // Reset the save state
    }
  }, [isSaving, MapSync]);

  // Second useEffect: Handle the actual upload
  const uploadToSupabase = async () => {
    try {
      // Get the map data from MapSync
      const mapData = MapSync[1];
      
      // Create a combined object with widgets and mapData
      const dashboardData = {
        widgets: widgets,
        mapData: mapData
      };
      
      // Create a JSON blob with the combined data
      const dashboardBlob = new Blob([JSON.stringify(dashboardData)], {
        type: "application/json",
      });

      // Upload JSON
      const { error: jsonError } = await supabase.storage
        .from("dashboards")
        .upload(`${dashboardName}.json`, dashboardBlob, {
          contentType: "application/json",
          upsert: true,
        });

      if (jsonError)
        console.error(`Error uploading ${dashboardName}.json:`, jsonError);

      // Capture and upload screenshot
      const screenshotBlob = await captureDashboardScreenshot(
        "full-dashboard"
      ); // your dashboard div id
      if (!screenshotBlob) return;

      const { error: imageError } = await supabase.storage
        .from("screenshots")
        .upload(`${dashboardName}.png`, screenshotBlob, {
          contentType: "image/png",
          upsert: true,
        });

      if (imageError)
        console.error(`Error uploading ${dashboardName}.png:`, imageError);
    } finally {
      // Hide the loader when done, regardless of success or failure
      setIsSavingWithLoader(false);
    }
  };

  // Modify the SaveState useEffect to handle loading
  useEffect(() => {
    if (SaveState[0] === "save") {
      // This is now handled by the isSaving state and its useEffect
      dispatch(setSaveState("")); // Reset the save state
    } else if (SaveState[0] === "load") {
      const savedData = localStorage.getItem(SaveState[1]);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        // Check if the data has the new structure with widgets and mapData
        if (parsedData.widgets && parsedData.mapData) {
          // Set widgets from the combined data
          setWidgets(parsedData.widgets);
          
          // Set map data in Redux
          dispatch(setMapSyncComplete("sync", parsedData.mapData));
        } else {
          // Handle legacy format (just widgets array)
          setWidgets(parsedData);
        }
      }
    } else return;
  }, [SaveState]);

  return (
    <div>
      {isSavingWithLoader && (
        <div className="fixed inset-0 z-[9999] bg-black bg-opacity-75 flex items-center justify-center">
          <BarLoader />
        </div>
      )}
      <div id="full-dashboard" className="dashboard">

        {/* BACKGROUND LAYER */}
        <div className="fixed inset-0 z-0 h-full w-full bg-[url('/world.svg')] bg-cover bg-center">
          {/* The SVG file will act as the background */}
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
            onRemoveData={() => {
              setRemoveDataModalOpen(true);
            }}
            loginUser={() => {
              setIsDropDownOpen(true);
            }}
          />
        </div>
        {/*Origianlly was opening selection widget. Made it open data selection modal
        
        
        ADD THE RESSET FOR THE KEY USE EFFECT ON THE ON ADD WIDGET
      
        
        */}
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
        <Modal
          isOpen={isRemoveDataModalOpen}
          onClose={() => setRemoveDataModalOpen(false)}
          title="Select Data Set"
        >
          <DataRemove />
        </Modal>
        <Menu
          isDropDownOpen={isDropDownOpen}
          setIsDropDownOpen={setIsDropDownOpen}
        />
      </div>

        <div
          id="dashboard-container"
          ref={dropZoneRef}
          className="drop-zone mt-[35px]"
        >
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
            <TableConfigForm
              onSelect={(attributes: string) =>
                handleWidgetCreate(attributes, "count", {}, false)
              }
            />
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
      </div>
    </div>
  );
};

export default Dashboard;
