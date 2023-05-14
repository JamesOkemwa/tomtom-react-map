import { useEffect, useRef, useState } from "react";
import * as tt from "@tomtom-international/web-sdk-maps";
import "./App.css";
import "@tomtom-international/web-sdk-maps/dist/maps.css"

function App() {
  const mapElement = useRef();
  const [latitude, setLatitude] = useState(-1.2921);
  const [longitude, setLongitude] = useState(36.8218);
  const [map, setMap] = useState({});

  useEffect(() => {
    let map = tt.map({
      key: process.env.REACT_APP_TOM_TOM_API_KEY,
      container: mapElement.current,
      stylesVisibility: {
        trafficIncidents: true,
        trafficFlow: true,
      },
      center: [longitude, latitude],
      zoom: 14,
    });
    setMap(map);

    const addMarker = () => {
      const element = document.createElement("div");
      element.className = "marker";

      const marker = new tt.Marker({
        draggable: true,
        element: element,
      })
        .setLngLat([longitude, latitude])
        .addTo(map)

      marker.on('dragend', () => {
        const lngLat = marker.getLngLat()
        setLongitude(lngLat.lng)
        setLatitude(lngLat.lat)
      })
      
    };
    addMarker();

    return () => map.remove();
  }, [latitude, longitude]);

  return (
    <div className="App">
      <div ref={mapElement} className="map" />
      <div className="search-bar">
        <h1>Where to?</h1>
        <input
          type="text"
          id="longitude"
          className="longitude"
          placeholder="Put in the longitude"
          onChange={(e) => {
            setLongitude(e.target.value);
          }}
        />

        <input
          type="text"
          id="latitude"
          className="latitude"
          placeholder="Put in the latitude"
          onChange={(e) => {
            setLatitude(e.target.value);
          }}
        />
      </div>
    </div>
  );
}

export default App;
