import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { loadModules } from 'esri-module-loader'

export const widgetHoc = (widgetModulePath) => {
  class WC extends Component {
  
    widgetInstance = null
  
    componentDidMount () {
      loadModules([{ name: 'Widget', path: widgetModulePath }]).then(({ Widget }) => {
        const { view, properties = {}, onLoad } = this.props
        this.widgetInstance = new Widget({ ...properties, view })
        this.add()
        onLoad && onLoad(this.widgetInstance)
      })
    }
  
    componentWillUnmount () {
      if (this.widgetInstance) {
        this.remove()
      }
    }
  
    add () {
      const { view, position, add } = this.props
      if (add) { // customized add function
        add(this.widgetInstance, position)
      } else {
        view.ui.add(this.widgetInstance, position)
      }
    }
  
    remove () {
      const { view, remove } = this.props
      if (remove) { // customized remove function
        remove(this.widgetInstance)
      } else {
        view.ui.remove(this.widgetInstance)
      }      
      this.widgetInstance = null
    }
  
    render () {
      return null
    }
  }

  WC.propTypes = {
    view: PropTypes.object,
    properties: PropTypes.object,
    add: PropTypes.func,
    remove: PropTypes.func,
    onLoad: PropTypes.func
  }

  return WC
}