import React from 'react'
import Map from '@/components/map/Map'
import Graphic from '@/components/graphic/Graphic'
import Widget from '@/components/widgets/widget/Widget'
import Search from '@/components/widgets/search/Search'
import Bookmarks from '@/components/widgets/bookmarks/Bookmarks'
import Expand from '@/components/widgets/expand/Expand'
import FeatureLayer from './FeatureLayer'
import DataLoader from '.storybook/components/DataLoader'
import { fetchImageAsFeatures } from 'mock/features'

import { WebMap, WebScene, Scene  } from '@esri/react-arcgis'


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

export const labelFeaturesUsingArcadeExpressions = () => {
  const windArcade = `
    var DEG = $feature.WIND_DIRECT;
    var SPEED = $feature.WIND_SPEED;
    var DIR = When( SPEED == 0, "",
      (DEG < 22.5 && DEG >= 0) || DEG > 337.5, "N",
      DEG >= 22.5 && DEG < 67.5, "NE",
      DEG >= 67.5 && DEG < 112.5, "E",
      DEG >= 112.5 && DEG < 157.5, "SE",
      DEG >= 157.5 && DEG < 202.5, "S",
      DEG >= 202.5 && DEG < 247.5, "SW",
      DEG >= 247.5 && DEG < 292.5, "W",
      DEG >= 292.5 && DEG < 337.5, "NW", "" );
    return SPEED + " mph " + DIR;
  `

  const featureLayerProperties = {
    url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/weather_stations_010417/FeatureServer/0",
    elevationInfo: {
      mode: "relative-to-ground",
      offset: 1000
    },
    renderer: {
      type: "simple",
      symbol: {
        type: "point-3d",
        symbolLayers: [{
          type: "object",
          material: { color: "#a38a8a" },
          resource: { primitive: "tetrahedron" },
          width: 10000,
          depth: 20000,
          height: 1000
        }]
      },
      visualVariables: [{
        type: "rotation",
        valueExpression: "$feature.WIND_DIRECT - 180",
        axis: "heading"
      }]
    },
    labelingInfo: [
      { min: 0, max: 67.5, color: "#4c82c4" },
      { min: 67.5, max: 157.5, color: "#6c4cc4" },
      { min: 157.5, max: 247.5, color: "#ae4cc4" },
      { min: 247.5, max: 337.5, color: "#c44c88" },
      { min: 337.5, max: 360, color: "#4c82c4" }
    ].map(windClass => ({
      labelExpressionInfo: { expression: windArcade },
      where: "WIND_DIRECT > " + windClass.min + " AND WIND_DIRECT <= " + windClass.max,
      labelPlacement: "above-center",
      symbol: {
        type: "label-3d",
        symbolLayers: [{
          type: "text",
          material: { color: "white" },
          halo: { color: windClass.color, size: 1 },
          size: 12
        }]
      }
    })),
    opacity: 1
  }

  return (
    <div style={{width:'100vw',height:'100vh'}}>
      <Scene
        mapProperties={{ basemap: 'topo' }}
        viewProperties={{
          camera: {
            position: {
              x: -10930027,
              y: 5458284,
              z: 126663,
              spatialReference: { wkid: 102100 }
            },
            heading: 63,
            tilt: 73
          },
          constraints: { altitude: { min: 100000 } }
        }}
      >
        <FeatureLayer properties={featureLayerProperties} />
      </Scene>
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

export const multilineLabels = () => {
  const expression = `
      var DEG = $feature.WIND_DIRECT;
      var SPEED = $feature.WIND_SPEED;
      var DIR = When( SPEED == 0, null,
        (DEG < 22.5 && DEG >= 0) || DEG > 337.5, 'N',
        DEG >= 22.5 && DEG < 67.5, 'NE',
        DEG >= 67.5 && DEG < 112.5, 'E',
        DEG >= 112.5 && DEG < 157.5, 'SE',
        DEG >= 157.5 && DEG < 202.5, 'S',
        DEG >= 202.5 && DEG < 247.5, 'SW',
        DEG >= 247.5 && DEG < 292.5, 'W',
        DEG >= 292.5 && DEG < 337.5, 'NW', null );
      var WIND = SPEED + ' mph ' + DIR;
      var TEMP = Round($feature.TEMP) + '° F';
      var RH = $feature.R_HUMIDITY + '% RH';
      var NAME = $feature.STATION_NAME;
      var labels = [ NAME, TEMP, WIND, RH ];
      return Concatenate(labels, TextFormatting.NewLine);
    `
  const featureLayerProperties = {
    url: 'https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/weather_stations_010417/FeatureServer/0',
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-marker",
        color: [75, 75, 75, 0.7],
        size: 4,
        outline: null
      }
    },
    labelingInfo: [{
      labelExpressionInfo: { expression },
      labelPlacement: "center-right",
      minScale: 250000000,
      symbol: {
        type: "text", // autocasts as new TextSymbol()
        font: {
          size: 9,
          family: "Noto Sans"
        },
        horizontalAlignment: "left",
        color: "#2b2b2b"
      }
    }]
  }
  return (
    <div style={{width:'100vw',height:'100vh'}}>
      <WebMap
        id="372b7caa8fe340b0a6300df93ef18a7e"
        viewProperties={{
          center: [-117.842, 33.799],
          zoom: 10
        }}
      >
        <FeatureLayer properties={featureLayerProperties} />
      </WebMap>
    </div>
  )
}

