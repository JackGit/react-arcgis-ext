import React from 'react'
import Map from '../map/Map'
import GraphicsLayer from '../layers/GraphicsLayer'
import Graphic from './Graphic'

const POINT_GRAPHIC = {
  geometry: {
    type: "point", // autocasts as new Point()
    longitude: -49.97,
    latitude: 41.73
  },
  symbol: {
    type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
    color: [226, 119, 40],
    outline: {
      // autocasts as new SimpleLineSymbol()
      color: [255, 255, 255],
      width: 2
    }
  },
  attributes: { key: '00' }
}

const POLYLINE_GRAPHIC = {
  geometry: {
    type: "polyline", // autocasts as new Polyline()
    paths: [[-111.3, 52.68], [-98, 49.5], [-93.94, 29.89]]
  },
  symbol: {
    type: "simple-line", // autocasts as SimpleLineSymbol()
    color: [226, 119, 40],
    width: 4
  },
  attributes: {
    key: '01',
    Name: "Keystone Pipeline",
    Owner: "TransCanada",
    Length: "3,456 km"
  },
  popupTemplate: {
    // autocasts as new PopupTemplate()
    title: "{Name}",
    content: [
      {
        type: "fields",
        fieldInfos: [
          {
            fieldName: "Name"
          },
          {
            fieldName: "Owner"
          },
          {
            fieldName: "Length"
          }
        ]
      }
    ]
  }
}

const POLYGON_GRAPHIC = {
  geometry: {
    type: "polygon", // autocasts as new Polygon()
    rings: [
      [-64.78, 32.3],
      [-66.07, 18.45],
      [-80.21, 25.78],
      [-64.78, 32.3]
    ]
  },
  symbol: {
    type: "simple-fill", // autocasts as new SimpleFillSymbol()
    color: [227, 139, 79, 0.8],
    outline: {
      // autocasts as new SimpleLineSymbol()
      color: [255, 255, 255],
      width: 1
    }
  },
  attributes: { key: '02' }
}

export default { title: 'Graphic' }

export const introduceGraphic = () => {
  const graphics = [POINT_GRAPHIC, POLYLINE_GRAPHIC, POLYGON_GRAPHIC]
  return (
    <div style={{width:'100vw',height:'100vh'}}>
      <Map
        mapProperties={{
          basemap: 'hybrid'
        }}
        viewProperties={{
          center: [-80, 35],
          zoom: 3
        }}
      >
        <GraphicsLayer>
          {graphics.map(g => <Graphic properties={g} />)}
        </GraphicsLayer>
      </Map>
    </div>
  )
}