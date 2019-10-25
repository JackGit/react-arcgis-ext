import React, { Component } from 'react'
import { loadModules } from 'esri-module-loader'

export const widgetHoc = (widgetModulePath) => {
  return class extends Component {
  
    widgetInstance = null
  
    componentDidMount () {
      loadModules([{ name: 'Widget', path: widgetModulePath }]).then(({ Widget }) => {
        const { view, properties = {} } = this.props
        this.widgetInstance = new Widget({ ...properties, view })
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
      return null
    }
  }
}