import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap styles for UI
import { FeatureCollection, Feature, Geometry, GeoJsonProperties } from 'geojson';

import { useDispatch } from 'react-redux';
import { setGeoJsonData } from '../redux/actions';  // Import the action


// Define the UploadGeo component
function UploadGeo() {
//CALL THE DISPATCHER TO SET THE ACTION
  const dispatch = useDispatch();
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
      return new Promise((resolve, reject) => {
        const reader = new FileReader(); // Create a new FileReader to read the file

        // When file reading is complete, attempt to parse the file content
        reader.onload = () => {

          try {
            // Ensure `reader.result` is a string
            const result = reader.result;
            if (typeof result === 'string') {
              const parsedData = JSON.parse(result) as FeatureCollection<Geometry, GeoJsonProperties>;
              resolve(parsedData); // Resolve the promise with parsed data
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
//REDUX TO DISPATCH TO THE SETGEOJSONDATA INSIDFE OF ACTIONS
        dispatch(setGeoJsonData({
          type: 'FeatureCollection',
          features: newData.flatMap((data) => (data as FeatureCollection<Geometry, GeoJsonProperties>).features)
        }));  

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
