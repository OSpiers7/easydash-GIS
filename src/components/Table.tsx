import React, { useState, useEffect } from 'react';

// Define the props for the Table component
interface TableProps {
  geoJsonData: any;
  height: any;
  width: any;
  selectedFeatures: string[]; // Add selectedFeatures prop
}


//USE THIS CODE TO ACCESS THE DATA FROM THE REDUX STORE
//import { useSelector } from 'react-redux';

// Access geoJsonData from Redux state
//const geoJsonData = useSelector((state: any) => state.geoJsonData);








// Define the Table component
function Table({ geoJsonData, height, width, selectedFeatures }: TableProps) {
  const [filters, setFilters] = useState<any>({});
  const [uniqueValues, setUniqueValues] = useState<any>({});

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
  const generateTableHeaders = (features: any[]) => {
    if (features.length > 0) {
      return selectedFeatures.map((key) => (
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
  const generateTableRows = (features: any[]) => {
    return features
      .filter((feature) => {
        return Object.keys(filters).every((key) => {
          const value = feature.properties[key];
          const filterValue = filters[key];
          return !filterValue || value === filterValue;
        });
      })
      .map((feature, index) => (
        <tr key={index}>
          {selectedFeatures.map((key, idx) => (
            <td key={idx} className="text-light">{feature.properties[key] as React.ReactNode}</td>
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
                <tr>{generateTableHeaders(geoJsonData.features)}</tr>
              </thead>
              <tbody>{generateTableRows(geoJsonData.features)}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Table;
