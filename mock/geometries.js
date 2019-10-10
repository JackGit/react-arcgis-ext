export const simplePoint = {
  type: "point", // autocasts as new Point()
  longitude: -49.97,
  latitude: 41.73
}

export const simplePolyline = {
  type: "polyline", // autocasts as new Polyline()
  paths: [[-111.3, 52.68], [-98, 49.5], [-93.94, 29.89]]
}

export const simplePolygon = {
  type: "polygon", // autocasts as new Polygon()
  rings: [
    [-64.78, 32.3],
    [-66.07, 18.45],
    [-80.21, 25.78],
    [-64.78, 32.3]
  ]
}