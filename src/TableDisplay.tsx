import React from "react"; // Import React
import { FeatureCollection, Feature } from "geojson"; // Import types from geojson

// Define the props interface for the component
interface GeoJSONTableProps {
  data: FeatureCollection | null; // The data prop can be a FeatureCollection or null
}

// Define the functional component
const GeoJSONTable: React.FC<GeoJSONTableProps> = ({ data }) => {
  // If no data or features are available, display a message
  if (!data || data.features.length === 0) {
    return <p>No GeoJSON data available.</p>;
  }

  // Extract all unique property keys from the features
  const propertyKeys = Array.from(
    new Set(
      data.features.flatMap((feature) => Object.keys(feature.properties || {}))
    )
  );

  return (
    <div className="overflow-x-auto">
      {/* Create a table with a minimum width and border */}
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          {/* Table header row with background color */}
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">ID</th>
            <th className="border border-gray-300 px-4 py-2">Type</th>
            <th className="border border-gray-300 px-4 py-2">Coordinates</th>
            {/* Dynamically generate table headers for each property key */}
            {propertyKeys.map((key) => (
              <th key={key} className="border border-gray-300 px-4 py-2">
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Iterate over each feature in the data */}
          {data.features.map((feature: Feature, index: number) => (
            <tr key={index} className="border border-gray-300">
              <td className="border border-gray-300 px-4 py-2">
                {feature.id ?? "N/A"}{" "}
                {/* Display feature ID or "N/A" if not available */}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {feature.geometry.type} {/* Display geometry type */}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {"coordinates" in feature.geometry
                  ? JSON.stringify(feature.geometry.coordinates) // Display coordinates
                  : "N/A"}
              </td>
              {/* Dynamically generate table cells for each property key */}
              {propertyKeys.map((key) => (
                <td key={key} className="border border-gray-300 px-4 py-2">
                  {feature.properties && key in feature.properties
                    ? JSON.stringify(feature.properties[key]) // Display property value
                    : "N/A"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GeoJSONTable; // Export the component as default
