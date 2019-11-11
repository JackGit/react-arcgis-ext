import PropTypes from 'prop-types'
import { widgetHoc } from '../hoc'

const Editor = widgetHoc('esri/widgets/Editor')

Editor.propTypes = {
  properties: PropTypes.object,
  position: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
}

export default Editor