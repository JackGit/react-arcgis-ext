import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { loadModules } from 'esri-module-loader'

class Expand extends Component {
  
  widgetInstance = null
  contentNode = null

  componentDidMount () {
    loadModules(['esri/widgets/Expand']).then(({ Expand }) => {
      const { view, properties = {}, onExpand } = this.props
      this.widgetInstance = new Expand({
        content: this.contentNode,
        ...properties,
        view
      })
      this.widgetInstance.watch('expanded', () => {
        onExpand && onExpand(this.widgetInstance.expanded)
      })
      
      this.add()
    })
  }

  componentWillUnmount () {
    if (this.widgetInstance) {
      this.remove()
    }
  }

  add () {
    const { view, position } = this.props
    view.ui.add(this.widgetInstance, position)
  }

  remove () {
    this.props.view.ui.remove(this.widgetInstance)
    this.widgetInstance = null
  }

  render () {
    const { children, ...props } = this.props
    return (
      <div ref={d => this.contentNode = d} {...props}>
        {children}
      </div>
    )
  }
}

Expand.propTypes = {
  properties: PropTypes.object,
  position: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onExpand: PropTypes.func
}

export default Expand