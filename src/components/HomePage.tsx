import HomeTopBanner from "./HomeTopBanner";
import "../Dashboard.css";
import Modal from "./Modal";

import { useDispatch } from 'react-redux';  // Import useDispatch
import { useSelector } from 'react-redux';
import { useEffect, useState } from "react";
import { setSaveName, setSaveState } from "../redux/actions";

interface HomePageProps {
    onSelectDashboard: (key: string) => void;
}
  
const HomePage: React.FC<HomePageProps> = ({ onSelectDashboard }) => {
    const [keys, setKeys] = useState<string[]>([]);

    const dispatch = useDispatch();

    // Remove the selected key from local storage
    const handleDeleteKey = (keyToDelete: string) => {
        localStorage.removeItem(keyToDelete);
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

    // Access the dashboard keys from the Redux store
    useEffect(() => {
        const getAllLocalStorageKeys = () => {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) keys.push(key);
            }
            return keys;
        };

        setKeys(getAllLocalStorageKeys());
    }, []);

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
        onClick={() => handleDeleteKey(key)}
        style={{
          position: "absolute",
          top: "5px",
          right: "5px",
          background: "red",
          color: "white",
          borderRadius: "50%",
          border: "none",
          width: "20px",
          height: "20px",
          cursor: "pointer",
          fontSize: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
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