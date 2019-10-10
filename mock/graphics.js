import * as geometries from './geometries'
import * as symbols from './symbols'

export const simplePointGraphic = {
  geometry: geometries.simplePoint,
  symbol: symbols.simpleMarkerSymbol,
  attributes: { key: '00' }
}

export const simplePolylineGraphic = {
  geometry: geometries.simplePolyline,
  symbol: symbols.simpleLineSymbol,
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

export const simplePolygonGraphic = {
  geometry: geometries.simplePolygon,
  symbol: symbols.simpleFillSymbol,
  attributes: { key: '02' }
}