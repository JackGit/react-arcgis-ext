import React, { Component } from 'react'
import { WebMap, WebScene, Scene, Map  } from '@esri/react-arcgis'
import Editor from './editor/Editor'
import GraphicsLayer from '@/components/layers/graphics-layer/GraphicsLayer'

export default { title: 'Editing' }

class EditorBasicStory extends Component {
  state = {
    view: null
  }

  loadHandler = (map, view) => {
    view.when(() => {
      view.popup.autoOpenEnabled = false
    })
    this.setState({ view })
  }
  
  render () {
    return (
      <div style={{width:'100vw',height:'100vh'}}>
        <WebMap
          id="6c5d657f1cb04a5eb78a450e3c699c2a"
          onLoad={this.loadHandler}
        >
          {this.state.view ? <Editor properties={{ view: this.state.view }} position="top-right" /> : <div></div>}
        </WebMap>
      </div>
    )
  }
}

export const editFeaturesWithTheEditorWidget = () => <EditorBasicStory />