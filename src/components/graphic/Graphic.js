import { Component } from 'react'
import PropTypes from 'prop-types'
import StateManager from './state'

/**
 * usage:
 *  <GraphicsLayer>
      <Graphic key="" json={} />
      <Graphic key="" properties={} />
    </GraphicsLayer>
 */
class Graphic extends Component {
  constructor (props) {
    super(props)
    this.stateManager = null
  }

  componentDidMount () {
    const { view, layer, properties, json } = this.props
    this.stateManager = new StateManager({ view, layer })
    this.stateManager.init({ properties, json })
    this.stateManager.on('edit', this.editHandler)
  }

  componentWillUnmount () {
    this.stateManager.destroy()
    this.stateManager = null
  }

  componentDidUpdate (prevProps) {
    const { properties, json, selected, selectable, editable, editing } = this.props
    const needSync = name => (!prevProps && name in this.props) || (prevProps && prevProps[name] !== this.props[name])
    
    // graphic instance create or update
    if (needSync('json') || needSync('properties')) {
      console.log('needsync json or pro')
      this.stateManager.update({ properties, json })
    }

    // process selected
    if (selectable) {
      if (/* needSync('selected') && */selected) {
        this.stateManager.select()
      } else if (needSync('selected') && !selected) {
        this.stateManager.deselect()
      }
    }

    // edit
    if (editable) {
      if (needSync('editing')) {
        if (editing) {
          this.stateManager.edit()
        } else {
          this.stateManager.quitEdit()
        }
      }
    }
  }

  editHandler = ({ graphic, event }) => {
    const { onEdit } = this.props
    onEdit && onEdit({ graphic, event, key: Graphic.key({ properties: graphic }) })
  }

  render () {
    console.log('Graphic.render', this)
    return null
  }
}

Graphic.propTypes = {
  // construction related
  view: PropTypes.object.isRequired,
  layer: PropTypes.object.isRequired,
  properties: PropTypes.object, // properties has higher priority than json
  json: PropTypes.object,

  // hover related
  hoverable: PropTypes.bool,

  // select related
  selectable: PropTypes.bool,
  selected: PropTypes.bool,

  // edit related
  editable: PropTypes.bool,
  editing: PropTypes.bool,
  onEdit: PropTypes.func
}

Graphic.defaultProps = {
  hoverable: true,

  selectable: true,
  selected: false,

  editable: true,
  editing: false,
  onEdit: null
}

const KEY_ATTRIBUTE = 'key'
Graphic.keyAttribute = KEY_ATTRIBUTE

export const config = ({ keyAttribute }) => {
  Graphic.keyAttribute = keyAttribute
}

export const key = (graphic) => {
  const attributes = graphic.attributes || {}
  return attributes[Graphic.keyAttribute]
}

Graphic.config = config
Graphic.key = key

export default Graphic