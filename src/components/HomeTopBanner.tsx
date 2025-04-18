import React from "react";
import "../styles/App.css";
//import FetchWmsGeoJson from "./FetchWmsGeoJson";
import UploadGeo from "./GeoJsonUpload";

const HomeTopBanner: React.FC = () => (
  <div className="top-banner">
    <div className="top-banner-content">
        <h3>Choose a Dashboard to Load</h3>
      <UploadGeo />
{/*
      <FetchWmsGeoJson />
*/}
    </div>
  </div>
);

export default HomeTopBanner;
