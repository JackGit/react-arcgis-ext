import EventEmitter from 'eventemitter3'
import { loadModules } from 'esri-module-loader'
import * as utils from './utils'

class BaseState {
  constructor (stateMananger) {
    this.stateManager = stateMananger
    this.key = 'base'
  }
  init () {}
  destroy () {}
  update () {}
  select () {}
  deselect () {}
  edit () {}
  quitEdit () {}
}

class Initializing extends BaseState {
  constructor (props) {
    super(props)
    this.key = 'initializing'
  }
}

class Normal extends BaseState {
  constructor (props) {
    super(props)
    this.key = 'normal'
    this.init()
  }

  update (properties) {
    const { layer, graphic } = this.stateManager
    utils.updateGraphic(layer, graphic, properties)
  }

  select () {
    this.stateManager.changeState('selected')
  }

  edit () {
    this.stateManager.changeState('editing')
  }
}

class Selected extends BaseState {

  constructor (props) {
    super(props)
    this.key = 'selected'
    this.highlightHandler = null
    this.symbolProperty = null
    this.init()
  }

  init () {
    const { view, layer, graphic } = this.stateManager
    view.whenLayerView(layer).then(layerView => {
      this.highlightHandler = utils.highlight(layerView, [graphic])
    })
  }

  destroy () {
    if (this.highlightHandler) {
      this.highlightHandler.remove()
      this.highlightHandler = null
    }

    // if stored updated symbol, restore it
    if (this.symbolProperty) {
      const { layer, graphic } = this.stateManager
      utils.updateGraphic(layer, graphic, { symbol: this.symbolProperty })
      this.symbolProperty = null
    } 
  }
  
  update (properties) {
    const { layer, graphic } = this.stateManager
    // if trying to change symbol, it will be stored and updated with this symbol after exit this state
    // in this state, symbol won't be change coz it uses the highlight symbol
    if ('symbol' in properties) {
      this.symbolProperty = properties.symbol
    }
    const { geometry, attributes } = properties
    utils.updateGraphic(layer, graphic, { geometry, attributes })
  }

  deselect () {
    this.stateManager.changeState('normal')
  }

  edit () {
    this.stateManager.changeState('editing')
  }
}

// graphic 发生变化时，需要更新 tempGraphicsLayer 中的 clonedGraphic
class Editing extends BaseState {
  constructor (props) {
    super(props)
    this.key = 'editing'
    this.clonedGraphic = null
    this.tempGraphicsLayer = null
    this.symbolProperty = null
    this.sketch = null
    this.editing = false
    this.destroying = false
    this.selected = false
    this.init()
  }

  init () {
    // new sketch
    loadModules([
      'esri/widgets/Sketch/SketchViewModel',
      'esri/layers/GraphicsLayer'
    ]).then(({ SketchViewModel, GraphicsLayer }) => {
      if (this.destroying) {
        return // before modules loaded, destroy might be called
      }

      const { view, graphic, layer } = this.stateManager
      const tempGraphicsLayer = new GraphicsLayer()
      const clonedGraphic = graphic.clone()
      view.map.add(tempGraphicsLayer)
      tempGraphicsLayer.add(clonedGraphic)
      utils.hideGraphic(layer, graphic)

      const sketch = new SketchViewModel({
        view,
        layer: tempGraphicsLayer,
        updateOnGraphicClick: false,
        defaultUpdateOptions: { tool: 'reshape' }
      })

      // have to do the update async, otherwise sketch would not able to see clonedGraphic added into the layer
      setTimeout(() => sketch.update([clonedGraphic]), 0)
      sketch.on(['update', 'undo', 'redo'], this.sketchEventHandler)

      this.tempGraphicsLayer = tempGraphicsLayer
      this.clonedGraphic = clonedGraphic
      this.sketch = sketch
    })
  }

