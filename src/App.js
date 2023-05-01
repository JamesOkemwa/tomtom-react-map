import { useEffect, useRef, useState } from 'react';
import './App.css';
import tt from "@tomtom-international/web-sdk-maps"

function App() {
  const [ map, setMap ] = useState({})
  const mapElement = useRef()
  const longitude = 36.8218
  const latitude = -1.2921

  useEffect(() => {
    let map = tt.map({
      key: process.env.REACT_APP_TOM_TOM_API_KEY,
      container: mapElement.current,
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
