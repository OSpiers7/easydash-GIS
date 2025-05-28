import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { supabase } from '../supabaseClient';
import { setGeoJsonData } from '../redux/actions';
import { useState } from 'react';

// Memoized selector
const selectGeoJsonData = createSelector(
  (state: { geoJsonData: Map<string, any> }) => state.geoJsonData,
  geoJsonData => geoJsonData
);

function DataRemove() {
  const geoJsonData = useSelector(selectGeoJsonData);
  const dispatch = useDispatch();
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const key = event.target.value;
    setSelectedKeys(prev => {
      const updated = new Set(prev);
      if (updated.has(key)) {
        updated.delete(key);
      } else {
        updated.add(key);
      }
      return updated;
    });
  };

  const handleDelete = async () => {
    if (selectedKeys.size === 0) {
      alert("Please select at least one entry to delete.");
      return;
    }

    const updatedMap = new Map(geoJsonData); // Start with the current map
    let atLeastOneDeleted = false;

    for (const key of selectedKeys) {
      const { error } = await supabase.storage.from('datasets').remove([key]);
      if (error) {
        console.error(`Error removing ${key}:`, error.message);
        alert(`Failed to delete: ${key}`);
        continue;
      }
      updatedMap.delete(key); // Delete the key from the map
      atLeastOneDeleted = true;
    }

    if (atLeastOneDeleted) {
      dispatch(setGeoJsonData(updatedMap)); // Dispatch the new map to Redux
      console.log("Updated GeoJSON Data in Redux:", updatedMap); // Log the updated map for debugging
      setSelectedKeys(new Set());
    }
  };

  const checkboxes = Array.from(geoJsonData.keys()).map(key => (
    <div key={key}>
      <label htmlFor={key}>
        <input
          type="checkbox"
          id={key}
          value={key}
          checked={selectedKeys.has(key)}
          onChange={handleCheckboxChange}
        />
        {key}
      </label>
    </div>
  ));

  return (
    <form>
      {checkboxes}
      <button type="button" onClick={handleDelete}>Remove Selected</button>
    </form>
  );
}

export default DataRemove;
