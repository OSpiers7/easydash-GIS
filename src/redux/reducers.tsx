// reducers.ts

import { combineReducers } from 'redux';
import { SET_GEOJSON_DATA } from './actions';
import { FeatureCollection, Feature, Geometry, GeoJsonProperties } from 'geojson';

const initialGeoJsonState: FeatureCollection<Geometry, GeoJsonProperties> = {
  type: 'FeatureCollection',
  features: [],
};

const geoJsonReducer = (state = initialGeoJsonState, action: any) => {
  switch (action.type) {
    case SET_GEOJSON_DATA:
      return { ...state, ...action.payload }; // Replace the state with the new GeoJSON data
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  geoJsonData: geoJsonReducer,
  // Other reducers can go here if needed
});

export default rootReducer;
