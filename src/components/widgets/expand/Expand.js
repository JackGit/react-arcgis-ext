import React, { Component, Children } from 'react'
import PropTypes from 'prop-types'
import { loadModules } from 'esri-module-loader'

class Expand extends Component {
  
  state = {
    widgetInstance: null,
    childWidgetInstance: null
  }

  contentNode = null

  componentDidMount () {
    loadModules(['esri/widgets/Expand']).then(({ Expand }) => {
      const { view, properties = {}, onExpand, onLoad, widgetContent } = this.props
      const widgetInstance = new Expand({
        ...properties,
        content: widgetContent ? null : this.contentNode,
        view
      })
      widgetInstance.watch('expanded', () => {
        onExpand && onExpand(widgetInstance.expanded)
      })
      
      this.add(widgetInstance)
      this.setState({ widgetInstance })
      onLoad && onLoad(widgetInstance)
    })
  }

  componentWillUnmount () {
    if (this.state.widgetInstance) {
      this.remove(this.state.widgetInstance)
    }
  }

  componentDidUpdate () {
    const { widgetContent } = this.props
    const { childWidgetInstance, widgetInstance } = this.state
    if (widgetContent && widgetInstance && childWidgetInstance) {
      widgetInstance.content = childWidgetInstance
    }
  }

  add (widgetInstance) {
    const { view, position } = this.props
    view.ui.add(widgetInstance, position)
  }

  remove (widgetInstance) {
    this.props.view.ui.remove(widgetInstance)
  }

  render () {
    const { children, widgetContent, ...props } = this.props
    if (widgetContent) {
      const child = Children.only(children)
      return React.cloneElement(child, {
          view: props.view,
          add: () => {},
          remove: () => {},
          onLoad: childWidgetInstance => {
            this.setState({ childWidgetInstance })
            child.props.onLoad && child.props.onLoad(childWidgetInstance)
          }
        })
    } else {
      return <div ref={c => this.contentNode = c}>{children}</div>
    }
  }
}

Expand.propTypes = {
  properties: PropTypes.object,
  position: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onExpand: PropTypes.func,
  onLoad: PropTypes.func,
  widgetContent: PropTypes.bool
}

export default Expand