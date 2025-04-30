import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { FeatureCollection, Feature } from 'geojson';
import { RxLayers } from "react-icons/rx";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MapFilter from "./MapFilter";

interface MapProps {
  data: Map<string, GeoJSON.FeatureCollection>;
}

const Map: React.FC<MapProps> = ({ data }) => {
  const [filteredFiles, setFilteredFiles] = useState<string[]>([]);
  const [fileProperties, setFileProperties] = useState<{ [key: string]: string[] }>({});
  const [filteredProperties, setFilteredProperties] = useState<{ [key: string]: string[] }>({});
  const [isClicked, setIsClicked] = useState(false);
  const [map, setMap] = useState<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  //Used to rerender layers when user resizes the map widget
  useEffect(() => {
    if (!containerRef.current || !map)
      return;

    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [map]);

  //Get properties associated with each new file
  useEffect(() => {
    setFileProperties(getProperties());
  }, [data]);

  //Extracts unique properties from all the features in a file
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

  //Stylig for point features on the map
  const pointToLayer = (feature: any, latlng: L.LatLng) => {
    const color = feature.properties?.color || "#3388ff";
    return L.circleMarker(latlng, {
      pane: "markerPane",
      radius: 4,
      color: color,
      fillColor: color,
      opacity: 1,
      fillOpacity: 0.8
    });
  };

  //Styling for non-point features on the map
  const geoStyle = (feature: any) => {
    const color = feature.properties?.color || "#3388ff";
    return {
      pane: "overlayPane",
      color: color,
      fillColor: color,
      opacity: 1,
      fillOpacity: 0.8
    };
  };

  //Binds pop-ups to each feature based on the filtered properties
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

  //Callback function for handling file filter in the MapFilter component
  const handleFileFilterSelect = (filteredFiles: string[]) => {
    setFilteredFiles(filteredFiles);
  };

  //Callback function for handling property filter in the MapFilter component
  const handlePropertyFilterSelect = (checkedProperties: { [key: string]: string[] }) => {
    setFilteredProperties(checkedProperties);
  };

  return (
    <div ref={containerRef} style={{
      height: "calc(100% - 25px)", // Subtract banner height
      width: "100%",
      marginTop: "25px"
    }} className="position-relative">
      <button
        className="btn btn-light rounded shadow position-absolute top-0 end-0 m-3"
        style={{ zIndex: "1000", display: isClicked ? "none" : "block" }}
        onClick={() => data.size > 0 && setIsClicked(!isClicked)}
      >
        <RxLayers />
      </button>
      <div
        className="position-absolute top-0 end-0 m-3"
        style={{
          zIndex: 1000,
          maxHeight: "80%",
          maxWidth: "80%",
          whiteSpace: "normal",
          overflowWrap: "break-word",
          wordBreak: "break-word",
          overflowY: "auto",
          display: isClicked ? "block" : "none",
        }}
        onMouseEnter={() => setIsClicked(true)}
        onMouseLeave={() => setIsClicked(false)}
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
        ref={setMap}
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
              style={geoStyle}
              onEachFeature={(feature, layer) => onEachFeature(feature, layer, fileName)}
            />
          ))}
      </MapContainer>
    </div>
  );
};

export default Map;