import { useEffect, useRef, useState } from "react";
import * as tt from "@tomtom-international/web-sdk-maps";
import * as ttapi from "@tomtom-international/web-sdk-services";
import "./App.css";
import "@tomtom-international/web-sdk-maps/dist/maps.css"

function App() {
  const mapElement = useRef();
  const [latitude, setLatitude] = useState(-1.2921);
  const [longitude, setLongitude] = useState(36.8218);
  const [ userLOcation, setUserLocation ] = useState(null)
  const [map, setMap] = useState({});

  const convertToPoints = (lngLat) => {
    return {
      point: {
        latitude: lngLat.lat,
        longitude: lngLat.lng
      }
    }
  }

  const drawRoute = (geoJson, map) => {
    if (map.getLayer('route')) {
      map.removeLayer('route')
      map.removeSource('route')
    }
    map.addLayer({
      id: 'route',
      type: 'line',
      source: {
        type: 'geojson',
        data: geoJson
      },
      paint: {
        'line-color': 'blue',
        'line-width': 5
      }
    })
  }

  const addDeliveryMarker = (lngLat, map, order) => {
    const element = document.createElement('div')
    element.className = 'marker-delivery'

    const label = document.createElement('div')
    label.className = 'marker-label'
    label.textContent = order.toString()

    element.appendChild(label)

    new tt.Marker({
      element: element
    })
      .setLngLat(lngLat)
      .addTo(map)
  }

  useEffect(() => {
    const origin = {
      lng: longitude,
      lat: latitude
    }
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

    const sortDestinations = (locations) => {
      const pointsForDestinations = locations.map((destination) => {
        return convertToPoints(destination)
      })
      const callParameters = {
        key: process.env.REACT_APP_TOM_TOM_API_KEY,
        destinations: pointsForDestinations,
        origins: [convertToPoints(origin)]
      }

      return new Promise((resolve,reject) => {
        ttapi.services
          .matrixRouting(callParameters)
          .then((matrixAPIResults) => {
            console.log(matrixAPIResults)
            const results = matrixAPIResults.matrix[0]
            const resultsArray = results.map((result, index) => {
              return {
                location: locations[index],
                drivingTime: result.response.routeSummary.travelTimeInSeconds,
              }
            })
            resultsArray.sort((a, b) => {
              return a.drivingTime - b.drivingTime
            })
            const sortedLocations = resultsArray.map((result) => {
              return result.location
            })
            resolve(sortedLocations)
          })
      })
    }

    const recalculateRoutes = () => {
      sortDestinations(destinations).then((sorted) => {
        sorted.unshift(origin)

        ttapi.services
          .calculateRoute({
            key: process.env.REACT_APP_TOM_TOM_API_KEY,
            locations: sorted,
          })
          .then((routeData) => {
            const geoJson = routeData.toGeoJson()
            drawRoute(geoJson, map)
            
            sorted.forEach((location, index) => {
              if (index !== 0) {
                addDeliveryMarker(location, map, index)
              }
            })
          })
      })
    }

    // Add markers to the map when clicked
    map.on('click', (e) => {
      destinations.push(e.lngLat)
      // addDeliveryMarker(e.lngLat, map)
      recalculateRoutes()
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
