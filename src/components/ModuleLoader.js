import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { loadModules } from 'esri-module-loader'
import { ModulesProvider } from './providers/ModulesProvider'

class ModuleLoader extends Component {
  state = {
    status: 'loading',
    modules: null
  }

  componentDidMount () {
    loadModules(this.props.modules).then(modules => {
      this.setState({ modules, status: 'success' })
    }).catch(_ => {
      this.setState({ modules: null, status: 'error' })
    })
  }

  render () {
    const { children } = this.props
    return (
      <ModulesProvider value={this.state}>
        {children}
      </ModulesProvider>
    )
  }
}

ModuleLoader.propTypes = {
  modules: PropTypes.array
}

export default ModuleLoader