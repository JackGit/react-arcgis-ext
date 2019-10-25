import React from 'react'
import Map from '@/components/map/Map'
import Graphic from '@/components/graphic/Graphic'
import Search from '@/components/widgets/search/Search'
import FeatureLayer from './FeatureLayer'
import DataLoader from '.storybook/components/DataLoader'
import { fetchImageAsFeatures } from 'mock/features'

import { WebMap, WebScene, Scene  } from '@esri/react-arcgis'
import { transparentize } from '_polished@3.4.1@polished'


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

export const highlightPointFeatures = () => {
  let map, view, highlightSelect
  const stations = ['Valmy', 'St-Jean Vieux Lyon', 'Charpennes', 'Sans souci', 'Hôtel de Ville', 'Garibaldi']
  const btnStyle = {
    width: 'auto',
    display: 'table-cell',
    margin: '4px',
    backgroundColor: 'white',
    color: '#0079c1'
  }

  const onClick = station => {
    const stationLayer = map.layers.getItemAt(1)
    view.whenLayerView(stationLayer).then(layerView => {
      const queryStations = stationLayer.createQuery()
      queryStations.where = `nom='${station}'`
      stationLayer.queryFeatures(queryStations).then(result => {
        if (highlightSelect) {
          highlightSelect.remove()
        }

        const feature = result.features[0]
        highlightSelect = layerView.highlight(feature.attributes['OBJECTID'])

        view.goTo({ target: feature.geometry, tilt: 70 }, { duration: 2000, easing: 'in-out-expo' })
      })
    })
  }

  return (
    <div style={{width:'100vw',height:'100vh'}}>
      <WebScene
        id='475a7161ed194460b5b52654e29581a2'
        viewProperties={{
          highlightOptions: {
            color: [255, 241, 58],
            fillOpacity: 0.4
          },
          environment: {
            atmosphereEnabled: true,
            atmosphere: { quality: 'high' }
          }
        }}
        onLoad={(m, v) => {
          map = m
          view = v
        }}
      >

      </WebScene>
      <div class="esri-widget" style={{ position:'absolute',bottom:'40px',width:'100%',textAlign:'center',backgroundColor:'transparent',color:'white'}}>
        <h3>Subway stations</h3>
        {stations.map(s => 
          <button key={s} class="esri-button" style={btnStyle} onClick={_ => onClick(s)}>{s}</button>
        )}
      </div>
    </div>
  )
}

export const addLabelsToAFeatureLayer = () => {
  const featureLayerProperties = {
    portalItem: {
      id: "6012738cd1c74582a5f98ea30ae9876f"
    },
    labelingInfo: [{
      symbol: {
        type: "text",
        color: "green",
        haloColor: "black",
        font: {
          family: "Playfair Display",
          size: 12,
          weight: "bold"
        }
      },
      labelPlacement: "above-center",
      labelExpressionInfo: {
        expression: "$feature.MARKER_ACTIVITY"
      }
    }],
    renderer: {
      type: "simple", // autocasts as new SimpleRenderer()
      symbol: {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        color: "rgba(0,100,0,0.6)",
        size: 3,
        outline: {
          color: [0, 0, 0, 0.1],
          width: 0.5
        }
      }
    }
  }
  return (
    <div style={{width:'100vw',height:'100vh'}}>
      <WebMap
        id="372b7caa8fe340b0a6300df93ef18a7e"
        mapProperties={{

        }}
        viewProperties={{
          center: [-116.925, 34.2501],
          zoom: 14
        }}
      >
        <FeatureLayer properties={featureLayerProperties} />
        <Search position="top-right" />
      </WebMap>
    </div>
  )
}