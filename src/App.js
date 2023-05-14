import { useEffect, useRef, useState } from 'react';
import './App.css';
import * as tt from "@tomtom-international/web-sdk-maps"

function App() {
  const mapElement = useRef()
  const [ latitude, setLatitude ] = useState(-1.2921)
  const [ longitude, setLongitude ] = useState(36.8218)
  const [ map, setMap ] = useState({})

  useEffect(() => {
    let map = tt.map({
      key: process.env.REACT_APP_TOM_TOM_API_KEY,
      container: mapElement.current,
      stylesVisibility: {
        trafficIncidents: true,
        trafficFlow: true
      },
      center: [longitude, latitude],
      zoom: 14
    })

    setMap(map)

  }, [])

  return (
    <div className="App">
      <div ref={mapElement} className="map"></div>
    </div>
  );
}

export default App;
