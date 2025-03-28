import { combineReducers } from 'redux';
import { SET_GEOJSON_DATA, SET_GEOJSON_SELECTED_KEY, SET_SAVE_NAME, SET_SAVE_STATE } from './actions';
import { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import { geoJson } from 'leaflet';

// Initial state is an empty Map
const initialGeoJsonState: Map<string, FeatureCollection<Geometry, GeoJsonProperties>> = new Map();

const geoJsonReducer = (
  state = initialGeoJsonState, 
  action: { type: string; payload: Map<string, FeatureCollection<Geometry, GeoJsonProperties>> }
) => {
  switch (action.type) {
    case SET_GEOJSON_DATA:
      return new Map([...state, ...action.payload]); // Merge existing state with new data
    default:
      return state;
  }
};

const initialGeoJsonKeyState: string = ""

const geoJsonKeyReducer = (
state = initialGeoJsonKeyState,
action: {type: string; payload: string}

) => {
switch (action.type){

  case SET_GEOJSON_SELECTED_KEY:
    return action.payload
  default: 
    return state  
}

};

// Initial state for saveState is an array of two empty strings
const initialSaveState: [string, string] = ["", ""];

const saveStateReducer = (
  state = initialSaveState,
  action: { type: string; payload: string }
) => {
  switch (action.type) {
    case SET_SAVE_STATE:
      return [action.payload, state[1]];
    case SET_SAVE_NAME:
      return [state[0], action.payload];
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  geoJsonData: geoJsonReducer, 
  geoJsonDataKey: geoJsonKeyReducer,
  saveState: saveStateReducer
});

export default rootReducer;
