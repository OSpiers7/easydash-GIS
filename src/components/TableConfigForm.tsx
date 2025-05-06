import React, { useState } from "react";
import { Feature } from "geojson";
import { useSelector } from "react-redux";

interface TableConfigFormProps {
  onSelect: (
    xAttr: string,
    yAttr: string,
    filters: Record<string, string[]>,
    includeNulls: boolean,
    buckets?: number
  ) => void;
}

const TableConfigForm: React.FC<TableConfigFormProps> = ({ onSelect }) => {
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSelectedAttributes((prev) =>
      prev.includes(value)
        ? prev.filter((attr) => attr !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Table only needs xAttr (comma-separated attributes), rest are dummies
    onSelect(selectedAttributes.join(","), "", {}, false);
  };

  const ReduxKey = useSelector((state: any) => state.geoJsonDataKey);
  const data = useSelector((state: any) => state.geoJsonData.get(ReduxKey));

  const allAttributes = new Set<string>();
  data?.features?.forEach((feature: Feature) => {
    Object.keys(feature.properties || {}).forEach((key) =>
      allAttributes.add(key)
    );
  });

  return (
    <form onSubmit={handleSubmit}>
      <h3>Select Attributes for Table</h3>
      {[...allAttributes].map((attr) => (
        <label key={attr}>
          <input
            type="checkbox"
            value={attr}
            checked={selectedAttributes.includes(attr)}
            onChange={handleChange}
          />
          {attr}
        </label>
      ))}
      <button type="submit">Create Table</button>
    </form>
  );
};

export default TableConfigForm;
