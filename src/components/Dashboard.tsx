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

import DataSelectionForm from './DataSelectionForm';


import { useDispatch } from 'react-redux';  // Import useDispatch
import { useSelector } from 'react-redux';

import { FeatureCollection, Feature, Geometry, GeoJsonProperties } from 'geojson';
import { setGeoJsonData, setSelectedKey } from '../redux/actions';

const Dashboard: React.FC = () => {


    // Access the geoJsonData from the Redux store
  const ReduxKey = useSelector((state: any) => state.geoJsonDataKey);




  console.log("KEY", ReduxKey)
  


  const [widgets, setWidgets] = useState<WidgetProps[]>([]);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [isDataSelectionModalOpen, setDataSelectionModalOpen] = useState(false);
  const [isSelectionModalOpen, setSelectionModalOpen] = useState(false);
  const [isConfigModalOpen, setConfigModalOpen] = useState(false);
  const [selectedWidgetType, setSelectedWidgetType] = useState<string | null>(null);
  const [widgetConfig, setWidgetConfig] = useState<any>(null);


  const [isFeatureSelectionModalOpen, setFeatureSelectionModalOpen] = useState(false);

  const dispatch = useDispatch();

  


  const addWidget = (type: string, config: any) => {
    const newWidget = {
      id: `widget-${Date.now()}`,
      location: new Coord(500, 100),
      onRemove: removeWidget,
      type: type,
      config: config,
      //geoJsonData: setGeoJsonData
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

        const localKey = ReduxKey || "defaultKey";

        let config;
        if (selectedWidgetType === "bar" || selectedWidgetType === "pie") {
          config = { xAttr, yAttr: "count", filters, key: localKey}; // Automatically set yAttr to "count"
        } else if (selectedWidgetType === "table") {
          config = { attributes: xAttr, key: localKey }; // Assuming xAttr contains comma-separated attributes for table
        } else {
          config = { xAttr, yAttr: "count", filters, key: localKey};
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
    setDataSelectionModalOpen(false);  // Close data selection modal
    setSelectionModalOpen(true);  // Open widget selection modal
  };
  

  return (
    <div className="dashboard">
        {/*Origianlly was opening selection widget. Made it open data selection modal
        
        
        ADD THE RESSET FOR THE KEY USE EFFECT ON THE ON ADD WIDGET
      
        
        */}

      <TopBanner onAddWidget={() => {
        setDataSelectionModalOpen(true);
         
        } } />

      <div ref={dropZoneRef} className="drop-zone">

       

        
        {widgets.map((widget) => (
          <Widget
            key={widget.id}
            id={widget.id}
            location={widget.location}
            onRemove={removeWidget}
            type={widget.type}
            config={widget.config}
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

        <DataSelectionForm/>
        <p>Selected Key: {ReduxKey}</p> {/* Display the selected key */}
        <button onClick={handleDataSelectionComplete}>Confirm</button> {/* Button to confirm and proceed */}

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
          <TableConfigForm onSelect= {handleWidgetCreate} />

        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
