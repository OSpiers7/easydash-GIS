import React, { useState } from "react";
import { Feature } from "geojson";
import "../styles/App.css"; // Import the CSS file
import { useSelector } from "react-redux";

interface ChartFormProps {
  onSelect: (
    xAttr: string,
    yAttr: string,
    filters: Record<string, string[]>,
    includeNulls: boolean,
    buckets?: number
  ) => void;
}

const ChartForm: React.FC<ChartFormProps> = ({ onSelect }) => {
  const [xAttr, setXAttr] = useState<string>("");
  const [yAttr, setYAttr] = useState<string>("count"); // State for yAttr
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [selectedFilterAttr, setSelectedFilterAttr] = useState<string>("");
  const [uniqueValues, setUniqueValues] = useState<string[]>([]);
  const [showFilterOptions, setShowFilterOptions] = useState<boolean>(false);
  const [includeNulls, setIncludeNulls] = useState<boolean>(false); // State for the switch
  const [showSlider, setShowSlider] = useState<boolean>(false); // State to show/hide the slider
  const [buckets, setBuckets] = useState<number>(10); // State for the number of buckets

  const ReduxKey = useSelector((state: any) => state.geoJsonDataKey);
  const data = useSelector((state: any) => state.geoJsonData.get(ReduxKey));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!xAttr) {
      alert("Please select an attribute for the X-Axis.");
      return;
    }
    onSelect(xAttr, yAttr, filters, includeNulls, showSlider ? buckets : undefined); // Pass yAttr and buckets
  };

  const allProperties = new Set<string>();
  const numericalProperties = new Set<string>(); // Track numerical attributes
  data.features.forEach((feature: Feature) => {
    Object.keys(feature.properties || {}).forEach((key) => {
      allProperties.add(key);
      const value = feature.properties?.[key];
      if (typeof value === "number") {
        numericalProperties.add(key); // Add to numerical properties if the value is a number
      }
    });
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

  const handleXAttrChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const attr = e.target.value;
    setXAttr(attr);

    if (attr) {
      // Check if the attribute is numerical or time data
      const uniqueVals: (string | number | null | undefined)[] = Array.from(
        new Set(
          data.features
            .map((feature: Feature) => feature.properties?.[attr])
            .filter(
              (val: string | number | null | undefined): val is string | number | null | undefined =>
                val !== undefined && val !== null
            ) // Exclude null/undefined values
        )
      );

      const isNumericalOrTime = uniqueVals.every(
        (val) => typeof val === "number" || !isNaN(Date.parse(val as string))
      );

      // Show the slider only if xAttr is numerical or time data and yAttr is "count"
      if (isNumericalOrTime && uniqueVals.length > 25 && yAttr === "count") {
        setShowSlider(true); // Show the slider if conditions are met
      } else {
        setShowSlider(false); // Hide the slider otherwise
      }
    }
  };

  const handleYAttrChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const attr = e.target.value;
    setYAttr(attr);

    // Reevaluate whether to show the slider based on the new yAttr value
    if (xAttr) {
      const uniqueVals: (string | number | null | undefined)[] = Array.from(
        new Set(
          data.features
            .map((feature: Feature) => feature.properties?.[xAttr])
            .filter(
              (val: string | number | null | undefined): val is string | number | null | undefined =>
                val !== undefined && val !== null
            ) // Exclude null/undefined values
        )
      );

      const isNumericalOrTime = uniqueVals.every(
        (val) => typeof val === "number" || !isNaN(Date.parse(val as string))
      );

      // Show the slider only if xAttr is numerical or time data and yAttr is "count"
      if (isNumericalOrTime && uniqueVals.length > 25 && attr === "count") {
        setShowSlider(true); // Show the slider if conditions are met
      } else {
        setShowSlider(false); // Hide the slider otherwise
      }
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBuckets(parseInt(e.target.value, 10)); // Update the number of buckets
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

  const handleSwitchChange = () => {
    setIncludeNulls((prev) => !prev); // Toggle the switch state
  };

  return (
    <form onSubmit={handleSubmit} className="chart-form">
      <h3>Chart Configuration</h3>
      <label className="form-label">
        X-Axis Attribute:
        <select value={xAttr} onChange={handleXAttrChange} className="form-select">
          <option value="">Select an attribute</option>
          {[...allProperties].map((prop) => (
            <option key={prop} value={prop}>
              {prop}
            </option>
          ))}
        </select>
      </label>

      <label className="form-label">
        Y-Axis Attribute:
        <select value={yAttr} onChange={handleYAttrChange} className="form-select">
          <option value="count">Count</option>
          {[...numericalProperties].map((prop) => (
            <option key={prop} value={`sum of ${prop}`}>
              Sum of {prop}
            </option>
          ))}
        </select>
      </label>

      {/* Slider for bucket selection */}
      {showSlider && (
        <div className="form-slider">
          <label>
            Number of Buckets: {buckets}
            <input
              type="range"
              min="2"
              max="25"
              value={buckets}
              onChange={handleSliderChange}
            />
          </label>
        </div>
      )}

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

      {/* Switch for including/excluding null values */}
      <div className="form-switch">
        <label>
          <input
            type="checkbox"
            checked={includeNulls}
            onChange={handleSwitchChange}
          />
          Include Null Values
        </label>
      </div>

      <button type="submit" className="form-button">Create Chart</button>
    </form>
  );
};

export default ChartForm;
