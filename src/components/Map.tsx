import { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapProps {
  geoJsonData: GeoJSON.FeatureCollection;
}

//Circle Marker Styling
const geojsonMarkerOptions: L.CircleMarkerOptions = {
  radius: 4,
  fillOpacity: 1,
};

const Map: React.FC<MapProps> = ({ geoJsonData }) => {
    //Used for properly centering the map
    const [center, setCenter] = useState<L.LatLng | null>(null);
    useEffect(() => {
        if (geoJsonData.features.length > 0) {
          const firstFeature = geoJsonData.features[0];
          if (firstFeature.geometry.type === "Point") {
            const [lng, lat] = firstFeature.geometry.coordinates;
            setCenter(new L.LatLng(lat, lng)); // Set the map center based on the first feature
          } else if (firstFeature.geometry.type === "Polygon" || firstFeature.geometry.type === "MultiPolygon") {
            // If the geometry is a polygon, you can compute the center of the bounds
            const bounds = L.geoJSON(firstFeature).getBounds();
            setCenter(bounds.getCenter());
          }
        }
        setGeoJsonKey((prevKey) => prevKey + 1);
      }, [geoJsonData]);

    //Used for setting unique keys and allowing dynamic reload of map
    const [geoJsonKey, setGeoJsonKey] = useState(0);
    useEffect(() => {
        setGeoJsonKey((prevKey) => prevKey + 1);
    }, [geoJsonData]);
    
    //Convert point features into Leaflet circle markers
    const pointToLayer = (_feature: any, latlng: L.LatLng) => {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    };

    //Bind popups to each feature
    const onEachFeature = (feature: any, layer: L.Layer) => {
    if (feature.properties) {
      let popUpContent = "";
      for (const key in feature.properties) {
        popUpContent += `<p>${key}: ${feature.properties[key]}</p>`;
      }
      layer.bindPopup(popUpContent);
    }
    };

    //Centers the map to the uploaded geoJson data
    const MapCenterUpdater = () => {
        const map = useMap();
        useEffect(() => {
          if (center) {
            map.setView(center, map.getZoom(), { animate: true });
          }
        }, [center, map]);
    
        return null;
      };

  //Returned MapContainer
  return (
    <MapContainer
      center={[37.0902, -95.7129]}
      zoom={7}
      minZoom={3}
      maxZoom={19}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        noWrap={true}
        maxZoom={19}
      />
      {geoJsonData && (
        <GeoJSON
            key={geoJsonKey}
            data={geoJsonData} 
            pointToLayer={pointToLayer} 
            onEachFeature={onEachFeature} 
        />
      )}
      <MapCenterUpdater />
    </MapContainer>
  );
};

export default Map;
