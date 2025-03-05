import React, { useRef, useState } from 'react';
import TopBanner from './TopBanner';
import { Widget, WidgetProps } from './Widget';
import '../Dashboard.css';
import { Coord } from '../Utils';
import UploadGeo from './GeoJsonUpload';
import Modal from './Modal';
import WidgetSelectionForm from './WidgetSelectionForm';
import ChartForm from './ChartForm';
import TableConfigForm from './TableConfigForm';


import { useDispatch } from 'react-redux';  // Import useDispatch
import { useSelector } from 'react-redux';

import { FeatureCollection, Feature, Geometry, GeoJsonProperties } from 'geojson';

const Dashboard: React.FC = () => {
  const [widgets, setWidgets] = useState<WidgetProps[]>([]);
  const dropZoneRef = useRef<HTMLDivElement>(null);


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
    setConfigModalOpen(true);
  };

  const handleWidgetCreate = (xAttr: string, yAttr?: string) => {
    try {
      if (selectedWidgetType) {
        let config;
        if (selectedWidgetType === 'bar' || selectedWidgetType === 'pie') {
          config = { xAttr, yAttr: 'count' }; // Automatically set yAttr to 'count'
        } else if (selectedWidgetType === 'table') {
          config = { attributes: xAttr.split(',') }; // Assuming xAttr contains comma-separated attributes for table
        } else {
          config = { xAttr, yAttr };
        }
        addWidget(selectedWidgetType, config);
      }
      setConfigModalOpen(false);
      setSelectedWidgetType(null);
      setWidgetConfig(null);
    } catch (error) {
      console.error('Error creating widget:', error);
      alert('An error occurred while creating the widget. Please try again.');
    }
  };

  return (
    <div className="dashboard">
      <TopBanner onAddWidget={() => setSelectionModalOpen(true)} />
      <div ref={dropZoneRef} className="drop-zone">

        <UploadGeo  />
        
        {widgets.map((widget) => (
          <Widget
            key={widget.id}
            id={widget.id}
            location={widget.location}
            onRemove={removeWidget}
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
        {selectedWidgetType === 'bar' && (
          <ChartForm data={geoJsonData} onSelect={handleWidgetCreate} />
        )}
        {selectedWidgetType === 'pie' && (
          <ChartForm data={geoJsonData} onSelect={handleWidgetCreate} />
        )}
        {selectedWidgetType === 'line' && (
          <p>Line chart configuration not implemented yet.</p>
        )}
        {selectedWidgetType === 'table' && geoJsonData.features.length > 0 && (
          <TableConfigForm data={{
            type: 'FeatureCollection',
            features: [geoJsonData.features[0]], // Wrap the single feature in an array
          }} onSelect={handleWidgetCreate} />
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
