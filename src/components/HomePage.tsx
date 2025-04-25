import HomeTopBanner from "./HomeTopBanner";
import "../Dashboard.css";
import Modal from "./Modal";

import { useDispatch } from 'react-redux';  // Import useDispatch
import { useSelector } from 'react-redux';
import { useEffect, useState } from "react";
import { setSaveName, setSaveState } from "../redux/actions";
import { supabase } from "../supabaseClient";

interface HomePageProps {
    onSelectDashboard: (key: string) => void;
}
  
const HomePage: React.FC<HomePageProps> = ({ onSelectDashboard }) => {
    const [keys, setKeys] = useState<string[]>([]);

    const dispatch = useDispatch();
    // Access the saveState from the Redux store
    const SaveState = useSelector((state: any) => state.saveState);

    // Remove the selected key from local storage
    const handleDeleteKey = async (keyToDelete: string) => {
        // Remove from localStorage
        localStorage.removeItem(keyToDelete);

        // Remove from Supabase storage
        const { error } = await supabase.storage
            .from('dashboards')
            .remove([`${keyToDelete}.json`, `${keyToDelete}.png`]);

        if (error) {
            console.error('Error deleting from Supabase:', error);
            return;
        }

        setKeys((prevKeys) => prevKeys.filter((key) => key !== keyToDelete));
    };

    // Update the selected key in the Redux store
    const handleButtonClick = (key: string) => {
        if(key === "DefaultValue") {
          onSelectDashboard(key); // Make a new dashboard with default values
          dispatch(setSaveState(""));
          dispatch(setSaveName(""));
          return;
        }
        dispatch(setSaveState("load"));
        dispatch(setSaveName(key));
        onSelectDashboard(key); // Navigate to dashboard
    };

    // Access the dashboard names from the Redux store
    useEffect(() => {
        const getAllLocalStorageKeys = () => {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && !key.startsWith('sb-')) {
                keys.push(key);
              }
            }
            return keys;
        };

        setKeys(getAllLocalStorageKeys());
    }, []);

    // Update the keys when data is pulled from the database
    useEffect(() => {
      if (SaveState[0] === 'sync') {
        const updateLocalStorageKeys = () => {
          const keys = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && !key.startsWith('sb-')) {
              keys.push(key);
            }
          }
          setKeys(keys);
        };
    
        updateLocalStorageKeys();
      }
    }, [SaveState]);

  return (
    <div className="dashboard">
      <HomeTopBanner />
      <div className="button-container">
        <button
          className="storage-button"
          onClick={() => handleButtonClick("DefaultValue")}
        >
          +
        </button>
        {keys.map((key, index) => (
          <div key={key} style={{ position: "relative", display: "inline-block" }}>
            <button
              className="storage-button"
              onClick={() => handleButtonClick(key)}
            >
              {key}
            </button>
            <button
              className="delete-button"
              onClick={() => handleDeleteKey(key)}
              title={`Delete "${key}"`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;