export const addMultipleLabelClassesToALayer = () => {
  const minScale = 2500000
  const createTextSymbol = color => ({
    type: "text",
    font: { size: 12, weight: "bold" },
    color: "white",
    haloColor: color,
    haloSize: 1
  })

  const nameClass = {
    labelPlacement: "below-right",
    labelExpressionInfo: { expression: '$feature.STATION_NAME' },
    minScale: minScale
  }
  nameClass.symbol = createTextSymbol("black")

  const humidityClass = {
    labelExpressionInfo: { expression: `$feature.R_HUMIDITY + '% RH'` },
    labelPlacement: "below-left",
    minScale: minScale
  }
  humidityClass.symbol = createTextSymbol("#c17c47")

  const windClass = {
    labelExpressionInfo: {
      expression: `var DEG = $feature.WIND_DIRECT;
      var SPEED = $feature.WIND_SPEED;
      var DIR = When( SPEED == 0, "",
        (DEG < 22.5 && DEG >= 0) || DEG > 337.5, "N",
        DEG >= 22.5 && DEG < 67.5, "NE",
        DEG >= 67.5 && DEG < 112.5, "E",
        DEG >= 112.5 && DEG < 157.5, "SE",
        DEG >= 157.5 && DEG < 202.5, "S",
        DEG >= 202.5 && DEG < 247.5, "SW",
        DEG >= 247.5 && DEG < 292.5, "W",
        DEG >= 292.5 && DEG < 337.5, "NW", "" );
      return SPEED + " mph " + DIR;`
    },
    labelPlacement: "above-right",
    minScale: minScale
  }
  windClass.symbol = createTextSymbol("#3ba53f")

  const tempArcade = `Round($feature.TEMP) + '° F';`
  const highTempClass = {
    labelExpressionInfo: { expression: tempArcade },
    labelPlacement: "above-left",
    where: "TEMP > 32"
  }
  highTempClass.symbol = createTextSymbol("#f47742")

  const lowTempClass = {
    labelExpressionInfo: { expression: tempArcade },
    labelPlacement: "above-left",
    where: "TEMP <= 32"
  }
  lowTempClass.symbol = createTextSymbol("#4792c1")

  const featureLayerProperties = {
    url: 'https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/weather_stations_010417/FeatureServer/0',
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-marker",
        color: [255, 255, 255, 0.6],
        size: 4,
        outline: { color: [0, 0, 0, 0.4], width: 0.5 }
      }
    },
    labelingInfo: [nameClass, humidityClass, lowTempClass, highTempClass, windClass]
  }
  return (
    <div style={{width:'100vw',height:'100vh'}}>
      <WebMap
        id="f0e331d7986041ba8267298f579b3afe"
        viewProperties={{
          center: [-117.842, 33.799],
          zoom: 10
        }}
      >
        <FeatureLayer properties={featureLayerProperties} />
        <Bookmarks position="top-right" />
      </WebMap>
    </div>
  )
}

export const filterFeaturesByAttributes = () => {
  let map, view, layer
  const featureLayerProperties = {
    portalItem: { id: "f9e348953b3848ec8b69964d5bceae02" },
    outFields: ["SEASON"]
  }
  const seasons = ['Winter', 'Spring', 'Summer', 'Fall']
  const filterBySeason = season => {
    view.whenLayerView(layer).then(floodLayerView => {
      floodLayerView.filter = { where: `Season = '${season}'` }
    })
  }
  const onExpand = expanded => {
    view.whenLayerView(layer).then(floodLayerView => {
      if (!expanded) {
        floodLayerView.filter = null
      }
    })
  }

  return (
    <div style={{width:'100vw',height:'100vh'}}>
      <Map
        mapProperties={{ basemap: "gray-vector" }}
        viewProperties={{
          center: [-98, 40],
          zoom: 4
        }}
        onLoad={(m, v) => {
          map = m
          view = v
        }}
      >
        <FeatureLayer properties={featureLayerProperties} onLoad={fl => layer = fl} />
        <Widget position="top-right">
          <div class="esri-widget" style={{padding:'10px'}}>
            <div style={{fontSize:'20pt',fontWeight:60,paddingBottom:'10px'}}>Flash Floods by Season</div>
            <div>Flash Flood Warnings (2002 - 2012)</div>
          </div>
        </Widget>
        <Expand
          properties={{
            expandIconClass: "esri-icon-filter",
            group: "top-left"
          }}
          position="top-left"
          className="esri-widget"
          onExpand={onExpand}
        >
          {seasons.map(season => 
            <div
              style={{
                width: '100%',
                padding: '12px',
                textAlign: 'center',
                verticalAlign: 'baseline',
                cursor: 'pointer',
                height: '40px'
              }}
              onClick={_ => filterBySeason(season)}
            >{season}</div>
          )}
        </Expand>
      </Map>
    </div>
  )
}