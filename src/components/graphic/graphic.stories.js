import React from 'react'
import Map from '../map/Map'
import GraphicsLayer from '../layers/GraphicsLayer'
import Graphic from './Graphic'
import { simplePointGraphic, simplePolylineGraphic, simplePolygonGraphic } from '../../../mock/graphics'

export default { title: 'Graphic' }

export const introduceGraphic = () => {
  const graphics = [simplePointGraphic, simplePolylineGraphic, simplePolygonGraphic]
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