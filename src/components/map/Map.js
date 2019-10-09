import React, { Component } from 'react'
import { MapProvider } from '../providers/MapProvider'
import { Map as ArcMap } from '@esri/react-arcgis'

class Map extends Component {
  state = {
    map: null,
    view: null
  }

  onLoad = (map, view) => {
    const { onLoad } = this.props
    this.setState({ map, view }, () => onLoad && onLoad(map, view))
  }

  render () {
    const { onLoad, ...props } = this.props
    return (
      <MapProvider value={this.state}>
        <ArcMap onLoad={this.onLoad} {...props} />
      </MapProvider>
    )
  }
}

export default Map