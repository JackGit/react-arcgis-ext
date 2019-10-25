import React, { Component, Children } from 'react'
import PropTypes from 'prop-types'
import { loadModules } from 'esri-module-loader'
import Graphic from '../../graphic/Graphic'

/**
 * usage:
 *  <FeatureLayer featureLayerProperties={}>
 *    <Graphic />
 *    <Graphic />
 *  </FeatureLayer>
 */
class FeatureLayer extends Component {

  constructor (props) {
    super(props)
    this.state = {
      layer: null, // need to put layer as state, so once layer is created, render would run again
      selectedKeys: [],
      editingKeys: []
    }
  }

  static getDerivedStateFromProps (props, prevState) {
    const { prevProps } = prevState
    const newState = { prevProps: props }
    const needSync = name => (!prevProps && name in props) || (prevProps && prevProps[name] !== props[name])

    // ================ selectedKeys =================
    if (props.selectable) {
      if (needSync('selectedKeys')) {
        newState.selectedKeys = props.selectedKeys
      }
    }

    // ================ editingKeys =================
    if (props.editable) {
      if (needSync('editingKeys')) {
        newState.editingKeys = props.editingKeys
      }
    }

    return newState
  }

  componentDidMount () {
    loadModules([
      'FeatureLayer'
    ]).then(({ FeatureLayer }) => {
      const { properties, onLoad } = this.props
      const layer = new FeatureLayer(properties)

      this.addLayer(layer)
      this.setState({ layer }) 
      this.bindEvents()
      layer.load().then(_ => onLoad && onLoad(layer))
    })
  }

  componentWillUnmount () {
    this.unbindEvents()
    this.removeLayer(this.state.layer)
  }

  shouldComponentUpdate (nextProps, nextState) {
    // only when layer is created, this component should be updated
    // or, this to ensure state.layer always has value in componentDidUpdate
    if (!nextState.layer) {
      return false
    } else {
      return true
    }
  }

  componentDidUpdate (prevProps) {
    const { properties } = this.props
    const { layer } = this.state
    const needSync = name => (!prevProps && name in this.props) || (prevProps && prevProps[name] !== this.props[name])

    // update graphicsLayer properties
    if (needSync('properties')) {
      // TODO properties should be considered as static props, set properties automatically would cause featureLayer issue
      // like, source been reset, you need to apply adds again
      // layer.set(properties)
    }
  }

  bindEvents () {
    const { view } = this.props
    const _hitted = results => results.filter(r => r.graphic.layer === this.state.layer).map(r => r.graphic)

    this.eventHandlers = [
      view.on('click', e => {
        view.hitTest(e).then(({ results }) => {
          this.clickHandler(_hitted(results), e)
        })
      }),
      view.on('pointer-move', e => {
        view.hitTest(e).then(({ results }) => {
          this.pointerMoveHandler(_hitted(results), e)
        })
      })
    ]
    
  }

  unbindEvents () {
    this.eventHandlers.forEach(h => h.remove())
  }

  /**
   * Only update the value which is not in props
   */
  setUncontrolledState = (state) => {
    let needSync = false
    const newState = {}

    Object.keys(state).forEach(name => {
      if (name in this.props) {
        return
      }
      needSync = true
      newState[name] = state[name]
    })

    if (needSync) {
      this.setState(newState)
    }
  }

  addLayer (layer) {
    const { map, parentLayer } = this.props
    if (parentLayer) {
      console.log('FeatureLayer parentLayer.add(layer)')
      parentLayer.add(layer)
    } else {
      console.log('FeatureLayer map.add(layer)')
      map.add(layer)
    }
  }

  removeLayer (layer) {
    const { map, parentLayer } = this.props
    if (parentLayer) {
      parentLayer.remove(layer)
    } else {
      map.remove(layer)
    }
  }

  clickHandler = (hittedGraphics = [], event) => {
    const { onSelect } = this.props
    const selectedKeys = hittedGraphics.map(g => g.attributes.key)

    this.setUncontrolledState({ selectedKeys })
    onSelect && onSelect(selectedKeys, { graphics: hittedGraphics, event })
  }

  pointerMoveHandler = (hittedGraphics = [], event) => {
    const { view, onHover, hoverCursor } = this.props
    const keys = hittedGraphics.map(g => g.attributes.key)
    if (hittedGraphics.length > 0) {
      view.cursor = hoverCursor
      onHover && onHover(keys, { graphics: hittedGraphics, event })
    } else {
      view.cursor = 'auto'
    }
  }

  editHandler = event => {
    const { onEdit } = this.props
    onEdit && onEdit(event)
  }

  render () {
    const { view, children = [], selectable, editable, hoverable } = this.props
    const { layer, editingKeys, selectedKeys } = this.state

    if (layer) {
      return Children.map(children, child => {
        const graphicKey = Graphic.key(child.props.properties || child.props.json)
        return React.cloneElement(child, {
          view,
          layer,

          selectable,
          selected: selectedKeys.includes(graphicKey),

          editable,
          editing: editingKeys.includes(graphicKey),
          onEdit: this.editHandler,

          hoverable
        })
      })
    } else {
      return null
    }
  }
}

FeatureLayer.propTypes = {
  map: PropTypes.object.isRequired,
  view: PropTypes.object.isRequired,
  parentLayer: PropTypes.object,
  properties: PropTypes.object,
  onLoad: PropTypes.func,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element
  ]), 

  selectable: PropTypes.bool.isRequired,
  selectedKeys: PropTypes.array,
  onSelect: PropTypes.func,

  hoverable: PropTypes.bool.isRequired,
  hoverCursor: PropTypes.string,
  onHover: PropTypes.func,

  editable: PropTypes.bool,
  editingKeys: PropTypes.array,
  onEdit: PropTypes.func
}

FeatureLayer.defaultProps = {
  children: [],
  properties: null,
  selectable: true,
  hoverable: true,
  hoverCursor: 'pointer',
  editable: true
}

export default FeatureLayer