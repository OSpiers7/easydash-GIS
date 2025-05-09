import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { FeatureCollection, Feature } from 'geojson';
import { RxLayers } from "react-icons/rx";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MapFilter from "./MapFilter";
import { useDispatch } from "react-redux";
import { setRenderedMapData } from "../redux/actions"; // Import the action to set rendered map data

interface MapProps {
  data: Map<string, GeoJSON.FeatureCollection>;
}

const Map: React.FC<MapProps> = ({ data }) => {
  const dispatch = useDispatch();
  const [filteredFiles, setFilteredFiles] = useState<string[]>([]);
  const [fileProperties, setFileProperties] = useState<{ [key: string]: string[] }>({});
  const [filteredProperties, setFilteredProperties] = useState<{ [key: string]: string[] }>({});
  const [isClicked, setIsClicked] = useState(false);
  const [map, setMap] = useState<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  console.log("Map component rendered");
  console.log("Data passed to Map component:", data);

  // Function to extract rendered data
  const extractRenderedData = () => {
    if (!map) {
      console.warn("Map is not initialized. Skipping rendered data extraction.");
      return;
    }

    const bounds = map.getBounds(); // Get the currently viewable area
    console.log("Current map bounds:", bounds);

    const renderedData = Array.from(data)
      .filter(([fileName, _geoJsonData]) => filteredFiles.includes(fileName))
      .map(([fileName, geoJsonData]) => {
        const filteredFeatures = geoJsonData.features.filter((feature) => {
          if (!feature.geometry) {
            console.warn(`Feature in file "${fileName}" has no geometry. Skipping.`);
            return false;
          }

          const [lng, lat] = feature.geometry.type === "Point"
            ? feature.geometry.coordinates
            : feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon"
            ? feature.geometry.coordinates[0][0]
            : [null, null];

          const isWithinBounds = lat !== null && lng !== null && bounds.contains([lat, lng] as L.LatLngTuple);
          if (!isWithinBounds) {
            console.log(`Feature with coordinates [${lat}, ${lng}] is outside bounds.`);
          }

          return feature.geometry.type !== "GeometryCollection" &&
            lat !== null &&
            lng !== null &&
            Array.isArray(feature.geometry.coordinates) &&
            feature.geometry.coordinates.length >= 2 &&
            isWithinBounds;
        });

        console.log(`Filtered features for file "${fileName}":`, filteredFeatures);

        return {
          fileName,
          geoJsonData: {
            ...geoJsonData,
            features: filteredFeatures,
          },
        };
      });

    console.log("Rendered data to be dispatched:", renderedData);

    // Dispatch the rendered data to Redux
    dispatch(setRenderedMapData(renderedData));
  };

  // Update rendered data whenever map view changes
  useEffect(() => {
    if (!map) {
      console.warn("Map is not initialized. Skipping map event listeners.");
      return;
    }

    console.log("Adding map event listeners for moveend and zoomend.");
    map.on("moveend", extractRenderedData);
    map.on("zoomend", extractRenderedData);

    return () => {
      console.log("Removing map event listeners for moveend and zoomend.");
      map.off("moveend", extractRenderedData);
      map.off("zoomend", extractRenderedData);
    };
  }, [map, data, filteredFiles, filteredProperties]);

  // Used to rerender layers when user resizes the map widget
  useEffect(() => {
    if (!containerRef.current || !map) {
      console.warn("Container or map is not initialized. Skipping resize observer.");
      return;
    }

    console.log("Adding resize observer for map container.");
    const observer = new ResizeObserver(() => {
      console.log("Map container resized. Invalidating map size.");
      map.invalidateSize();
    });

    observer.observe(containerRef.current);

    return () => {
      console.log("Disconnecting resize observer for map container.");
      observer.disconnect();
    };
  }, [map]);

  // Get properties associated with each new file
  useEffect(() => {
    console.log("Extracting properties for each file.");
    setFileProperties(getProperties());
  }, [data]);

  // Extracts unique properties from all the features in a file
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

    console.log("Extracted properties by file:", propertiesByFile);
    return propertiesByFile;
  };

  // Styling for point features on the map
  const pointToLayer = (feature: any, latlng: L.LatLng) => {
    const color = feature.properties?.color || "#3388ff";
    return L.circleMarker(latlng, {
      pane: "markerPane",
      radius: 4,
      color: color,
      fillColor: color,
      opacity: 1,
      fillOpacity: 0.8,
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
    <div
      ref={containerRef}
      style={{
        height: "100%",
        width: "100%",
      }}
      className="position-relative"
    >
      <button
        className="btn btn-light rounded shadow position-absolute top-0 end-0 m-4 translate-x-[-8px]"
        style={{ zIndex: "1000", display: isClicked ? "none" : "block" }}
        onClick={() => data.size > 0 && setIsClicked(!isClicked)}
      >
        <RxLayers />
      </button>
      <div
        className="position-absolute top-0 end-0 m-3 translate-x-[-15px]"
        style={{
          zIndex: 997,
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
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap"
        />

        {Array.from(data)
          .filter(([fileName, _geoJsonData]) =>
            filteredFiles.includes(fileName)
          )
          .map(([fileName, geoJsonData]) => (
            <GeoJSON
              key={`${fileName}-${JSON.stringify(
                filteredProperties[fileName]
              )}`}
              data={geoJsonData}
              pointToLayer={pointToLayer}
              style={geoStyle}
              onEachFeature={(feature, layer) =>
                onEachFeature(feature, layer, fileName)
              }
            />
          ))}
      </MapContainer>
    </div>
  );
};

export default Map;