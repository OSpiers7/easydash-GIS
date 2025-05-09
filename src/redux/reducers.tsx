import { combineReducers } from 'redux';
import { SET_GEOJSON_DATA, SET_GEOJSON_SELECTED_KEY, SET_SAVE_NAME, SET_SAVE_STATE, SET_USER_AUTH, CLEAR_USER_AUTH, SET_RENDERED_MAP_DATA } from './actions';
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

interface UserAuthState {
  email: string;
  isAuthenticated: boolean;
}

// Initial state for user authentication
const initialAuthState: UserAuthState = {
  email: '',
  isAuthenticated: false,
};

// Reducer for user authentication
const userAuthReducer = (
  state = initialAuthState,
  action: { type: string; payload?: UserAuthState }
) => {
  switch (action.type) {
    case SET_USER_AUTH:
      return {
        ...state,
        ...action.payload,
      };
    case CLEAR_USER_AUTH:
      return initialAuthState;
    default:
      return state;
  }
};

// Initial state for rendered map data
const initialRenderedMapData: any = null;

const renderedMapDataReducer = (
  state = initialRenderedMapData,
  action: { type: string; payload: any }
) => {
  switch (action.type) {
    case SET_RENDERED_MAP_DATA:
      return action.payload;
    default:
      return state;
  }
}

// Combine all reducers into a single root reducer
const rootReducer = combineReducers({
  geoJsonData: geoJsonReducer, 
  geoJsonDataKey: geoJsonKeyReducer,
  saveState: saveStateReducer,
  userAuth: userAuthReducer,
  renderedMapData: renderedMapDataReducer,
});

export default rootReducer;

// Selector for checking if the user is logged in
export const selectIsUserLoggedIn = (state: any): boolean => state.userAuth.isAuthenticated;

// Selector for getting the user's email
export const selectUserEmail = (state: any): string => state.userAuth.email;

// selector for getting rendered map data
export const selectRenderedMapData = (state: any): any => state.renderedMapData;