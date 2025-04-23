import { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';

export const SET_GEOJSON_DATA = 'SET_GEOJSON_DATA';

// Accept a Map<string, FeatureCollection> directly
export const setGeoJsonData = (data: Map<string, FeatureCollection<Geometry, GeoJsonProperties>>) => ({
  type: SET_GEOJSON_DATA,
  payload: data,
});

export const SET_GEOJSON_SELECTED_KEY = 'SET_SELECTED_KEY';

// Accept a Map<string, FeatureCollection> directly
export const setSelectedKey = (key: string) => ({
  type: SET_GEOJSON_SELECTED_KEY,
  payload: key,
});

export const SET_SAVE_STATE = 'SET_SAVE_STATE';

export const setSaveState = (state: string) => ({
  type: SET_SAVE_STATE,
  payload: state,
});

export const SET_SAVE_NAME = 'SET_SAVE_NAME';

export const setSaveName = (name: string) => ({
  type: SET_SAVE_NAME,
  payload: name,
});

export const SET_USER_AUTH = 'SET_USER_AUTH';
export const CLEAR_USER_AUTH = 'CLEAR_USER_AUTH';

// Define the structure of user authentication data
interface UserAuth {
  email: string;
  isAuthenticated: boolean;
}

// Action creator for setting user authentication
export const setUserAuth = (userData: UserAuth) => ({
  type: SET_USER_AUTH,
  payload: userData,
});

// Action creator for clearing user authentication
export const clearUserAuth = () => ({
  type: CLEAR_USER_AUTH,
});