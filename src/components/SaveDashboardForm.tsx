import React, { useState } from "react";
import { useDispatch } from 'react-redux';  // Import useDispatch
import { setSaveName } from '../redux/actions'; // Import the action creators
import "../styles/WidgetSelectionForm.css"; // Import the CSS file for styling

interface SaveDashboardFormProps {
  onEnter: (dashboardName: string) => void;
  curDashName: string;
}

const SaveDashboardForm: React.FC<SaveDashboardFormProps> = ({ onEnter, curDashName }) => {
  const [dashName, setDashName] = useState<string>(curDashName);
  const [isDashNameEmpty, setIsDashNameEmpty] = useState<boolean>(false);
  const dispatch = useDispatch();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setDashName(value);
    setIsDashNameEmpty(value === "");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (dashName === "") {
      setIsDashNameEmpty(true);
      return;
    }
    dispatch(setSaveName(dashName)); // Dispatch the action to set the save name
    onEnter(dashName);
  }

  return (
    <div>
      <form className="vertical-form" onSubmit={handleSubmit}>
        <label>
          <input
            type="text"
            value={dashName}
            onChange={handleChange}
          />
        </label>
        {isDashNameEmpty && <p style={{ color: 'red' }}>Dashboard name cannot be empty</p>}
        <button type="submit" className="form-button">Submit and Save</button>
      </form>
    </div>
  );
};

export default SaveDashboardForm;