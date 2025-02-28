import React, { useState, useEffect } from 'react';
//set up table data props
interface TableProps {
  geoJsonData: any;
  height: any;
  width: any;
}
//call the props
function Table({ geoJsonData, height, width }: TableProps) {
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
      return Object.keys(features[0].properties).map((key) => (
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
          {Object.values(feature.properties).map((value, idx) => (
            <td key={idx} className="text-light">{value as React.ReactNode}</td>
          ))}
        </tr>
      ));
  };

  return (
    <div className="container mt-0">
      {geoJsonData && geoJsonData.features?.length > 0 && (
        <div className="mt-0">
          <div className="table-responsive" style={{ maxHeight: height - 30, maxWidth: width - 10, overflowY: "auto" }}>
            <table className="table table-dark table-bordered table-hover table-sm">
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
