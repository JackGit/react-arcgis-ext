import { loadModules } from 'esri-module-loader'
import * as geometryUtils from '../../utils/geometry'


/**
 * due to the reason that highlight GraphicsLayer is only support in SceneView.
 *       https://developers.arcgis.com/javascript/latest/api-reference/esri-views-layers-GraphicsLayerView.html#highlight} graphic 
 * 
 * so here gives an common solution for both FeatureLayer and GraphicsLayer
 */
const createHighlightGrpahic = (graphic, { color, fillOpacity, haloOpacity }) => {
  const clone = graphic.clone()  
  const geoType = geometryUtils.type(graphic.geometry)
  switch (geoType) {
    case 'point':
    case 'multipoint':
    case 'polygon':
      color.a = fillOpacity
      clone.symbol.color = color
      clone.symbol.outline && (clone.symbol.outline.color = color)
      break;
    case 'polyline':
      clone.symbol.color = color
      break;
  }
  return clone
}

export const highlight = (layerView, targets = [], options) => {
  const { layer, view } = layerView
  const isGraphicsLayerView = layer.type === 'graphics'
  if (!isGraphicsLayerView) { // featureLayerView
    return layerView.highlight(targets)
  }

  const mode = (options && options.mode) || 'symbol' // visibiliy | symbol
  const { highlightOptions } = view
  const highlightGraphics = targets.map(t => createHighlightGrpahic(t, highlightOptions))

  if (mode === 'symbol') {
    const originSymbolMapping = {}
    targets.forEach((t, i) => {
      originSymbolMapping[i] = t.clone().symbol
      t.symbol = highlightGraphics[i].symbol
    })
    return {
      remove: () => {
        targets.forEach((t, i) => {
          t.symbol = originSymbolMapping[i]
        })
      }
    }
  } else {
    targets.forEach(t => t.visible = false)
    layer.addMany(highlightGraphics)
    return {
      remove: () => {
        layer.removeMany(highlightGraphics)
        targets.forEach(t => t.visible = true)
      }
    }
  }
}

export const json2Properties = json => {
  return createGraphic({ json }).then(({ attributes, geometry, symbol }) => ({ attributes, geometry, symbol }))
}

export const addGraphic = (layer, graphic) => {
  if (layer.type === 'graphics') {
    layer.add(graphic)
  } else if (layer.type === 'feature') {
    layer.applyEdits({
      addFeatures: [graphic]
    })
  }
}

export const removeGraphic = (layer, graphic) => {
  if (layer.type === 'graphics') {
    layer.remove(graphic)
  } else if (layer.type === 'feature') {
    layer.applyEdits({
      deleteFeatures: [graphic]
    })
  }
}

export const updateGraphic = (layer, graphic, properties) => {
  graphic.set(properties)
  if (layer.type === 'feature') {
    layer.applyEdits({
      updateFeatures: [graphic]
    })
  }
}

export const hideGraphic = (layer, graphic) => {
  if (layer.type === 'graphics') {
    graphic.visible = false
  } else if (layer.type === 'feature') {
    const id = graphic.attributes[layer.objectIdField]
    layer.definitionExpression = `${layer.objectIdField} <> ${id}`
  }
}

export const showGraphic = (layer, graphic) => {
  if (layer.type === 'graphics') {
    graphic.visible = true
  } else if (layer.type === 'feature') {
    layer.definitionExpression = null
  }
}

export const replaceGraphic = (layer, graphic, oldGraphic) => {
  if (layer.type === 'graphics') {
    layer.remove(oldGraphic)
    layer.add(graphic)
  } else if (layer.type === 'feature') {
    layer.applyEdits({
      deleteFeatures: [oldGraphic],
      addFeatures: [graphic]
    })
  }
}

export const createGraphic = ({ properties, json }) => {
  return loadModules([
    'esri/Graphic'
  ]).then(({ Graphic }) => {
    if (properties) {
      return new Graphic(properties)
    } else if (json) {
      return Graphic.fromJSON(json)
    } else {
      throw new Error('properties and json cannot to be empty at the same time')
    }
  })
}