import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { loadModules } from 'esri-module-loader'

class Search extends Component {

  search = null

  componentDidMount () {
    loadModules([
      'esri/widgets/Search'
    ]).then(({ Search }) => {
      const { view, properties = {} } = this.props
      this.search = new Search({ ...properties, view })
      this.add()
    })
  }

  componentWillUnmount () {
    if (this.search) {
      this.remove()
    }
  }

  add () {
    const { view, position } = this.props
    view.ui.add(this.search, position)
  }

  remove () {
    this.props.view.ui.remove(this.search)
    this.search = null
  }

  render () {
    return null
  }
}

Search.propTypes = {
  properties: PropTypes.object,
  position: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
}

export default Search