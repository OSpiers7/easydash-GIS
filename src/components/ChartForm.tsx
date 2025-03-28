import React, { useState } from "react";
import { Feature, FeatureCollection } from "geojson";
import "../styles/App.css"; // Import the CSS file
import { useSelector } from 'react-redux';


interface ChartFormProps {
  onSelect: (xAttr: string, filters: Record<string, string[]>) => void;
}

const ChartForm: React.FC<ChartFormProps> = ({ onSelect }) => {
  const [xAttr, setXAttr] = useState<string>("");
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [selectedFilterAttr, setSelectedFilterAttr] = useState<string>("");
  const [uniqueValues, setUniqueValues] = useState<string[]>([]);
  const [showFilterOptions, setShowFilterOptions] = useState<boolean>(false);

 
  const ReduxKey = useSelector((state: any) => state.geoJsonDataKey);
  const data = useSelector((state: any) => state.geoJsonData.get(ReduxKey));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!xAttr) {
      alert("Please select an attribute for the X-Axis.");
      return;
    }
    onSelect(xAttr, filters); // Pass xAttr and filters
  };

  const allProperties = new Set<string>();
  data.features.forEach((feature: Feature) => {
    Object.keys(feature.properties || {}).forEach((key) => allProperties.add(key));
  });

  const handleAddFilter = () => {
    setShowFilterOptions(true);
  };

  const handleFilterAttrChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const attr = e.target.value;
    setSelectedFilterAttr(attr);
  
    if (attr) {
      const uniqueVals = Array.from(
        new Set(
          data.features
            .map((feature: Feature) => feature.properties?.[attr])
            .filter((val: unknown): val is string => typeof val === "string") // Ensure only strings
        )
      ) as string[]; // Explicitly cast to string[]
  
      setUniqueValues(uniqueVals); // Now TypeScript knows it's a string[]
      setFilters((prevFilters) => ({
        ...prevFilters,
        [attr]: [],
      }));
    }
  };
  

  const handleFilterChange = (attr: string, value: string) => {
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters };
      if (newFilters[attr]?.includes(value)) {
        newFilters[attr] = newFilters[attr].filter((v) => v !== value);
      } else {
        newFilters[attr] = [...(newFilters[attr] || []), value];
      }
      return newFilters;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="chart-form">
      <h3>Chart Configuration</h3>
      <label className="form-label">
        X-Axis Attribute:
        <select value={xAttr} onChange={(e) => setXAttr(e.target.value)} className="form-select">
          <option value="">Select an attribute</option>
          {[...allProperties].map((prop) => (
            <option key={prop} value={prop}>
              {prop}
            </option>
          ))}
        </select>
      </label>
      <button type="button" onClick={handleAddFilter} className="form-button">
        Add Filter
      </button>
      {showFilterOptions && (
        <>
          <label className="form-label">
            Filter Attribute:
            <select
              value={selectedFilterAttr}
              onChange={handleFilterAttrChange}
              className="form-select"
            >
              <option value="">Select an attribute</option>
              {[...allProperties].map((prop) => (
                <option key={prop} value={prop}>
                  {prop}
                </option>
              ))}
            </select>
          </label>
          {selectedFilterAttr && (
            <div className="filter-values">
              <h4>Filter Values for {selectedFilterAttr}</h4>
              {uniqueValues.map((value) => (
                <label key={value} className="form-checkbox">
                  <input
                    type="checkbox"
                    value={value}
                    checked={filters[selectedFilterAttr]?.includes(value) || false}
                    onChange={() => handleFilterChange(selectedFilterAttr, value)}
                  />
                  {value}
                </label>
              ))}
            </div>
          )}
        </>
      )}
      
      <button type="submit" className="form-button">Create Chart</button>
    </form>
  );
};

export default ChartForm;
