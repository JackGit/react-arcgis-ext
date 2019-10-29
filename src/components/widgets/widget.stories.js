import React, { Component } from 'react'
import { WebMap, WebScene, Scene, Map  } from '@esri/react-arcgis'
import BasemapGallery from './basemap-gallery/BasemapGallery'
import Bookmarks from './bookmarks/Bookmarks'
import LayerList from './layer-list/LayerList'
import Expand from './expand/Expand'
import Locate from './locate/Locate'

export default { title: 'Widget' }

export const basemapGallery = () => {
  return (
    <div style={{width:'100vw',height:'100vh'}}>
      <Map
        mapProperties={{ basemap: 'gray' }}
        viewProperties={{
          center: [139.68, 35.68],
          zoom: 3
        }}
      >
        <BasemapGallery position="top-right" />
      </Map>
    </div>
  )
}

export const layerList = () => {
  return (
    <div style={{width:'100vw',height:'100vh'}}>
      <WebScene id="adfad6ee6c6043238ea64e121bb6429a">
        <LayerList position="top-right" />
      </WebScene>
    </div>
  )
}

export const bookmarks = () => {
  return (
    <div style={{width:'100vw',height:'100vh'}}>
      <WebMap id="aa1d3f80270146208328cf66d022e09c">
        <Expand position="top-right" properties={{ expanded: true }} widgetContent>
          <Bookmarks properties={{ editingEnabled: true }} />  
        </Expand>
      </WebMap>
    </div>
  )
}

export const locale = () => {
  return (
    <div style={{width:'100vw',height:'100vh'}}>
      <Map
        mapProperties={{ basemap: 'streets' }}
        viewProperties={{
          center: [-56.049, 38.485, 78],
          zoom: 3
        }}
      >
        <Locate position="top-left" />
      </Map>
    </div>
  )
}

export const expand = () => {
  let view, expand
  const onBasemapGalleryLoad = basemapGallery => {
    basemapGallery.watch("activeBasemap", () => {
      const mobileSize = view.heightBreakpoint === "xsmall" || view.widthBreakpoint === "xsmall"
      if (mobileSize) {
        expand.collapse()
      }
    })
  }
  return (
    <div style={{width:'100vw',height:'100vh'}}>
      <Scene
        mapProperties={{
          basemap: "satellite"
        }}
        onLoad={(m, v) => view = v}
      >
        <Expand position="top-right" widgetContent onLoad={e => expand = e}>
          <BasemapGallery onLoad={onBasemapGalleryLoad} />  
        </Expand>
      </Scene>
    </div>
  )
}