import withExternalLinks from 'storybook-external-links'

import React from 'react'
import Map from '../../map/Map'
import Graphic from '../../graphic/Graphic'
import FeatureLayer from './FeatureLayer'
import DrpCountyBoundaryData from '../../../../mock/drp-county-boundary'
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
  Graphic.config({ keyAttribute: 'FID' })

  const featureLayers = DrpCountyBoundaryData.featureCollection.layers.map(layer => {
    return {
      properties: {
        objectIdField: 'FID'
      },
      features: layer.featureSet.features
    }
  })
  console.log('featureLayers =>', featureLayers)

  // view.goTo(sourceGraphics);

  return (
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
        {featureLayers.map(({ properties, features }) => 
          <FeatureLayer properties={properties}>
            {features.map(json => <Graphic json={json} />)}
          </FeatureLayer>
        )}
      </Map>
    </div>
  )
}

const externalLinkDecorator = withExternalLinks('https://cdn.jsdelivr.net/npm/exif-js', { async: true })
createAFeatureLayerWithClientSideGraphics.story = {
  decorators: [storyFn => externalLinkDecorator(storyFn)]
}