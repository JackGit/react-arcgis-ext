import React from 'react'
import Map from '../../map/Map'
import Graphic from '../../graphic/Graphic'
import FeatureLayer from './FeatureLayer'
import DataLoader from '.storybook/components/DataLoader'
import { fetchImageAsFeatures } from '../../../../mock/features'

export default { title: 'FeatureLayer' }

export const introFeatureLayer = () => {
  return (
    <div style={{width:'100vw',height:'100vh'}}>
      <Map
        mapProperties={{
          basemap: 'hybrid'
        }}
        viewProperties={{
          extent: {
            xmin: -9177811,
            ymin: 4247000,
            xmax: -9176791,
            ymax: 4247784,
            spatialReference: 102100
          }
        }}
      >
        <FeatureLayer
          properties={{
            url: 'https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Landscape_Trees/FeatureServer/0'
          }}
        />
      </Map>
    </div>
  )
}

export const createAFeatureLayerWithClientSideGraphics = () => {
  Graphic.config({ keyAttribute: 'OBJECTID' })

  const featureLayerProperties = {
    // note: `source` and `geometryType` have to be set here, cause `source` will be applyEdits after when Graphic loaded
    // and FeatureLayer couldn't create with source/geometryType both empty
    source: [],
    geometryType: 'point',

    objectIdField: 'OBJECTID',
    fields: [
      { name: "OBJECTID", type: "oid" },
      { name: "url",      type: "string" }
    ],
    popupTemplate: {
      content: "<img src='{url}'>"
    },
    renderer: {
      type: "simple",
      symbol: {
        type: "text",
        color: "#7A003C",
        text: "\ue661",
        font: {
          size: 20,
          family: "CalciteWebCoreIcons"
        }
      }
    }
  }

  return (
    <DataLoader load={fetchImageAsFeatures}>
      {features =>
        <div style={{width:'100vw',height:'100vh'}}>
          <Map
            mapProperties={{
              basemap: 'dark-gray'
            }}
            viewProperties={{
              center: [-41.647, 36.41],
              zoom: 3
            }}
          >
            <FeatureLayer properties={featureLayerProperties}>
              {features.map(json => <Graphic json={json} />)}
            </FeatureLayer>
          </Map>
        </div>
      }
    </DataLoader>
  )
}
