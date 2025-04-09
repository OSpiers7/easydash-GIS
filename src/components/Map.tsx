import { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import { FeatureCollection, Feature } from 'geojson';
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MapFilter from "./MapFilter";

interface MapProps {
  data: Map<string, GeoJSON.FeatureCollection>;
}

//Circle Marker Styling
const geojsonMarkerOptions: L.CircleMarkerOptions = {
  radius: 4,
  fillOpacity: 1,
};

const Map: React.FC<MapProps> = ({ data }) => {
  const [filteredFiles, setFilteredFiles] = useState<string[]>([]);
  const [fileProperties, setFileProperties] = useState<{ [key: string]: string[] }>({});
  const [filteredProperties, setFilteredProperties] = useState<{ [key: string]: string[] }>({});
  //const [isHovered, setIsHovered] = useState (false);
  //const [center, setCenter] = useState<L.LatLng | null>(null);

  useEffect(() => {
    setFileProperties(getProperties());
  }, [data]);

  //Extract all feature properties within a specified file
  const getProperties = () => {
    const propertiesByFile: { [key: string]: string[] } = {};
  
    Array.from(data.entries()).forEach(([fileName, featureCollection]) => {
      const propertySet = new Set<string>();
  
      featureCollection.features.forEach((feature) => {
        if (feature?.properties) {
          Object.keys(feature.properties).forEach((key) => {
            propertySet.add(key);
          });
        }
      });
  
      propertiesByFile[fileName] = Array.from(propertySet);
    });
  
    return propertiesByFile;
  };

  //Convert point features into Leaflet circle markers
  const pointToLayer = (_feature: any, latlng: L.LatLng) => {
    return L.circleMarker(latlng, geojsonMarkerOptions);
  };

  //Bind popups to each feature
  const onEachFeature = (feature: Feature, layer: L.Layer, fileName: string) => {
    if (feature.properties) {
      let popUpContent = "";
  
      for (const key in feature.properties) {
        if (filteredProperties[fileName]?.includes(key)) {
          popUpContent += `<p>${key}: ${feature.properties[key]}</p>`;
        }
      }
  
      if (popUpContent) {
        layer.bindPopup(popUpContent);
      }
    }
  };

  //Applies filter of file names to the map (essentially allows user to toggle between different layers of the map)
  const handleFileFilterSelect = (filteredFiles: string[]) => {
    setFilteredFiles(filteredFiles);
  }

  //Applies filter of properties
  const handlePropertyFilterSelect = (checkedProperties: { [fileName: string]: string[] }) => {
    setFilteredProperties(checkedProperties);
  }

  return (
    <div style={{ height: "100%", width: "100%" }} className="position-relative">
      <div 
        className="position-absolute top-0 end-0 m-3"
        style={{ zIndex: 1000, maxHeight: "80%", overflowY: "auto"}}
        //onMouseEnter={() => setIsHovered(true)}
        //onMouseLeave={() => setIsHovered(false)}
      >
        <MapFilter
          fileProperties={fileProperties}
          fileNames={Array.from(data.keys())}
          onFileFilterSelect={handleFileFilterSelect}
          onPropertiesFilterSelect={handlePropertyFilterSelect}
        />
      </div>

      <MapContainer
        center={[37.0902, -95.7129]}
        zoom={7}
        minZoom={3}
        maxZoom={19}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap'
        />

        {Array.from(data)
        .filter(([fileName, _geoJsonData]) => filteredFiles.includes(fileName))
        .map(([fileName, geoJsonData]) => (
          <GeoJSON
            key={`${fileName}-${JSON.stringify(filteredProperties[fileName])}`}
            data={geoJsonData}
            pointToLayer={pointToLayer}
            onEachFeature={(feature, layer) => onEachFeature(feature, layer, fileName)}
            style={(feature) => ({
              pane: feature?.geometry.type === "Point" ? "markerPane" : "overlayPane",
            })}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;