  destroy () {
    // destroy sketch, clonedGraphic, tempGraphicsLayer
    const { view, graphic, layer } = this.stateManager
    this.destroying = true

    if (layer.type === 'feature') { // need to apply update from clonedGraphic to feature
      utils.showGraphic(layer, graphic) // need to restore the hidden feature firts, otherwise not able to do the update later
      utils.updateGraphic(layer, graphic, { geometry: this.clonedGraphic.geometry }) // update the feature the sketched geometry
    }

    // if stored updated symbol, restore it
    if (this.symbolProperty) {
      utils.updateGraphic(layer, graphic, { symbol: this.symbolProperty })
    }

    this.tempGraphicsLayer.remove(this.clonedGraphic)
    view.map.remove(this.tempGraphicsLayer)
    this.sketch.cancel()

    this.sketch = null
    this.tempGraphicsLayer = null
    this.clonedGraphic = null
    this.symbolProperty = null
  }

  sketchEventHandler = e => {
    const graphic = e.graphics[0]
    if (e.state === 'active' && e.toolEventInfo && e.toolEventInfo.type.endsWith('-start')) {
      this.editing = true
    } else if (e.toolEventInfo && e.toolEventInfo.type.endsWith('-stop')) {
      this.editing = false
    }

    if (this.editing) {
      // emit only when there is sketch update happened (geometry updated)
      this.stateManager.emit('edit', { graphic, event: e })
    }
  }

  update (properties) {
    const { layer, graphic } = this.stateManager
    // if trying to change symbol, it will be stored and updated with this symbol after exit this state
    // in this state, symbol won't be change coz it uses the highlight symbol
    if ('symbol' in properties) {
      this.symbolProperty = properties.symbol
    }

    // update origin graphic
    const { geometry, attributes } = properties
    utils.updateGraphic(layer, graphic, { geometry, attributes })

    // update clonedGraphic
    if (this.editing) {
      // if the update is caused by sketch.update, then ignore the clonedGraphic update
    } else {
      // if the update is caused from outside (not from the sketch update), need to update clonedGraphic, and make it sketch update mode again
      this.sketch.cancel()
      utils.updateGraphic(this.tempGraphicsLayer, this.clonedGraphic, { geometry, attributes })
      this.sketch.update([this.clonedGraphic])
    }
  }

  select () {
    this.selected = true
  }

  deselect () {
    this.selected = false
  }

  quitEdit () {
    this.stateManager.changeState(this.selected ? 'selected' : 'normal')
  }
}

/**
 * events: 
 *    select: ({ e, hit }) => {}
 *    hover: ()
 *    edit
 */
export default class StateManager extends EventEmitter {
  constructor ({ view, layer }) {
    super()
    this.view = view
    this.layer = layer
    this.graphic = null
    this.destroying = false
    this.state = new BaseState()
  }

  init ({ properties, json }) {
    this.changeState('initializing')
    utils.createGraphic({ properties, json }).then(graphic => {
      if (this.destroying) {
        return
      }

      this.graphic = graphic
      utils.addGraphic(this.layer, graphic)
      this.changeState('normal')
    })
  }

  destroy () {
    this.destroying = true
    this.state.destroy()
    utils.removeGraphic(this.layer, this.graphic)
  }

  changeState (stateKey) {
    if (this.state) {
      this.prevState = this.state.key
      this.state.destroy()
    }

    const StateClass = ({
      'initializing': Initializing,
      'normal': Normal,
      'selected': Selected,
      'editing': Editing
    })[stateKey]
    console.log(`changeState ======> ${this.state.key} from to ${stateKey}`, this.graphic)

    this.state = new StateClass(this)
  }

  /***** actions *****/
  update ({ properties, json }) {
    if (properties) {
      this.state.update(properties)
    } else {
      utils.json2Properties(json).then(properties => {
        this.state.update(properties)
      })
    }
  }

  select () {
    this.state.select()
  }
  
  deselect () {
    this.state.deselect()
  }

  edit () {
    this.state.edit()
  }

  quitEdit () {
    this.state.quitEdit()
  }
}