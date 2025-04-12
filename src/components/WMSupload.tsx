import { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import { useDispatch, useSelector } from 'react-redux';
//will have to add the setter for the wms and link maps 
import { setGeoJsonData } from '../redux/actions';
import { useState } from 'react';


//in my other files i have the redux set up for the xml get capabilities map and the map that holds the key
//the wfs will have the same key as these and will be hosted in the og geojson map \

function WMSupload () {

    const [wmsUrl, setWmsUrl] = useState('');
    const [wmsName, setWmsName] = useState('');

//gets the link form the text input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setWmsUrl(e.target.value);
      };

//does the logic when the full link gets submitted
    const handleSubmit = async (e: React.FormEvent) => {   

        const url = wmsUrl.trim();

        if (!url) {

            alert('Please enter a WMS link.');
            return;
        } 

            // Prompt user for the WMS name after clicking Submit
    const userName = prompt('Please enter a name for this WMS service:', '');
    
    // If the user provided a name, store it; otherwise, default to a placeholder
    if (userName) {
      setWmsName(userName);
    } else {
      setWmsName('Unnamed WMS Service');
    }



        const capabilitiesUrl = `${url}?service=WMS&request=GetCapabilities`;

        try {
            
            const response = await fetch(capabilitiesUrl);

            if (!response.ok) {
                alert(`Server error: ${response.status}`);
                return;
              }

            const xmlText = await response.text();
            const xmlDoc = new DOMParser().parseFromString(xmlText, 'application/xml');

            const isException = xmlDoc.querySelector('ServiceException, Exception');

      if (isException) {
        alert('WMS server returned an error response.');
        return;
      }

      
            console.log('Parsed WMS Capabilities:', xmlDoc);
            // Dispatch xmlDoc to Redux or use it however you want
          } catch (err) {
            alert('Failed to fetch WMS capabilities. Check the link.');
            console.error('WMS fetch error:', err);
          }


    }   
return (
<>
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder = "Enter WMS link"
        onChange={handleInputChange}
      />
      <button
      type = "submit"
        style={{
          display: "inline-block",
          backgroundColor: "gray",
          color: "white",
          padding: "10px 20px",
          borderRadius: "5px",
          cursor: "pointer",
          textAlign: "center",
        }}
      >
        Upload WMS link
      </button>
    </form>
    </>
);

}


export default WMSupload;