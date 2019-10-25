import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Widget extends Component {

  domNode = null

  componentDidMount () {
    this.add()
  }

  componentWillUnmount () {
    this.remove()
  }

  add () {
    const { view, position } = this.props
    view.ui.add(this.domNode, position)
  }

  remove () {
    this.props.view.ui.remove(this.domNode)
    this.domNode = null
  }

  render () {
    return <div ref={d => this.domNode = d}>{this.props.children}</div>
  }
}

Widget.propTypes = {
  children: PropTypes.node,
  position: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
}

export default Widget