import React, { Component } from 'react'
import { WebMap, WebScene, Scene, Map  } from '@esri/react-arcgis'
import Sketch from './sketch/Sketch'
import GraphicsLayer from '@/components/layers/graphics-layer/GraphicsLayer'

export default { title: 'Draw' }

class SketchStory extends Component {
  state = {
    graphicsLayer: null
  }
  
  render () {
    return (
      <div style={{width:'100vw',height:'100vh'}}>
        <Map
          mapProperties={{ basemap: 'streets' }}
          viewProperties={{
            zoom: 5,
            center: [90, 45]
          }}
        >
          <GraphicsLayer onLoad={graphicsLayer => this.setState({ graphicsLayer })} />
          {this.state.graphicsLayer ? <Sketch position="top-right" properties={{ layer: this.state.graphicsLayer }} /> : <div></div>}
        </Map>
      </div>
    )
  }
}

export const sketch = () => <SketchStory />