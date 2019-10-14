import { Component } from 'react'

export default class DataLoader extends Component {
  state = {
    data: null
  }

  componentDidMount() {
    this.props.load().then(data => {
      console.log('DataLoader', data)
      this.setState({ data })
    })
  }

  render () {
    const { data } = this.state
    if (!data) {
      return null
    }
    return this.props.children(data)
  }
}
