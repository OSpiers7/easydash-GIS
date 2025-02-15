import React, { useState } from "react";
import { FeatureCollection } from "geojson";

interface ChartFormProps {
  data: FeatureCollection;
  onSelect: (xAttr: string, yAttr: string) => void;
}

const ChartForm: React.FC<ChartFormProps> = ({ data, onSelect }) => {
  const [xAttr, setXAttr] = useState<string>("");

  // Extract all unique property keys from the GeoJSON features
  const allProperties = new Set<string>();
  data.features.forEach((feature) => {
    Object.keys(feature.properties || {}).forEach((key) => allProperties.add(key));
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (xAttr) {
      onSelect(xAttr, "count");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label>
        X-Axis Attribute:
        <select value={xAttr} onChange={(e) => setXAttr(e.target.value)}>
          <option value="">Select an attribute</option>
          {[...allProperties].map((prop) => (
            <option key={prop} value={prop}>
              {prop}
            </option>
          ))}
        </select>
      </label>

      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
        Generate Chart
      </button>
    </form>
  );
};

export default ChartForm;
