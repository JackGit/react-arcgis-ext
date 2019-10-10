import React, { Component, Children } from 'react'
import PropTypes from 'prop-types'
import { loadModules } from 'esri-module-loader'
import Graphic from '../../graphic/Graphic'

const createLayer = properties => {
  return loadModules(['esri/layers/GraphicsLayer']).then(({ GraphicsLayer }) => new GraphicsLayer(properties))
}

class GraphicsLayer extends Component {

  constructor (props) {
    super(props)
    this.state = {
      layer: null,
      selectedKeys: [],
      editingKeys: []
    }
    this.hoverKeys = []
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
    const { properties, map, onLoad } = this.props
    createLayer(properties).then(layer => {
      this.setState({ layer })
      map.add(layer)
      this.bindEvents()
      onLoad && onLoad(layer)
    })
  }

  componentWillUnmount () {
    this.unbindEvents()
    this.props.map.remove(this.state.layer)
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
      layer.set(properties)
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

GraphicsLayer.propTypes = {
  map: PropTypes.object.isRequired,
  view: PropTypes.object.isRequired,
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

GraphicsLayer.defaultProps = {
  children: [],
  properties: null,
  selectable: true,
  hoverable: true,
  hoverCursor: 'pointer',
  editable: true
}

export default GraphicsLayer