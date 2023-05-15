import { useEffect, useRef, useState } from "react";
import * as tt from "@tomtom-international/web-sdk-maps";
import * as ttapi from "@tomtom-international/web-sdk-services";
import "./App.css";
import "@tomtom-international/web-sdk-maps/dist/maps.css"

function App() {
  const mapElement = useRef();
  const [latitude, setLatitude] = useState(-1.2921);
  const [longitude, setLongitude] = useState(36.8218);
  const [map, setMap] = useState({});

  const origin = {
    lng: longitude,
    lat: latitude
  }

  const convertToPoints = (lngLat) => {
    return {
      point: {
        latitude: lngLat.lat,
        longitude: lngLat.lng
      }
    }
  }

  const addDeliveryMarker = (lngLat, map) => {
    const element = document.createElement('div')
    element.className = 'marker-delivery'
    new tt.Marker({
      element: element
    })
      .setLngLat(lngLat)
      .addTo(map)
  }

  useEffect(() => {
    const destinations = []

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

      const popupOffset = {
        bottom: [0, -25],
      }

      const popup = new tt.Popup({
        offset: popupOffset
      }).setHTML("This is you")

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

      marker.setPopup(popup).togglePopup()

    };
    addMarker();

    // Matrix Routing
    // const pointsForDestinations = locations.map

    // const callParameters = {
    //   key: process.env.REACT_APP_TOM_TOM_API_KEY,
    //   destinations: pointsForDestinations,
    //   origins: [convertToPoints(origin)]
    // }

    // return new Promise((resolve,reject) => {
    //   ttapi.services.matrixRouting(callParameters)
    // })

    map.on('click', (e) => {
      destinations.push(e.lngLat)
      addDeliveryMarker(e.lngLat, map)
    })

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
