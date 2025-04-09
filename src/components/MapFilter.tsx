import { useState, useEffect } from "react";

interface MapFilterProps {
  fileNames: string[];
  fileProperties: { [key: string]: string[] };
  onFileFilterSelect: (filteredFiles: string[]) => void;
  onPropertiesFilterSelect: (checkedProperties: { [fileName: string]: string[] }) => void;
}

const MapFilter: React.FC<MapFilterProps> = ({
  fileNames,
  fileProperties,
  onFileFilterSelect,
  onPropertiesFilterSelect,
}) => {
  const [checkedFiles, setCheckedFiles] = useState<string[]>([]);
  const [checkedProperties, setCheckedProperties] = useState<{ [fileName: string]: string[] }>({});
  const [collapsedFiles, setCollapsedFiles] = useState<{ [fileName: string]: boolean }>({});

  // Update file filters after checkedFiles changes
  useEffect(() => {
    onFileFilterSelect(checkedFiles);
  }, [checkedFiles, onFileFilterSelect]);

  // Update properties filter after checkedProperties changes
  useEffect(() => {
    onPropertiesFilterSelect(checkedProperties);
  }, [checkedProperties, onPropertiesFilterSelect]);

  const handleFileCheckboxChange = (fileName: string) => {
    setCheckedFiles((prev) => {
      const updated = prev.includes(fileName)
        ? prev.filter((f) => f !== fileName)
        : [...prev, fileName];
      return updated;
    });
  };

  const handlePropertyCheckboxChange = (fileName: string, property: string) => {
    setCheckedProperties((prevCheckedProperties) => {
      const updatedFileProperties = prevCheckedProperties[fileName] || []; // Ensure it's an array

      let newCheckedProperties;

      if (updatedFileProperties.includes(property)) {
        newCheckedProperties = updatedFileProperties.filter((p) => p !== property);
      } else {
        newCheckedProperties = [...updatedFileProperties, property];
      }

      const updatedProperties = {
        ...prevCheckedProperties,
        [fileName]: newCheckedProperties,
      };

      return updatedProperties;
    });
  };

  const toggleCollapse = (fileName: string) => {
    setCollapsedFiles((prev) => ({
      ...prev,
      [fileName]: !prev[fileName],
    }));
  };

  return (
    <ul className="list-group">
      {fileNames.map((fileName) => (
        <li key={fileName} className="list-group-item">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <input
                className="form-check-input me-2"
                type="checkbox"
                value={fileName}
                id={`checkbox-${fileName}`}
                checked={checkedFiles.includes(fileName)}
                onChange={() => handleFileCheckboxChange(fileName)}
              />
              <label className="form-check-label me-3" htmlFor={`checkbox-${fileName}`}>
                {fileName}
              </label>
            </div>
            {checkedFiles.includes(fileName) && (
              <button
                className="btn btn-sm btn-outline-primary"
                type="button"
                onClick={() => toggleCollapse(fileName)} // Trigger the collapse toggle
              >
                {collapsedFiles[fileName] ? "-" : "+"}
              </button>
            )}
          </div>
          {checkedFiles.includes(fileName) && (
            <div className={`mt-2 ${collapsedFiles[fileName] ? "collapse show" : "collapse"}`}>
              <ul className="list-group">
                {fileProperties[fileName].map((property) => (
                  <div key={`${fileName}-${property}`}>
                    <input
                      className="form-check-input me-2"
                      type="checkbox"
                      value={`${fileName}-${property}`}
                      id={`checkbox-${fileName}-${property}`}
                      checked={checkedProperties[fileName]?.includes(property) || false} // Ensure false if undefined
                      onChange={() => handlePropertyCheckboxChange(fileName, property)}
                    />
                    <label className="form-check-label me-3" htmlFor={`checkbox-${fileName}-${property}`}>
                      {property}
                    </label>
                  </div>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

export default MapFilter;
