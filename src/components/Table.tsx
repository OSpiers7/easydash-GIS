import React, { useState, useEffect } from 'react';

//USE THIS CODE TO ACCESS THE DATA FROM THE REDUX STORE
import { useSelector } from 'react-redux';

// Define the props for the Table component
interface TableProps {
  selectedFeatures: string; // Add selectedFeatures prop
  geoJsonKey: string;
}

// Access geoJsonData from Redux state
//const geoJsonData = useSelector((state: any) => state.geoJsonData);
// Define the Table component
function Table({ selectedFeatures, geoJsonKey }: TableProps) {



  const [filters, setFilters] = useState<any>({});
  const [uniqueValues, setUniqueValues] = useState<any>({});

  const ReduxKey = useSelector((state: any) => state.geoJsonDataKey);
  const geoJsonData = useSelector((state: any) => state.geoJsonData.get(geoJsonKey));

  // Split the selectedFeatures string into an array of attributes
  const selectedAttributes = selectedFeatures.split(',');

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
            value={filters[key] || ''}
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
    return geoJsonData.features
      .filter((feature: any) => {
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
    <div className="container mt-0" style={{ width: '100%', height: '100%' }}>
      {geoJsonData && geoJsonData.features?.length > 0 && (
        <div className="mt-0" style={{ width: '100%', height: '100%' }}>
          <div 
            className="table-responsive"
            style={{
              width: '100%',
              height: '100%',
              overflowY: 'auto', // Enable scrolling if table exceeds available space
            }}
          >
            <table
              className="table table-dark table-bordered table-hover table-sm"
              style={{
                width: '100%',  // Ensure the table takes up full width
                height: '100%', // Ensure the table takes up full height
               // tableLayout: 'fixed', // Ensures consistent column widths
               //overflowY: 'auto',
              }}
            >
              <thead className="bg-secondary">
                <tr>{generateTableHeaders()}</tr>
              </thead>
              <tbody>{generateTableRows()}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Table;
