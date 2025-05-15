import { useState, useEffect, useRef } from "react";

interface MapFilterProps {
  fileProperties: { [key: string]: string[] };
  fileNames: string[];
  onFileFilterSelect: (filteredFiles: string[]) => void;
  onPropertiesFilterSelect: (checkedProperties: { [key: string]: string[] }) => void;
  isVisible: boolean;
  selectedFiles?: string[]; // Add this prop to accept selected files from parent
}

const MapFilter: React.FC<MapFilterProps> = ({
  fileNames,
  fileProperties,
  onFileFilterSelect,
  onPropertiesFilterSelect,
  isVisible,
  selectedFiles,
}) => {
  const [checkedFiles, setCheckedFiles] = useState<string[]>([]);
  const [checkedProperties, setCheckedProperties] = useState<{ [fileName: string]: string[] }>({});
  const [collapsedFiles, setCollapsedFiles] = useState<{ [fileName: string]: boolean }>({});

  useEffect(() => {
    onFileFilterSelect(checkedFiles);
  }, [checkedFiles, onFileFilterSelect]);

  useEffect(() => {
    onPropertiesFilterSelect(checkedProperties);
  }, [checkedProperties, onPropertiesFilterSelect]);

  // Reset collapse state when visibility changes
  useEffect(() => {
    if (!isVisible) {
      setCollapsedFiles((prev) => {
        const resetState: { [fileName: string]: boolean } = {};
        fileNames.forEach((fileName) => {
          resetState[fileName] = false; // Force collapse (set to "+")
        });
        return resetState;
      });
    }
  }, [isVisible, fileNames]); // Run whenever isVisible changes

  // Reset collapse state when visibility changes
  useEffect(() => {
    if (!isVisible) {
      setCollapsedFiles((prev) => {
        const resetState: { [fileName: string]: boolean } = {};
        fileNames.forEach((fileName) => {
          resetState[fileName] = false; // Force collapse (set to "+")
        });
        return resetState;
      });
    }
  }, [isVisible, fileNames]); // Run whenever isVisible changes

  // Add a useEffect to sync with parent component's filteredFiles
  useEffect(() => {
    // If the parent component has already selected files, use those
    if (selectedFiles && selectedFiles.length > 0) {
      setCheckedFiles(selectedFiles);
    }
  }, [selectedFiles]);

  const handleFileCheckboxChange = (fileName: string, ) => {
    setCheckedFiles((prev) => {
      const updated = prev.includes(fileName)
        ? prev.filter((f) => f !== fileName)
        : [...prev, fileName];
      return updated;
    });
  };

  const handlePropertyCheckboxChange = (fileName: string, property: string) => {
    setCheckedProperties((prevCheckedProperties) => {
      const updatedFileProperties = prevCheckedProperties[fileName] || [];

      const newCheckedProperties = updatedFileProperties.includes(property)
        ? updatedFileProperties.filter((p) => p !== property)
        : [...updatedFileProperties, property];

      return {
        ...prevCheckedProperties,
        [fileName]: newCheckedProperties,
      };
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
      {fileNames.map((fileName) => {
        const contentRef = useRef<HTMLDivElement>(null);
        const isOpen = collapsedFiles[fileName];

        return (
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
                  onClick={() => toggleCollapse(fileName)}
                >
                  {isOpen ? "-" : "+"}
                </button>
              )}
            </div>
            {checkedFiles.includes(fileName) && (
              <div
                ref={contentRef}
                style={{
                  overflow: "hidden",
                  transition: "max-height 0.3s ease",
                  maxHeight: isOpen
                    ? contentRef.current?.scrollHeight + "px"
                    : "0px",
                }}
                className="mt-2"
              >
                <ul className="list-group">
                  {fileProperties[fileName].map((property) => (
                    <li key={`${fileName}-${property}`}>
                      <input
                        className="form-check-input me-2"
                        type="checkbox"
                        value={`${fileName}-${property}`}
                        id={`checkbox-${fileName}-${property}`}
                        checked={checkedProperties[fileName]?.includes(property) || false}
                        onChange={() => handlePropertyCheckboxChange(fileName, property)}
                      />
                      <label
                        className="form-check-label me-3"
                        htmlFor={`checkbox-${fileName}-${property}`}
                      >
                        {property}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default MapFilter;
