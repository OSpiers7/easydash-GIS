import { useState } from "react"; // Importing useState hook from React to manage component state
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap styles

//Parent to Table.tsx

//creates the setter prop
interface UploadProps {
  setGeoJsonData: any;
}
//have the setter prop 
function UploadGeo({ setGeoJsonData }: UploadProps) {
  const [file, setFile] = useState<File | null>(null);
  

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile && selectedFile.name.endsWith(".geojson")) {
      setFile(selectedFile);
      const reader = new FileReader();

      reader.onload = () => {
        try {
          const parsedData = JSON.parse(reader.result as string);
          //setter prop gets called
          setGeoJsonData(parsedData);
        } catch (error) {
          alert("Error parsing the GeoJSON file.");
        }
      };

      reader.onerror = () => alert("Error reading the file.");
      reader.readAsText(selectedFile);
    } else {
      alert("Please upload a valid GeoJSON file.");
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-light">Upload GeoJSON File</h1>
      
      <input
        type="file"
        accept=".geojson,application/geo+json"
        onChange={handleFileChange}
        className="form-control mt-3"
      />

      {file && <p className="text-light mt-2">Uploaded file: {file?.name}</p>}
      {/* Pass geoJsonData to ChildComponent as a prop */}
      
      
    </div>
  );
}

export default UploadGeo;
