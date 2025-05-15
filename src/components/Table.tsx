import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

// Define the props for the Table component
interface TableProps {
  selectedFeatures: string; // Add selectedFeatures prop
  geoJsonKey: string;
  useRenderedData: boolean; // New prop to determine which data to use
}

// Define the Table component
function Table({ selectedFeatures, geoJsonKey, useRenderedData }: TableProps) {
  const [filters, setFilters] = useState<any>({});
  const [uniqueValues, setUniqueValues] = useState<any>({});

  // Conditionally fetch data from Redux store based on the `useRenderedData` prop
  const geoJsonData = useSelector((state: any) => {
    if (useRenderedData) {
      // Check if renderedMapData and its first element are defined
      if (state.renderedMapData && state.renderedMapData[0]?.geoJsonData) {
        return state.renderedMapData[0].geoJsonData;
      } else {
        console.error("Rendered map data is not available.");
        return null; // Return null if rendered data is not available
      }
    } else {
      return state.geoJsonData.get(geoJsonKey); // Use the entire dataset
    }
  });

  // Split the selectedFeatures string into an array of attributes
  const selectedAttributes = selectedFeatures.split(",");

  // Function to extract unique values from each column
  useEffect(() => {
    if (geoJsonData && geoJsonData.features) {
      const uniqueVals: any = {};
      Object.keys(geoJsonData.features[0].properties).forEach((key) => {
        uniqueVals[key] = [
          ...new Set(
            geoJsonData.features.map((feature: any) => feature.properties[key])
          ),
        ];
      });
      setUniqueValues(uniqueVals);
    }
  }, [geoJsonData]);

  // Handle filter change for each column
  const handleFilterChange = (column: string, value: string) => {
    setFilters({
      ...filters,
      [column]: value,
    });
  };

  // Generate table headers, including filters
  const generateTableHeaders = () => {
    if (selectedAttributes.length > 0) {
      return selectedAttributes.map((key) => (
        <th key={key} className="text-light">
          {key}
          <select
            className="form-control form-control-sm"
            value={filters[key] || ""}
            onChange={(e) => handleFilterChange(key, e.target.value)}
          >
            <option value="">All</option>
            {uniqueValues[key]?.map((value: string, index: number) => (
              <option key={index} value={value}>
                {value}
              </option>
            ))}
          </select>
        </th>
      ));
    }
    return null;
  };

  // Generate table rows based on filters
  const generateTableRows = () => {
    return geoJsonData?.features
      ?.filter((feature: any) => {
        return selectedAttributes.every((key: string) => {
          const value = feature.properties[key];
          const filterValue = filters[key];
          return !filterValue || value === filterValue;
        });
      })
      .slice(0, 75)
      .map((feature: any, index: number) => (
        <tr key={index}>
          {selectedAttributes.map((key: string, idx: number) => (
            <td key={idx} className="text-light">
              {feature.properties[key]}
            </td>
          ))}
        </tr>
      ));
  };

  return (
    <div className="container mt-0" style={{ width: "100%", height: "100%" }}>
      {geoJsonData && geoJsonData.features?.length > 0 ? (
        <div className="mt-0" style={{ width: "100%", height: "100%" }}>
          <div
            className="table-responsive"
            style={{
              width: "100%",
              height: "100%",
              overflowY: "auto", // Enable scrolling if table exceeds available space
            }}
          >
            <table
              className="table table-dark table-bordered table-hover table-sm"
              style={{
                width: "100%", // Ensure the table takes up full width
                height: "100%", // Ensure the table takes up full height
              }}
            >
              <thead className="bg-secondary">
                <tr>{generateTableHeaders()}</tr>
              </thead>
              <tbody>{generateTableRows()}</tbody>
            </table>
          </div>
        </div>
      ) : (
        <p>No data available to display.</p>
      )}
    </div>
  );
}

export default Table;
