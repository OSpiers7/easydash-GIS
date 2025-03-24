import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap styles for UI
import { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import { useDispatch, useSelector } from 'react-redux'; // Use both useDispatch and useSelector
import { setGeoJsonData } from '../redux/actions';  // Import the action

// Define the UploadGeo component
function UploadGeo() {
  // Call the dispatcher to set the action
  const dispatch = useDispatch();

  // Access the geoJsonData from the Redux store
  const geoJsonData = useSelector((state: any) => state.geoJsonData);

  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Get the selected files from the file input
    const selectedFiles = event.target.files;

    // If no files are selected, show an alert
    if (!selectedFiles || selectedFiles.length === 0) {
      alert("Please select at least one GeoJSON file.");
      return;
    }

    // Filter the selected files to include only valid .geojson files
    const validFiles = Array.from(selectedFiles).filter(file => file.name.endsWith(".geojson"));

    // If no valid GeoJSON files are selected, show an alert
    if (validFiles.length === 0) {
      alert("Please upload valid GeoJSON files.");
      return;
    }

    // Create an array of promises that will read each file asynchronously
    const readers = validFiles.map((file) => {
      return new Promise<[string, FeatureCollection<Geometry, GeoJsonProperties>]>((resolve, reject) => {
        const reader = new FileReader(); // Create a new FileReader to read the file

        // When file reading is complete, attempt to parse the file content
        reader.onload = () => {
          try {
            // Ensure `reader.result` is a string
            const result = reader.result;
            if (typeof result === 'string') {
              const parsedData = JSON.parse(result) as FeatureCollection<Geometry, GeoJsonProperties>;
              resolve([file.name, parsedData]); // Resolve the promise with the file name as the key
            } else {
              reject(`Error: file content is not a valid string.`);
            }
          } catch (error) {
            reject(`Error parsing file: ${file.name}`); // Reject the promise if parsing fails
          }
        };

        // If there's an error reading the file, reject the promise
        reader.onerror = () => reject(`Error reading file: ${file.name}`);
        reader.readAsText(file); // Read the file content as text
      });
    });

// Use Promise.all to wait for all file reading and parsing to complete
Promise.all(readers)
  .then((newData) => {
    // Create a new Map with the correct type
    const updatedMap: Map<string, FeatureCollection<Geometry, GeoJsonProperties>> = new Map(geoJsonData);

    // Add new data to the map
    newData.forEach(([fileName, data]) => {
      updatedMap.set(fileName, data); // Set each file's data using its name as the key
    });

    // Dispatch the updated Map to Redux
    dispatch(setGeoJsonData(updatedMap));

    // Log the updated datasets that have been added
    console.log("Updated GeoJSON Data in Redux:", updatedMap);
  })
  .catch((error) => alert(error)); // If any error occurs, show an alert with the error message

  };

  // Render the file upload button
  return (
    <div className="container mt-4"> {/* Bootstrap container for layout */}
      <h1 className="text-light">Upload GeoJSON Files</h1> {/* Heading for the file upload section */}

      {/* File input that allows multiple file selections */}
      <input
        type="file" // File input field
        accept=".geojson,application/geo+json" // Only allow .geojson files
        multiple // Allow selecting multiple files
        onChange={handleFileChange} // Handle file change (i.e., when files are selected)
        className="form-control mt-3" // Apply Bootstrap styling to the file input
      />
    </div>
  );
}

export default UploadGeo; // Export the UploadGeo component
