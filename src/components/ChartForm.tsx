import React, { useState } from "react";
import { FeatureCollection } from "geojson";
import "../styles/ChartForm.css"; // Import the CSS file

interface ChartFormProps {
  data: FeatureCollection;
  onSelect: (xAttr: string, filters: Record<string, string[]>) => void;
}

const ChartForm: React.FC<ChartFormProps> = ({ data, onSelect }) => {
  const [xAttr, setXAttr] = useState<string>("");
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [selectedFilterAttr, setSelectedFilterAttr] = useState<string>("");
  const [uniqueValues, setUniqueValues] = useState<string[]>([]);
  const [showFilterOptions, setShowFilterOptions] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!xAttr) {
      alert("Please select an attribute for the X-Axis.");
      return;
    }
    onSelect(xAttr, filters); // Pass xAttr and filters
  };

  const allProperties = new Set<string>();
  data.features.forEach((feature) => {
    Object.keys(feature.properties || {}).forEach((key) => allProperties.add(key));
  });

  const handleAddFilter = () => {
    setShowFilterOptions(true);
  };

  const handleFilterAttrChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const attr = e.target.value;
    setSelectedFilterAttr(attr);
    if (attr) {
      const uniqueVals = [
        ...new Set(
          data.features.map((feature) => feature.properties ? feature.properties[attr] : null)
        ),
      ];
      setUniqueValues(uniqueVals);
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
      <h3>Configure Chart</h3>
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
      <button type="submit" className="form-button">Create Chart</button>
    </form>
  );
};

export default ChartForm;
