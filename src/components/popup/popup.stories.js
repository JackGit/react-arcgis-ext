import React, { Component } from 'react'
import { WebMap, WebScene, Scene, Map  } from '@esri/react-arcgis'
import Legend from '@/components/widgets/legend/Legend'
import FeatureLayer from '@/components/layers/feature-layer/FeatureLayer'

export default { title: 'Popup' }

class IntroToPopupTemplate extends Component {
  state = {
    graphicsLayer: null
  }
  
  render () {
    return (
      <div style={{width:'100vw',height:'100vh'}}>
        <Map
          mapProperties={{ basemap: 'grey' }}
          viewProperties={{
            center: [-73.95, 40.702],
            zoom: 11
          }}
        >
          <FeatureLayer properties={{
            url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/ACS_Marital_Status_Boundaries/FeatureServer/2"
          }} />
          <Legend position="bottom-left" />
        </Map>
      </div>
    )
  }
}

export const introToPopupTemplate = () => <IntroToPopupTemplate />