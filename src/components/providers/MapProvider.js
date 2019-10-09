import React from 'react'

const MapContext = React.createContext({
  map: null,
  view: null
})

export default MapContext
export const MapProvider = MapContext.Provider
export const MapConsumer = MapContext.Consumer