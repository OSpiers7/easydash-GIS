import { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import { useDispatch, useSelector } from 'react-redux';
import { setGeoJsonData } from '../redux/actions';
import { supabase } from '../supabaseClient';

function UploadGeo() {
  const dispatch = useDispatch();
  const geoJsonData = useSelector((state: any) => state.geoJsonData);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) {
      alert("Please select at least one GeoJSON file.");
      return;
    }

    const validFiles = Array.from(selectedFiles).filter(file => file.name.endsWith(".geojson"));
    if (validFiles.length === 0) {
      alert("Please upload valid GeoJSON files.");
      return;
    }

    const readers = validFiles.map((file) => {
      return new Promise<[string, FeatureCollection<Geometry, GeoJsonProperties>]>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const result = reader.result;
            if (typeof result === 'string') {
              const parsedData = JSON.parse(result) as FeatureCollection<Geometry, GeoJsonProperties>;

              // Upload to Supabase (replace if exists)
              const blob = new Blob([JSON.stringify(parsedData)], { type: 'application/geo+json' });

              // Upload data to Supabase
              const { error: uploadError } = await supabase.storage
                .from('datasets')
                .upload(file.name, blob, {
                  contentType: 'application/geo+json',
                  upsert: true, // tag to overwrite if file already exists
                });
              if (uploadError) {
                console.error(`Failed to upload ${file.name}:`, uploadError);
                reject(uploadError.message);
              }

              resolve([file.name, parsedData]);
            } else {
              reject(`Error: file content is not a valid string.`);
            }
          } catch (error) {
            reject(`Error parsing file: ${file.name}`);
          }
        };
        reader.onerror = () => reject(`Error reading file: ${file.name}`);
        reader.readAsText(file);
      });
    });

    Promise.all(readers)
      .then((newData) => {
        const updatedMap: Map<string, FeatureCollection<Geometry, GeoJsonProperties>> = new Map(geoJsonData);
        newData.forEach(([fileName, data]) => updatedMap.set(fileName, data));
        dispatch(setGeoJsonData(updatedMap));
        console.log("Updated GeoJSON Data in Redux:", updatedMap);
      })
      .catch((error) => alert(error));
  };

  return (
    <>
      <input
        type="file"
        accept=".geojson,application/geo+json"
        multiple
        onChange={handleFileChange}
        id="upload-geo"
        style={{ display: "none" }}
      />
      <label
        htmlFor="upload-geo"
        style={{
          display: "inline-block",
          backgroundColor: "gray",
          color: "white",
          padding: "10px 20px",
          borderRadius: "5px",
          cursor: "pointer",
          textAlign: "center",
        }}
      >
        Upload Geo
      </label>
    </>
  );
}

export default UploadGeo;

