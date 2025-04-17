import React from "react";
import "../TopBanner.css";
//import FetchWmsGeoJson from "./FetchWmsGeoJson";
import UploadGeo from "./GeoJsonUpload";
import Menu from "./Menu";

const HomeTopBanner: React.FC = () => (
  <div className="top-banner">
    <div className="top-banner-content">
        <h3>Choose a Dashboard to Load</h3>
      <UploadGeo />
{/*
      <FetchWmsGeoJson />
*/}
      <Menu />
    </div>
  </div>
);

export default HomeTopBanner;
