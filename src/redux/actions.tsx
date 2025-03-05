
  import { FeatureCollection, Feature, Geometry, GeoJsonProperties } from 'geojson';



  export const SET_GEOJSON_DATA = 'SET_GEOJSON_DATA';

  export const setGeoJsonData = (data: FeatureCollection<Geometry, GeoJsonProperties>) => ({
    type: SET_GEOJSON_DATA,
    payload: data,
  });