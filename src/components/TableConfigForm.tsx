import React, { useState } from "react";
import { FeatureCollection } from "geojson";

interface TableConfigFormProps {
  data: FeatureCollection;
  onSelect: (attributes: string) => void;
}

const TableConfigForm: React.FC<TableConfigFormProps> = ({ data, onSelect }) => {
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
    onSelect(selectedAttributes.join(",")); // Pass comma-separated attributes
  };

  const allAttributes = new Set<string>();
  data.features.forEach((feature) => {
    Object.keys(feature.properties || {}).forEach((key) => allAttributes.add(key));
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