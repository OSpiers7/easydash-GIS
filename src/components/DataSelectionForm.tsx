import { Feature, FeatureCollection } from "geojson";
import { createSelector } from 'reselect';
//USE THIS CODE TO ACCESS THE DATA FROM THE REDUX STORE
import { useDispatch, useSelector } from 'react-redux'; // Use both useDispatch and useSelector
import { setSelectedKey } from "../redux/actions";

// Create a memoized selector
//remove this later since not neccesary in this file. Add it into the widgets
const selectGeoJsonData = createSelector(
    (state: { geoJsonData: Map<string, any> }) => state.geoJsonData,
    geoJsonData => geoJsonData // Simply returning the data ensures memoization
  );


function DataSelectionForm() {

const geoJsonData = useSelector(selectGeoJsonData);

  // Call the dispatcher to set the action
const dispatch = useDispatch();

  // Access the geoJsonData from the Redux store
const ReduxKey = useSelector((state: any) => state.geoJsonDataKey);
    

const keys = Array.from(geoJsonData.keys());



  // Handle the radio button change event
  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // Dispatch the updated Map to Redux
    dispatch(setSelectedKey(event.target.value));

};

        // Map the keys of the Map object into radio buttons
        const radioButtons = Array.from(geoJsonData.keys()).map(key => (
            <div key={key}>
                <label htmlFor={key}>
                    <input
                        type="radio"
                        id={key}
                        name="geoJsonKey"
                        value={key}
                        checked={ReduxKey === key}  // Make selection persist
                        onChange={handleRadioChange} // Attach change handler
                    />
                    {key}
                </label>
            </div>
        ));
    

    return (


<form>{radioButtons}
</form>

    );
}

export default DataSelectionForm;