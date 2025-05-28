import { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import { Coord } from '../Utils';
import { Bounds } from 'leaflet';

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

// Action types for mapSync
export const SET_MAP_SYNC_STATUS = 'SET_MAP_SYNC_STATUS';
export const SET_MAP_SYNC_DATA = 'SET_MAP_SYNC_DATA';
export const SET_MAP_SYNC_COMPLETE = 'SET_MAP_SYNC_COMPLETE';

// Interface for map sync data
export interface MapSyncData {
  selectedDatasets: string[];
  currentCoord: Coord; // Using any for now, but you can specify the Coord type
  currentZoom: number;
  bounds: any; // Using any for now, but you can specify the bounds type
}

// Action creator to set just the sync status (first array element)
export const setMapSyncStatus = (status: string) => ({
  type: SET_MAP_SYNC_STATUS,
  payload: status,
});

// Action creator to set just the map data (second array element)
export const setMapSyncData = (data: MapSyncData) => ({
  type: SET_MAP_SYNC_DATA,
  payload: data,
});

// Action creator to set both status and data in one go
export const setMapSyncComplete = (status: string, data: MapSyncData) => ({
  type: SET_MAP_SYNC_COMPLETE,
  payload: {
    status,
    data
  },
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

//action to store the rendered map data in redux store
export const SET_RENDERED_MAP_DATA = 'SET_RENDERED_MAP_DATA';

export const setRenderedMapData = (renderedData: any) => ({
  type: SET_RENDERED_MAP_DATA,
  payload: renderedData
})