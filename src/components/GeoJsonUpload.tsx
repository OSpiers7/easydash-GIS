import { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import { useDispatch, useSelector } from 'react-redux';
import { setGeoJsonData } from '../redux/actions';

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
        reader.onload = () => {
          try {
            const result = reader.result;
            if (typeof result === 'string') {
              const parsedData = JSON.parse(result) as FeatureCollection<Geometry, GeoJsonProperties>;
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
      />
      <label htmlFor="upload-geo">Upload Geo</label>
    </>
  );
}

export default UploadGeo;

